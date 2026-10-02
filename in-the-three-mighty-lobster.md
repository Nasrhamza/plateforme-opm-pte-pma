# Simplified ETL + Unified FastAPI Backend — Graduation Project Plan

## Context

This is a graduation project — favor **clarity over scope**. The goal is to demonstrate solid BI fundamentals (medallion architecture, conformed dimensions, dimensional grain, persona-aligned data marts) without over-engineering.

There are three source applications (Node/Mongo): **OPM** (helpdesk/contracts/tickets), **PMA** (projects/tasks/ratings), **PTE** (HR/leaves/vehicles/rooms/labs). Same physical employee can appear in all three with no shared key.

Two reporting components exist today and **must be consolidated**:
- `reporting-fastapi/` — FastAPI: ETL extractors, KPI registry, `/metrics` query engine, APScheduler. **No auth, no users, no reports CRUD, no PDF/XLSX, no email.** Writes everything (raw + aggregates) to MongoDB.
- `Reporting/reporting-backend/` (Node/Express) — does **auth (JWT/bcrypt), user admin, ReportConfig CRUD, scheduled email reports via node-cron + nodemailer, PDF (pdfkit) and XLSX (exceljs) exports**, and proxies KPI calls to the FastAPI sidecar.

The Node backend will be **deleted**. FastAPI will own everything end-to-end.

The current FastAPI ETL is also non-conformant with BI standards: facts mutate in place, declared dimensions are empty, no surrogate keys, no MDM across the three User collections, single-Mongo "warehouse", no marts.

**Outcome.** A single FastAPI service that:
1. Authenticates users and manages report configs (replacing Node).
2. Runs a clean medallion ETL: **bronze + silver in MongoDB, gold star schema in PostgreSQL** with one fact per source app + one executive mart + three per-app marts.
3. Generates and stores reports (PDF/XLSX/JSON), with scheduled email delivery.

---

## Architecture

```
Sources (unchanged)        Bronze + Silver (MongoDB)         Gold (PostgreSQL)
──────────────────         ─────────────────────────         ──────────────────────
OPM REST  ──┐                raw_opm_*                       core.dim_date
PMA REST  ──┼──extract──▶    raw_pma_*       ──transform──▶  core.dim_person  (MDM, SCD1)
PTE REST  ──┘                raw_pte_*                       core.dim_person_xref
                             stg_opm_*                       core.dim_client
                             stg_pma_*                       core.dim_contract
                             stg_pte_*                       core.dim_project
                                                             core.dim_vehicle / room / leave_type
                                                             core.dim_source_system
                                                             core.fact_opm_ticket
                                                             core.fact_pma_task
                                                             core.fact_pte_event

                                                             mart_exec   (CEO)
                                                             mart_opm    (Ops Director)
                                                             mart_pma    (PMO Director)
                                                             mart_pte    (HR / Resources Director)
                                                                            │
                                                                            ▼
                                                       FastAPI  /auth /users /reports /metrics
                                                       (JWT, RBAC, scheduler, PDF/XLSX, email)
```

- **Bronze (Mongo)** — raw API payloads as JSONB-equivalent docs. Replayable; never mutated.
- **Silver (Mongo)** — cleaned, typed, deduplicated. One doc per business key per source. Light DQ flags.
- **Gold (PostgreSQL)** — Kimball star: surrogate keys, conformed dims, grain-correct facts. Marts are materialized views on top.

---

## Gold Layer — PostgreSQL

### Conformed dimensions (shared across the three facts)

Full dimension set (restored from the original design — earlier reduction was an over-simplification):

| Dim | Grain | Source | Type | Notes |
|-----|-------|--------|------|-------|
| `dim_date` | 1 day | generated 2022-2030 | static | `date_sk = YYYYMMDD`, day/week/month/quarter/year, weekday, is_weekend |
| `dim_time_of_day` | 1 hour | generated 0-23 | static | `hour_sk = 0..23`, label e.g. "08:00" |
| `dim_source_system` | OPM/PMA/PTE | static seed | static | one row each |
| `dim_person` | 1 physical person | OPM + PMA + PTE users, deduped by `lower(trim(email))` | SCD1 | `person_sk`, `email_norm`, `full_name`, `gender`, `department`, `title`, `is_internal`, `is_active`, `seniority_level` |
| `dim_person_xref` | 1 (person × source-system) | MDM | static after build | `person_sk`, `source_system`, `source_user_id`, `match_method` |
| `dim_role` | 1 (source × role) | static seed | static | OPM authorities, PMA roles, PTE roles + seniority mapping |
| `dim_department` | 1 department | PTE `departement` + OPM/PMA derived | SCD1 | `department_sk`, `name`, `cost_center` |
| `dim_client` | 1 client organisation | OPM contracts ∪ PMA reclamations | SCD1 | `client_sk`, `name`, `country` |
| `dim_contract` | 1 contract | OPM `Contract` | SCD1 | `contract_sk`, `contract_number`, `type`, `nature`, `sla_hours`, `start_date`, `end_date`, `client_sk`, `commercial_person_sk` |
| `dim_site` | 1 physical site | OPM `Site` | SCD1 | `site_sk`, `name`, `address`, `lat`, `lon`, `client_sk` |
| `dim_equipment` | 1 asset | OPM `Equipment` + `EquipmentSoft` | SCD1 | `equipment_sk`, `serial_number`, `name`, `kind` (HARD/SOFT), `version`, `constructor`, `site_sk`, `contract_sk` |
| `dim_project` | 1 project | PMA `Project` | SCD1 | `project_sk`, `name`, `type`, `priority`, `team_leader_person_sk`, `client_person_sk`, `start_date`, `end_date`, `closed_at` |
| `dim_vehicle` | 1 vehicle | PTE `Vehicle` | SCD1 | `vehicle_sk`, `registration`, `model`, `type` |
| `dim_room` | 1 room | PTE `Room` | SCD1 | `room_sk`, `label`, `location`, `capacity` |
| `dim_leave_type` | 1 leave type | PTE `Leave.type` | static | `leave_type_sk`, `code`, `label`, `is_paid` |
| `dim_status` | flag combos (junk) | derived | static (populated as combos appear) | nullable columns: `ticket_status`, `task_status`, `event_status`, `is_overdue`, `is_expired`, `is_helpdesk`, `is_sla_breach`, `is_accepted`. UNIQUE across all 8 columns |
| `dim_priority` | priority levels (junk) | static seed | static | `priority_sk`, `level` (Low/Medium/High/Critical/Unknown), `weight` |

**Why one MDM (`dim_person`):** without it the CEO cannot see "developer X's tickets under PM Y" because X has three different IDs. Email match keeps it simple; `dim_person_xref` per source ID makes each fact join trivially. Manual override CSV (`seeds/person_overrides.csv`) handles edge cases.

**Why junk dims:** `dim_status` and `dim_priority` keep low-cardinality flag/string combinations off fact rows and replace filter scans with cheap dim joins. `dim_status` is populated at gold-transform time by scanning fact rows for unseen combinations and inserting them before facts.

### Facts — one per application

All facts: `BIGSERIAL` PK suffixed `_sk`, `source_id` unique business key, `source_system_sk` FK, `etl_loaded_at`. All status/flag/priority strings move into junk dims (`dim_status`, `dim_priority`).

#### `core.fact_opm_ticket` (grain = 1 ticket, accumulating snapshot)
- **FKs**: `source_system_sk`, `created_date_sk`, `created_hour_sk`, `assigned_date_sk`, `resolved_date_sk`, `closed_date_sk`, `contract_sk`, `site_sk`, `equipment_sk`, `client_person_sk`, `assigned_technician_person_sk`, `status_sk`.
- **Degenerate dim**: `ticket_number`.
- **Measures**: `time_to_assign_min`, `time_to_resolve_min`, `time_to_close_min`, `reopen_count`.

#### `core.fact_pma_task` (grain = 1 task, accumulating snapshot)
- **FKs**: `source_system_sk`, `project_sk`, `executor_person_sk` (primary), `team_leader_person_sk`, `department_sk`, `start_date_sk`, `deadline_date_sk`, `closed_date_sk`, `status_sk`, `priority_sk`.
- **Degenerate dim**: `task_ref`.
- **Measures**: `progress_pct`, `note` (task rating), `rating_weight`, `duration_days`.
- *Note*: A task can have multiple executors. The primary executor goes on the fact; a `bridge_task_executor` can be added later if needed.

#### `core.fact_pte_event` (grain = 1 workforce/resource event, transactional)
Single transactional fact unifying PTE event-style entities. Type discriminator `event_type` ∈ {`leave`, `vehicle_usage`, `room_reservation`, `vm_request`, `intervention`}.
- **FKs**: `source_system_sk`, `event_date_sk`, `event_hour_sk`, `end_date_sk`, `applicant_person_sk`, `engineer_person_sk` (nullable), `department_sk`, `vehicle_sk` (nullable), `room_sk` (nullable), `leave_type_sk` (nullable), `status_sk`.
- **Measures**: `duration_min`, `km` (nullable), `ram_gb` (nullable), `disk_gb` (nullable), `business_days` (nullable, leave only).
- *Note*: Per-type marts filter by `event_type`. `is_overdue` for tasks is derived from `deadline_date_sk < closed_date_sk` at gold-transform time (never `now()`).

---

## Data Marts (materialized views in PostgreSQL)

One mart per application + one executive mart, **all in the same warehouse DB** (`reporting`), each in its own schema.

### `mart_exec` — CEO / Executive Committee
Decisions: company-wide health, who/which app is delivering, contract renewals at risk, PM/TL performance through their team.

KPIs (all cross-app, via `dim_person` MDM):
- `exec_company_throughput` — tickets resolved + tasks closed per active-person per month.
- `exec_pm_scorecard` — per Team Leader: avg task `note`, % projects on-time, reclamation rate, and **avg ticket resolution time of engineers under that TL** (the example you gave — "CEO judges PM via developer ticket performance"). Joins `fact_pma_task.team_leader_person_sk` ↔ executor IDs ↔ `fact_opm_ticket.assigned_technician_person_sk` through `dim_person`.
- `exec_revenue_at_risk` — count of contracts ending in 90 days with SLA breaches > 0 in last quarter.
- `exec_client_health` — per client: open reclamations, SLA-breach rate, avg project rating.
- `exec_workforce_availability` — sum business-day leaves / sum work-days, by month and department.

### `mart_opm` — Operations / Helpdesk Director
KPIs from `fact_opm_ticket`:
- `opm_sla_compliance` — by contract, by month, by technician.
- `opm_mttr` / `opm_mtta` — by priority/contract type.
- `opm_first_call_resolution` — tickets closed without reopen.
- `opm_technician_load` — open + overdue tickets per technician.
- `opm_contract_health` — tickets, breaches, reclamations per contract.

### `mart_pma` — PMO / Project Director
KPIs from `fact_pma_task` + `dim_project`:
- `pma_portfolio_status` — # projects by status, weighted by priority.
- `pma_on_time_delivery` — closed before deadline / total closed.
- `pma_team_leader_score` — avg task `note` of engineers under each TL.
- `pma_engineer_productivity` — closed tasks × `rating_weight` × avg `note`, per engineer.
- `pma_overdue_index` — % overdue tasks per project.

### `mart_pte` — HR + Resources Director
KPIs from `fact_pte_event` (filter by `event_type`):
- `pte_leave_consumption` — business-days taken, by department, by leave type, by month.
- `pte_headcount_active` — distinct `is_active` persons by department (snapshot).
- `pte_vehicle_utilization` — `vehicle_usage` events: hours booked / available, km/day.
- `pte_room_occupancy` — `room_reservation` events: reserved hours / capacity-hours.
- `pte_vm_lead_time` — `vm_request`: avg granted - requested duration.
- `pte_intervention_throughput` — `intervention` events per engineer per month.

Each KPI is a single SQL view in `app/db/ddl/050_metrics_views.sql`. The FastAPI `/metrics` registry simply names the view + the optional `GROUP BY` columns.

---

## Eliminating the Node backend — FastAPI absorbs everything

The Node `reporting-backend/` provides: auth, users CRUD, `ReportConfig` CRUD, ad-hoc report run, PDF/XLSX export, scheduled email delivery, and a thin `/data/*` proxy to FastAPI. All of this moves into `reporting-fastapi/`.

### New FastAPI routers

| Router | Endpoints | Purpose |
|--------|-----------|---------|
| `app/api/routes/auth.py` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | JWT (python-jose) + bcrypt (passlib). Tokens stored client-side. |
| `app/api/routes/users.py` | `POST /users`, `GET /users`, `GET /users/export` (CSV), `PUT /users/{id}`, `DELETE /users/{id}` | Admin-only (RBAC dep). Fix the Node bug where `role` was used before destructure. |
| `app/api/routes/reports.py` | `POST /reports`, `GET /reports`, `GET /reports/{id}`, `PUT /reports/{id}`, `DELETE /reports/{id}`, `POST /reports/{id}/run`, `GET /reports/{id}/export?format=pdf\|xlsx\|json`, `GET /reports/{id}/history`, `POST /reports/_scheduler/refresh` | Owner-scoped CRUD; run dispatches to `/metrics`; export uses reportlab + openpyxl; **history is new** — each scheduled or manual run writes a `report_run` doc with the produced file path. |
| `app/api/routes/data.py` | (deleted — was a 1:1 proxy in Node; the FastAPI `/opm`, `/pma`, `/pte` routers already serve this) | — |

### New MongoDB collections (in the existing warehouse DB)
- `users` — `fullName, email (unique), password_hash, role ['admin','viewer'], isEnabled`. Plus `created_at`, `updated_at`.
- `report_configs` — same shape as Node's `ReportConfig` (kpis[], filters, schedule).
- `report_runs` — `report_id, started_at, finished_at, status, format, file_path, recipients, error?`. **New.** Gives a runnable "report history" view.
- `report_files` — stored on local disk under `var/reports/{report_id}/{run_id}.{pdf|xlsx|json}` (configurable path). Served via `GET /reports/{id}/files/{run_id}`.

### Background work
- Reuse the existing **APScheduler** in `app/etl/scheduler.py`. Add a second job-set: one job per active `report_configs` with `schedule.enabled = true`. Cron expressions: daily `0 8 * * *`, weekly `0 8 * * 1`, monthly `0 8 1 * *` — same as Node.
- On scheduler tick: `run_report → export(format) → save file → email via fastapi-mail → record `report_runs` doc → update `schedule.lastSentAt`.

### Libraries to add (`requirements.txt`)
```
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9          # for form-based login if needed
fastapi-mail>=1.4.1               # SMTP
reportlab>=4.2.0                  # PDF
openpyxl>=3.1.5                   # XLSX
pandas>=2.2.0                     # CSV export + simple aggregations
sqlalchemy>=2.0                   # PG access
psycopg[binary]>=3.2              # PG driver
```

### Env var consolidation (replace Node `.env`)
`JWT_SECRET`, `JWT_EXPIRES_IN`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`, `PG_URL`, plus existing Mongo URLs.

---

## What changes vs. the current ETL

| Issue today | Fix |
|-------------|-----|
| Facts overwrite history each run | Accumulating snapshots keyed on business key; recomputed but with deterministic measures (no `datetime.now()` in transform). |
| `dim_*` declared, never loaded | Each gold dim has a dedicated loader; `dim_date` seeded once. |
| No surrogate keys | PG `BIGSERIAL` `*_sk` columns; facts only reference `*_sk`. |
| Same person = 3 IDs | `dim_person` MDM by email + `dim_person_xref`. |
| Single Mongo "warehouse" | Bronze/silver stay in Mongo (cheap, flexible JSON). Gold star in PG — proper joins for the marts. |
| No marts | 4 marts (`mart_exec`, `mart_opm`, `mart_pma`, `mart_pte`) as materialized views. |
| KPIs hard-coded in Python dict | KPI registry points at a SQL view per KPI — adding a KPI = adding a view + a registry row. |
| Two backends, drift between them | One FastAPI service; Node deleted. |
| No reports history | `report_runs` collection + file storage. |

---

## Files

### Modify (in `D:\Git\PFE\reporting-fastapi\`)
- `app/db/connections.py` — add `pg_engine()` alongside Mongo client.
- `app/db/warehouse_schema.py` — Mongo bronze/silver index setup only; PG schema moves to DDL files.
- `app/etl/extract.py` — keep REST, write to `raw_*` Mongo collections instead of facts.
- `app/etl/transform.py` — split into `transform_silver.py` (Mongo→Mongo) and `transform_gold.py` (Mongo→PG).
- `app/etl/load.py` — PG bulk-upsert (SQLAlchemy `INSERT ... ON CONFLICT`).
- `app/etl/pipeline.py` — implement real backfill (replay from `raw_*` without REST).
- `app/etl/scheduler.py` — add report-schedule job loader.
- `app/metrics/definitions.py` — convert to registry of `(kpi_id, view_name, default_group_by)`.
- `app/metrics/query_engine.py` — execute parameterized SQL against marts.
- `app/api/routes/metrics.py`, `opm.py`, `pma.py`, `pte.py` — back by PG, unchanged surface.
- `app/core/security.py` — full JWT + bcrypt + `Depends(get_current_user)` + `Depends(require_admin)`.
- `app/main.py` — mount new routers.
- `app/core/config.py` — new env vars.
- `requirements.txt` — additions above.

### New
- `app/api/routes/auth.py`, `users.py`, `reports.py`.
- `app/services/report_runner.py`, `report_export.py` (pdfreport, xlsxreport), `mailer.py`.
- `app/models/` (Beanie/Pydantic): `User`, `ReportConfig`, `ReportRun`.
- `app/db/ddl/`: `001_dims.sql`, `002_facts.sql`, `003_marts_exec.sql`, `004_marts_opm.sql`, `005_marts_pma.sql`, `006_marts_pte.sql`, `050_metrics_views.sql`.
- `app/etl/mdm.py` — email-normalize, build `dim_person` + `dim_person_xref`.
- `seeds/person_overrides.csv`, `seeds/dim_date.sql`, `seeds/dim_role.csv`, `seeds/dim_leave_type.csv`.
- `docker-compose.yml` — add `postgres:16`.
- `docs/dimensional_model.md` — bus matrix (3 facts × shared dims).

### Delete
- Entire `D:\Git\PFE\Reporting\reporting-backend\` directory (after FastAPI parity is verified).

---

## Verification

1. **DDL apply** — running `app/db/ddl/*.sql` in order against an empty PG produces all dims + 3 facts + 4 mart schemas with no errors.
2. **Backfill** — `POST /etl/backfill` from a seeded source set. Row counts: `raw_*` matches REST totals; `stg_*` matches `raw_*` minus duplicates; each `fact_*` has unique business key.
3. **MDM** — `SELECT email_norm, COUNT(*) FROM dim_person GROUP BY 1 HAVING COUNT(*) > 1` returns 0. For a seeded employee present in OPM+PMA+PTE, exactly **one** `dim_person` row and **three** `dim_person_xref` rows.
4. **Grain** — `SELECT ticket_number, COUNT(*) FROM fact_opm_ticket GROUP BY 1 HAVING COUNT(*) > 1` returns 0 (same per fact's business key).
5. **CEO walkthrough** — pick a Team Leader. Confirm `mart_exec.exec_pm_scorecard` rolls up tickets resolved by engineers whose `executor_person_sk` appears in tasks under that TL — i.e., the cross-app MDM join works end-to-end.
6. **Replay** — truncate `core.*` + `mart_*`, re-run gold from Mongo silver only (no REST). Output identical.
7. **Auth** — `POST /auth/register` → `POST /auth/login` returns JWT; `GET /auth/me` with token returns user; admin-only routes 403 for viewer.
8. **Reports** — create config via `POST /reports`; `POST /reports/{id}/run` returns KPI bundle; `GET /reports/{id}/export?format=pdf` returns a valid PDF; scheduled job at the cron tick produces a `report_runs` doc + saved file + email (with SMTP env set).
9. **Node-parity** — every endpoint from the Node `reporting-backend/` has a working FastAPI equivalent (test plan: replay the Node Postman collection if available, otherwise hit each route manually).
10. **Node decommission** — stop the Node service, confirm the frontend (if any consuming it) still works against FastAPI; only then delete the directory.

---

## Out of scope (deliberate, to stay graduation-sized)

- SCD2 (current SCD1 is enough — keeps `valid_from/to` complexity out).
- Bridge tables for multi-executor tasks / multi-technician tickets (capture primary on the fact).
- Airflow/Dagster (APScheduler suffices).
- Metabase/Superset (FastAPI `/metrics` + the existing frontend serve dashboards; a BI tool can be plugged onto PG later with zero ETL changes).
- Real-time / streaming.
- Cost / finance KPIs needing a finance source we don't have.

---

# Detailed Implementation Tasks

> Implement task-by-task with TDD discipline. Each step is ~2-5 min. Commit after each task. Engineer assumed unfamiliar with this codebase — file paths and code shown in full.

**Tech stack reminder:** Python 3.11+, FastAPI, PyMongo (Mongo bronze/silver), SQLAlchemy 2.0 + psycopg 3 (PG gold), APScheduler, python-jose, passlib[bcrypt], reportlab (PDF), openpyxl (XLSX), fastapi-mail.

**Working directory:** `D:\Git\PFE\reporting-fastapi`

## Task Groups

- **Group A** — Infrastructure (PG, config, DDL, seeds) — Tasks 1-6
- **Group B** — ETL redesign (extract→bronze→silver→MDM→gold→load→backfill) — Tasks 7-13
- **Group C** — Auth & Users (replaces Node auth/users) — Tasks 14-16
- **Group D** — Reports (replaces Node reports + scheduler + email) — Tasks 17-22
- **Group E** — Metrics & Routes wiring + Node decommission — Tasks 23-26

---

## Group A — Infrastructure

### Task 1: Dependencies, env config, docker-compose

**Files:**
- Modify: `requirements.txt`
- Modify: `app/core/config.py`
- Create: `docker-compose.yml`

- [ ] **Step 1: Update `requirements.txt`**

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
httpx>=0.27.0
pymongo>=4.8.0
pydantic-settings>=2.5.0
apscheduler>=3.10.4
python-dateutil>=2.9.0.post0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
fastapi-mail>=1.4.1
reportlab>=4.2.0
openpyxl>=3.1.5
pandas>=2.2.0
sqlalchemy>=2.0
psycopg[binary]>=3.2
```

- [ ] **Step 2: Add settings to `app/core/config.py`** — append fields inside `class Settings(BaseSettings):` before `model_config`:

```python
    pg_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/reporting"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 86400  # 24h

    mail_host: str = "localhost"
    mail_port: int = 1025
    mail_user: str | None = None
    mail_password: str | None = None
    mail_from: str = "reports@reporting.local"
    mail_tls: bool = False
    mail_ssl: bool = False

    reports_storage_path: str = "var/reports"
```

- [ ] **Step 3: Create `docker-compose.yml`** at repo root:

```yaml
version: "3.9"
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: reporting
    ports: ["5432:5432"]
    volumes: ["pg-data:/var/lib/postgresql/data"]
  mailhog:
    image: mailhog/mailhog:latest
    ports: ["1025:1025", "8025:8025"]
volumes:
  mongo-data:
  pg-data:
```

- [ ] **Step 4: Install + start services**

```bash
pip install -r requirements.txt
docker compose up -d
```

Expected: postgres + mongo + mailhog containers `Up`.

- [ ] **Step 5: Commit**

```bash
git add requirements.txt app/core/config.py docker-compose.yml
git commit -m "infra: add postgres + mail dependencies and docker-compose"
```

---

### Task 2: PostgreSQL connection + idempotent DDL applier

**Files:**
- Modify: `app/db/connections.py`
- Create: `app/db/pg_apply.py`

- [ ] **Step 1: Replace `app/db/connections.py`**:

```python
from pymongo import MongoClient
from pymongo.database import Database
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


class Connections:
    def __init__(self) -> None:
        self._initialized = False
        self.warehouse_client: MongoClient | None = None
        self.warehouse_db: Database | None = None
        self.pg_engine: Engine | None = None
        self.pg_session = None

    def initialize(self) -> None:
        if self._initialized:
            return
        settings = get_settings()
        self.warehouse_client = MongoClient(settings.reporting_warehouse_uri)
        self.warehouse_db = self.warehouse_client.get_default_database()
        self.pg_engine = create_engine(settings.pg_url, pool_pre_ping=True, future=True)
        self.pg_session = sessionmaker(bind=self.pg_engine, expire_on_commit=False, future=True)
        self._initialized = True

    def require_initialized(self) -> None:
        if not self._initialized:
            self.initialize()

    def close(self) -> None:
        if not self._initialized:
            return
        if self.warehouse_client:
            self.warehouse_client.close()
        if self.pg_engine:
            self.pg_engine.dispose()


connections = Connections()
```

- [ ] **Step 2: Create `app/db/pg_apply.py`** — runs all `.sql` files in a directory in order:

```python
from pathlib import Path

from sqlalchemy import text

from app.db.connections import connections


def apply_sql_dir(dir_path: str | Path) -> list[str]:
    """Execute every .sql file in dir_path sorted by filename. Idempotent — files use IF NOT EXISTS."""
    connections.require_initialized()
    applied: list[str] = []
    for sql_file in sorted(Path(dir_path).glob("*.sql")):
        sql = sql_file.read_text(encoding="utf-8")
        with connections.pg_engine.begin() as conn:
            for stmt in _split_statements(sql):
                if stmt.strip():
                    conn.execute(text(stmt))
        applied.append(sql_file.name)
    return applied


def _split_statements(sql: str) -> list[str]:
    # Naive splitter; OK because our DDL has no functions/triggers.
    return [s for s in sql.split(";\n") if s.strip()]
```

- [ ] **Step 3: Smoke test** — create `tests/unit/test_pg_connection.py`:

```python
import os
import pytest

from app.db.connections import connections


@pytest.mark.skipif(not os.getenv("PG_URL"), reason="PG_URL not set")
def test_pg_engine_connects():
    connections.initialize()
    with connections.pg_engine.connect() as conn:
        assert conn is not None
```

- [ ] **Step 4: Run test**

```bash
PG_URL=postgresql+psycopg://postgres:postgres@localhost:5432/reporting pytest tests/unit/test_pg_connection.py -v
```

Expected: PASS (or SKIPPED if PG_URL unset).

- [ ] **Step 5: Commit**

```bash
git add app/db/connections.py app/db/pg_apply.py tests/unit/test_pg_connection.py
git commit -m "infra: add postgres engine and DDL applier"
```

---

### Task 3: DDL — schemas and dimensions

**Files:**
- Create: `app/db/ddl/001_schemas_dims.sql`

- [ ] **Step 1: Create `app/db/ddl/001_schemas_dims.sql`**:

```sql
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS mart_exec;
CREATE SCHEMA IF NOT EXISTS mart_opm;
CREATE SCHEMA IF NOT EXISTS mart_pma;
CREATE SCHEMA IF NOT EXISTS mart_pte;

CREATE TABLE IF NOT EXISTS core.dim_date (
    date_sk      INT PRIMARY KEY,
    full_date    DATE NOT NULL UNIQUE,
    day_of_week  INT NOT NULL,
    day_name     VARCHAR(10) NOT NULL,
    day_of_month INT NOT NULL,
    day_of_year  INT NOT NULL,
    week_of_year INT NOT NULL,
    month_num    INT NOT NULL,
    month_name   VARCHAR(10) NOT NULL,
    quarter      INT NOT NULL,
    year         INT NOT NULL,
    is_weekend   BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS core.dim_time_of_day (
    hour_sk    INT PRIMARY KEY,
    hour_label VARCHAR(8) NOT NULL
);

CREATE TABLE IF NOT EXISTS core.dim_source_system (
    source_system_sk SERIAL PRIMARY KEY,
    code             VARCHAR(10) NOT NULL UNIQUE,
    label            VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS core.dim_person (
    person_sk        BIGSERIAL PRIMARY KEY,
    email_norm       VARCHAR(255) NOT NULL UNIQUE,
    full_name        VARCHAR(255),
    gender           VARCHAR(20),
    nationality      VARCHAR(100),
    dob              DATE,
    hiring_date      DATE,
    department       VARCHAR(100),
    title            VARCHAR(100),
    is_internal      BOOLEAN NOT NULL DEFAULT TRUE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    seniority_level  VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS core.dim_person_xref (
    person_sk      BIGINT NOT NULL REFERENCES core.dim_person(person_sk),
    source_system  VARCHAR(10) NOT NULL,
    source_user_id VARCHAR(255) NOT NULL,
    match_method   VARCHAR(20) NOT NULL DEFAULT 'email',
    PRIMARY KEY (source_system, source_user_id)
);

CREATE TABLE IF NOT EXISTS core.dim_role (
    role_sk         SERIAL PRIMARY KEY,
    source_system   VARCHAR(10) NOT NULL,
    role_code       VARCHAR(50) NOT NULL,
    role_label      VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(20),
    UNIQUE (source_system, role_code)
);

CREATE TABLE IF NOT EXISTS core.dim_department (
    department_sk SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    cost_center   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS core.dim_client (
    client_sk BIGSERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL UNIQUE,
    country   VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS core.dim_contract (
    contract_sk          BIGSERIAL PRIMARY KEY,
    source_id            VARCHAR(255) NOT NULL UNIQUE,
    contract_number      VARCHAR(100),
    type                 VARCHAR(50),
    nature               VARCHAR(50),
    sla_hours            INT,
    start_date           DATE,
    end_date             DATE,
    client_sk            BIGINT REFERENCES core.dim_client(client_sk),
    commercial_person_sk BIGINT REFERENCES core.dim_person(person_sk)
);

CREATE TABLE IF NOT EXISTS core.dim_site (
    site_sk   BIGSERIAL PRIMARY KEY,
    source_id VARCHAR(255) NOT NULL UNIQUE,
    name      VARCHAR(255),
    address  VARCHAR(500),
    lat       NUMERIC(10,6),
    lon       NUMERIC(10,6),
    client_sk BIGINT REFERENCES core.dim_client(client_sk)
);

CREATE TABLE IF NOT EXISTS core.dim_equipment (
    equipment_sk  BIGSERIAL PRIMARY KEY,
    source_id     VARCHAR(255) NOT NULL UNIQUE,
    serial_number VARCHAR(255),
    name          VARCHAR(255),
    kind          VARCHAR(10) NOT NULL CHECK (kind IN ('HARD', 'SOFT')),
    version       VARCHAR(100),
    constructor   VARCHAR(100),
    site_sk       BIGINT REFERENCES core.dim_site(site_sk),
    contract_sk   BIGINT REFERENCES core.dim_contract(contract_sk)
);

CREATE TABLE IF NOT EXISTS core.dim_project (
    project_sk            BIGSERIAL PRIMARY KEY,
    source_id             VARCHAR(255) NOT NULL UNIQUE,
    name                  VARCHAR(255),
    type                  VARCHAR(50),
    priority              VARCHAR(20),
    team_leader_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    client_person_sk      BIGINT REFERENCES core.dim_person(person_sk),
    start_date            DATE,
    end_date              DATE,
    closed_at             TIMESTAMPTZ,
    reclamation_count     INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS core.dim_vehicle (
    vehicle_sk   BIGSERIAL PRIMARY KEY,
    source_id    VARCHAR(255) NOT NULL UNIQUE,
    registration VARCHAR(50),
    model        VARCHAR(100),
    type         VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS core.dim_room (
    room_sk   BIGSERIAL PRIMARY KEY,
    source_id VARCHAR(255) NOT NULL UNIQUE,
    label     VARCHAR(100),
    location  VARCHAR(200),
    capacity  INT
);

CREATE TABLE IF NOT EXISTS core.dim_leave_type (
    leave_type_sk SERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    label         VARCHAR(100) NOT NULL,
    is_paid       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Junk dim: all nullable, unique across the 8-column tuple.
CREATE TABLE IF NOT EXISTS core.dim_status (
    status_sk      SERIAL PRIMARY KEY,
    ticket_status  VARCHAR(50),
    task_status    VARCHAR(50),
    event_status   VARCHAR(50),
    is_overdue     BOOLEAN,
    is_expired     BOOLEAN,
    is_helpdesk    BOOLEAN,
    is_sla_breach  BOOLEAN,
    is_accepted    BOOLEAN
);
CREATE UNIQUE INDEX IF NOT EXISTS dim_status_combo_uq ON core.dim_status (
    COALESCE(ticket_status, ''),
    COALESCE(task_status, ''),
    COALESCE(event_status, ''),
    COALESCE(is_overdue, FALSE),
    COALESCE(is_expired, FALSE),
    COALESCE(is_helpdesk, FALSE),
    COALESCE(is_sla_breach, FALSE),
    COALESCE(is_accepted, FALSE)
);

CREATE TABLE IF NOT EXISTS core.dim_priority (
    priority_sk SERIAL PRIMARY KEY,
    level       VARCHAR(20) NOT NULL UNIQUE,
    weight      NUMERIC(5,2) NOT NULL DEFAULT 1.0
);
```

- [ ] **Step 2: Apply DDL**

```bash
python -c "from app.db.pg_apply import apply_sql_dir; print(apply_sql_dir('app/db/ddl'))"
```

Expected: `['001_schemas_dims.sql']` printed; no error.

- [ ] **Step 3: Verify in PG**

```bash
docker exec -it $(docker ps -qf name=postgres) psql -U postgres -d reporting -c "\dt core.*"
```

Expected: 17 tables in `core` schema.

- [ ] **Step 4: Commit**

```bash
git add app/db/ddl/001_schemas_dims.sql
git commit -m "ddl: add core schema with 17 conformed dimensions"
```

---

### Task 4: DDL — fact tables

**Files:**
- Create: `app/db/ddl/002_facts.sql`

- [ ] **Step 1: Create `app/db/ddl/002_facts.sql`**:

```sql
CREATE TABLE IF NOT EXISTS core.fact_opm_ticket (
    ticket_sk                     BIGSERIAL PRIMARY KEY,
    source_id                     VARCHAR(255) NOT NULL UNIQUE,
    ticket_number                 VARCHAR(100),
    source_system_sk              INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    created_date_sk               INT REFERENCES core.dim_date(date_sk),
    created_hour_sk               INT REFERENCES core.dim_time_of_day(hour_sk),
    assigned_date_sk              INT REFERENCES core.dim_date(date_sk),
    resolved_date_sk              INT REFERENCES core.dim_date(date_sk),
    closed_date_sk                INT REFERENCES core.dim_date(date_sk),
    contract_sk                   BIGINT REFERENCES core.dim_contract(contract_sk),
    site_sk                       BIGINT REFERENCES core.dim_site(site_sk),
    equipment_sk                  BIGINT REFERENCES core.dim_equipment(equipment_sk),
    client_person_sk              BIGINT REFERENCES core.dim_person(person_sk),
    assigned_technician_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    status_sk                     INT REFERENCES core.dim_status(status_sk),
    time_to_assign_min            INT,
    time_to_resolve_min           INT,
    time_to_close_min             INT,
    reopen_count                  INT NOT NULL DEFAULT 0,
    etl_loaded_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_created_idx ON core.fact_opm_ticket(created_date_sk);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_tech_idx ON core.fact_opm_ticket(assigned_technician_person_sk);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_contract_idx ON core.fact_opm_ticket(contract_sk);

CREATE TABLE IF NOT EXISTS core.fact_pma_task (
    task_sk               BIGSERIAL PRIMARY KEY,
    source_id             VARCHAR(255) NOT NULL UNIQUE,
    task_ref              VARCHAR(100),
    source_system_sk      INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    project_sk            BIGINT REFERENCES core.dim_project(project_sk),
    executor_person_sk    BIGINT REFERENCES core.dim_person(person_sk),
    team_leader_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    department_sk         INT REFERENCES core.dim_department(department_sk),
    start_date_sk         INT REFERENCES core.dim_date(date_sk),
    deadline_date_sk      INT REFERENCES core.dim_date(date_sk),
    closed_date_sk        INT REFERENCES core.dim_date(date_sk),
    status_sk             INT REFERENCES core.dim_status(status_sk),
    priority_sk           INT REFERENCES core.dim_priority(priority_sk),
    progress_pct          NUMERIC(5,2),
    note                  NUMERIC(5,2),
    rating_weight         NUMERIC(5,2),
    duration_days         INT,
    etl_loaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_pma_task_project_idx ON core.fact_pma_task(project_sk);
CREATE INDEX IF NOT EXISTS fact_pma_task_executor_idx ON core.fact_pma_task(executor_person_sk);
CREATE INDEX IF NOT EXISTS fact_pma_task_tl_idx ON core.fact_pma_task(team_leader_person_sk);

CREATE TABLE IF NOT EXISTS core.fact_pte_event (
    event_sk            BIGSERIAL PRIMARY KEY,
    source_id           VARCHAR(255) NOT NULL UNIQUE,
    event_type          VARCHAR(30) NOT NULL CHECK (event_type IN ('leave','vehicle_usage','room_reservation','vm_request','intervention')),
    source_system_sk    INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    event_date_sk       INT REFERENCES core.dim_date(date_sk),
    event_hour_sk       INT REFERENCES core.dim_time_of_day(hour_sk),
    end_date_sk         INT REFERENCES core.dim_date(date_sk),
    applicant_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    engineer_person_sk  BIGINT REFERENCES core.dim_person(person_sk),
    department_sk       INT REFERENCES core.dim_department(department_sk),
    vehicle_sk          BIGINT REFERENCES core.dim_vehicle(vehicle_sk),
    room_sk             BIGINT REFERENCES core.dim_room(room_sk),
    leave_type_sk       INT REFERENCES core.dim_leave_type(leave_type_sk),
    status_sk           INT REFERENCES core.dim_status(status_sk),
    duration_min        INT,
    km                  NUMERIC(10,2),
    ram_gb              INT,
    disk_gb             INT,
    business_days       INT,
    etl_loaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_pte_event_type_idx ON core.fact_pte_event(event_type);
CREATE INDEX IF NOT EXISTS fact_pte_event_date_idx ON core.fact_pte_event(event_date_sk);
CREATE INDEX IF NOT EXISTS fact_pte_event_applicant_idx ON core.fact_pte_event(applicant_person_sk);
```

- [ ] **Step 2: Apply DDL + verify**

```bash
python -c "from app.db.pg_apply import apply_sql_dir; print(apply_sql_dir('app/db/ddl'))"
docker exec -i $(docker ps -qf name=postgres) psql -U postgres -d reporting -c "\dt core.fact_*"
```

Expected: 3 fact tables present.

- [ ] **Step 3: Commit**

```bash
git add app/db/ddl/002_facts.sql
git commit -m "ddl: add 3 fact tables (opm_ticket, pma_task, pte_event)"
```

---

### Task 5: Seeds — dim_date, dim_time_of_day, dim_source_system, dim_role, dim_leave_type, dim_priority, person_overrides

**Files:**
- Create: `seeds/dim_date.sql`
- Create: `seeds/dim_time_of_day.sql`
- Create: `seeds/dim_source_system.sql`
- Create: `seeds/dim_role.sql`
- Create: `seeds/dim_leave_type.sql`
- Create: `seeds/dim_priority.sql`
- Create: `seeds/person_overrides.csv`

- [ ] **Step 1: Create `seeds/dim_date.sql`** (generates 2022-01-01 to 2030-12-31):

```sql
INSERT INTO core.dim_date (date_sk, full_date, day_of_week, day_name, day_of_month,
                           day_of_year, week_of_year, month_num, month_name, quarter, year, is_weekend)
SELECT
    EXTRACT(YEAR FROM d)::INT * 10000 + EXTRACT(MONTH FROM d)::INT * 100 + EXTRACT(DAY FROM d)::INT AS date_sk,
    d::DATE AS full_date,
    EXTRACT(ISODOW FROM d)::INT AS day_of_week,
    TRIM(TO_CHAR(d, 'Day')) AS day_name,
    EXTRACT(DAY FROM d)::INT AS day_of_month,
    EXTRACT(DOY FROM d)::INT AS day_of_year,
    EXTRACT(WEEK FROM d)::INT AS week_of_year,
    EXTRACT(MONTH FROM d)::INT AS month_num,
    TRIM(TO_CHAR(d, 'Month')) AS month_name,
    EXTRACT(QUARTER FROM d)::INT AS quarter,
    EXTRACT(YEAR FROM d)::INT AS year,
    EXTRACT(ISODOW FROM d) IN (6, 7) AS is_weekend
FROM generate_series('2022-01-01'::DATE, '2030-12-31'::DATE, INTERVAL '1 day') AS d
ON CONFLICT (date_sk) DO NOTHING;
```

- [ ] **Step 2: Create `seeds/dim_time_of_day.sql`**:

```sql
INSERT INTO core.dim_time_of_day (hour_sk, hour_label)
SELECT h, LPAD(h::TEXT, 2, '0') || ':00'
FROM generate_series(0, 23) AS h
ON CONFLICT (hour_sk) DO NOTHING;
```

- [ ] **Step 3: Create `seeds/dim_source_system.sql`**:

```sql
INSERT INTO core.dim_source_system (code, label) VALUES
  ('OPM', 'Operations Management (Helpdesk)'),
  ('PMA', 'Project Management'),
  ('PTE', 'Personnel & Technical Equipment')
ON CONFLICT (code) DO NOTHING;
```

- [ ] **Step 4: Create `seeds/dim_role.sql`** (covers all roles across the 3 source systems):

```sql
INSERT INTO core.dim_role (source_system, role_code, role_label, seniority_level) VALUES
  ('OPM', 'admin',          'Admin',                 'Director'),
  ('OPM', 'client',         'Client',                'IC'),
  ('OPM', 'technician',     'Technician',            'IC'),
  ('OPM', 'commercial',     'Commercial',            'Lead'),
  ('OPM', 'assistant',      'Assistant',             'IC'),
  ('OPM', 'pmo',            'PMO',                   'Manager'),
  ('OPM', 'helpdeskUser',   'Helpdesk User',         'IC'),
  ('PMA', 'Admin',          'Admin',                 'Director'),
  ('PMA', 'Engineer',       'Engineer',              'IC'),
  ('PMA', 'Client',         'Client',                'IC'),
  ('PMA', 'Team Leader',    'Team Leader',           'Lead'),
  ('PTE', 'ADMIN',          'Admin',                 'Director'),
  ('PTE', 'ENGINEER',       'Engineer',              'IC'),
  ('PTE', 'ASSISTANT',      'Assistant',             'IC'),
  ('PTE', 'LAB-MANAGER',    'Lab Manager',           'Manager')
ON CONFLICT (source_system, role_code) DO NOTHING;
```

- [ ] **Step 5: Create `seeds/dim_leave_type.sql`**:

```sql
INSERT INTO core.dim_leave_type (code, label, is_paid) VALUES
  ('PAID',       'Paid Leave',            TRUE),
  ('UNPAID',     'Unpaid Leave',          FALSE),
  ('SICK',       'Sick Leave',            TRUE),
  ('MATERNITY',  'Maternity Leave',       TRUE),
  ('PATERNITY',  'Paternity Leave',       TRUE),
  ('BEREAVEMENT','Bereavement Leave',     TRUE),
  ('OTHER',      'Other',                 FALSE)
ON CONFLICT (code) DO NOTHING;
```

- [ ] **Step 6: Create `seeds/dim_priority.sql`**:

```sql
INSERT INTO core.dim_priority (level, weight) VALUES
  ('Low',      0.5),
  ('Medium',   1.0),
  ('High',     2.0),
  ('Critical', 3.0),
  ('Unknown',  1.0)
ON CONFLICT (level) DO NOTHING;
```

- [ ] **Step 7: Create `seeds/person_overrides.csv`** (manual MDM overrides — empty by default):

```csv
email_norm,canonical_email,note
```

- [ ] **Step 8: Apply seeds**

```bash
python -c "from app.db.pg_apply import apply_sql_dir; print(apply_sql_dir('seeds'))"
```

Expected: list with all 6 SQL files; no error.

- [ ] **Step 9: Verify**

```bash
docker exec -i $(docker ps -qf name=postgres) psql -U postgres -d reporting -c "SELECT COUNT(*) FROM core.dim_date;"
docker exec -i $(docker ps -qf name=postgres) psql -U postgres -d reporting -c "SELECT * FROM core.dim_priority;"
```

Expected: `dim_date` ≈ 3287 rows (~9 years); `dim_priority` has 5 rows.

- [ ] **Step 10: Commit**

```bash
git add seeds/
git commit -m "seeds: dim_date, dim_time_of_day, dim_source_system, dim_role, dim_leave_type, dim_priority"
```

---

### Task 6: MongoDB warehouse schema — bronze + silver collections

**Files:**
- Modify: `app/db/warehouse_schema.py`

- [ ] **Step 1: Replace `app/db/warehouse_schema.py`**:

```python
from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database


BRONZE_COLLECTIONS = [
    # OPM
    "raw_opm_tickets", "raw_opm_users", "raw_opm_contracts",
    "raw_opm_sites", "raw_opm_equipment", "raw_opm_equipment_soft",
    # PMA
    "raw_pma_projects", "raw_pma_tasks", "raw_pma_reclamations", "raw_pma_users",
    # PTE
    "raw_pte_leaves", "raw_pte_vehicles", "raw_pte_rooms",
    "raw_pte_virtualization", "raw_pte_users",
    "raw_pte_vehicle_events", "raw_pte_room_events", "raw_pte_user_events",
]

SILVER_COLLECTIONS = [c.replace("raw_", "stg_") for c in BRONZE_COLLECTIONS]

OPS_COLLECTIONS = [
    "etl_runs", "etl_checkpoints",
    # FastAPI app concerns (replaces Node Mongo collections)
    "users", "report_configs", "report_runs",
]


def ensure_warehouse_schema(db: Database) -> None:
    """Idempotently create Mongo bronze + silver + ops collections and indexes."""
    existing = set(db.list_collection_names())

    for name in BRONZE_COLLECTIONS + SILVER_COLLECTIONS + OPS_COLLECTIONS:
        if name not in existing:
            db.create_collection(name)

    # Bronze: unique by (source_id, etl_run_id) — keep every run for replay
    for name in BRONZE_COLLECTIONS:
        db[name].create_index([("source_id", ASCENDING), ("etl_run_id", ASCENDING)], unique=True)
        db[name].create_index([("ingested_at", DESCENDING)])

    # Silver: unique by source_id (latest typed snapshot)
    for name in SILVER_COLLECTIONS:
        db[name].create_index([("source_id", ASCENDING)], unique=True)
        db[name].create_index([("updated_at", DESCENDING)])

    # Ops
    db.etl_runs.create_index([("run_id", ASCENDING)], unique=True)
    db.etl_runs.create_index([("started_at", DESCENDING), ("status", ASCENDING)])
    db.etl_checkpoints.create_index([("source_system", ASCENDING), ("entity_name", ASCENDING)], unique=True)

    db.users.create_index([("email", ASCENDING)], unique=True)
    db.report_configs.create_index([("owner", ASCENDING)])
    db.report_configs.create_index([("schedule.enabled", ASCENDING)])
    db.report_runs.create_index([("report_id", ASCENDING), ("started_at", DESCENDING)])
```

- [ ] **Step 2: Smoke test** — `tests/unit/test_warehouse_schema.py`:

```python
import os
import pytest
from pymongo import MongoClient

from app.db.warehouse_schema import (
    BRONZE_COLLECTIONS, SILVER_COLLECTIONS, OPS_COLLECTIONS, ensure_warehouse_schema,
)


@pytest.mark.skipif(not os.getenv("MONGO_URI"), reason="MONGO_URI not set")
def test_ensure_warehouse_schema_creates_all():
    client = MongoClient(os.environ["MONGO_URI"])
    db = client.get_default_database()
    ensure_warehouse_schema(db)
    names = set(db.list_collection_names())
    for c in BRONZE_COLLECTIONS + SILVER_COLLECTIONS + OPS_COLLECTIONS:
        assert c in names
```

- [ ] **Step 3: Run**

```bash
MONGO_URI=mongodb://localhost:27017/reporting_etl pytest tests/unit/test_warehouse_schema.py -v
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/db/warehouse_schema.py tests/unit/test_warehouse_schema.py
git commit -m "infra: mongo bronze + silver + ops collections with indexes"
```

---

## Group B — ETL Redesign

### Task 7: Extract layer — write to bronze + add missing entities

**Files:**
- Modify: `app/etl/extract.py`

Approach: keep all current REST extraction logic. Add (a) new endpoints for OPM users/contracts/sites/equipment, PMA users, PTE vehicle/room/user events; (b) a `save_bronze()` step that writes every extracted record into `raw_*` Mongo collections before any transform.

- [ ] **Step 1: Add new endpoint paths to `extract.py`** — extend `extract_opm`, `extract_pma`, `extract_pte`:

```python
def extract_opm(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    return {
        "tickets": _fetch_first_success(client, ["/ticket/getAllTickets", "/ticket"],
                                        source="opm.tickets", token=token,
                                        params=_opm_params_for_incremental()),
        "users": _fetch_first_success(client, ["/user/getAll", "/user", "/users"],
                                       source="opm.users", token=token, params={}),
        "contracts": _fetch_first_success(client, ["/contract/getAllContracts", "/contract"],
                                           source="opm.contracts", token=token, params={}),
        "sites": _fetch_first_success(client, ["/site/getAllSites", "/site"],
                                       source="opm.sites", token=token, params={}),
        "equipment": _fetch_first_success(client, ["/equipment/getAllEquipment", "/equipment"],
                                           source="opm.equipment", token=token, params={}),
        "equipment_soft": _fetch_first_success(client, ["/equipmentSoft/getAllEquipmentSoft", "/equipmentSoft"],
                                                source="opm.equipment_soft", token=token, params={}),
    }
```

```python
def extract_pma(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    projects = _fetch_first_success(client, ["/projects"], source="pma.projects", token=token,
                                     params=_pma_params_for_incremental("projects"))
    return {
        "projects": projects,
        "tasks": _fetch_first_success(client, ["/tasks"], source="pma.tasks", token=token,
                                       params=_pma_params_for_incremental("tasks")),
        "reclamations": _fetch_first_success(client, ["/reclamations"], source="pma.reclamations", token=token,
                                              params=_pma_params_for_incremental("reclamations")),
        "users": _fetch_first_success(client, ["/users", "/user"], source="pma.users", token=token, params={}),
    }
```

```python
def extract_pte(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    return {
        "leaves": _fetch_first_success(client, ["/leave/getAllLeave", "/leave"],
                                        source="pte.leaves", token=token,
                                        params=_pte_params_for_incremental("leaves")),
        "vehicles": _fetch_first_success(client, ["/material/vehicle/getVehicles", "/material/vehicle"],
                                          source="pte.vehicles", token=token, params={}),
        "rooms": _fetch_first_success(client, ["/material/room/getRooms", "/material/room"],
                                       source="pte.rooms", token=token, params={}),
        "virtualization": _fetch_first_success(client, ["/material/virtualization/allActiveLabs"],
                                                 source="pte.virtualization", token=token, params={}),
        "users": _fetch_first_success(client, ["/users/getall", "/users"],
                                       source="pte.users", token=token, params={}),
        "vehicle_events": _fetch_first_success(client,
            ["/material/vehicle/getAllVehicleEvents", "/material/vehicle/events"],
            source="pte.vehicle_events", token=token, params={}),
        "room_events": _fetch_first_success(client,
            ["/material/room/getAllRoomEvents", "/material/room/events"],
            source="pte.room_events", token=token, params={}),
        "user_events": _fetch_first_success(client,
            ["/technical-team/getAllUserEvents", "/technical-team/userEvent"],
            source="pte.user_events", token=token, params={}),
    }
```

- [ ] **Step 2: Add `save_bronze()`** to `extract.py` (after the existing `extract_all` function):

```python
import hashlib, json
from app.db.connections import connections


def save_bronze(extracted: dict, etl_run_id: str) -> dict[str, int]:
    """Write every extracted record into raw_{source}_{entity} Mongo collections.

    Doc shape: {source_id, payload, ingested_at, etl_run_id, hash}.
    Idempotent per (source_id, etl_run_id) via the unique index.
    """
    connections.require_initialized()
    db = connections.warehouse_db
    counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)
    for source in ("opm", "pma", "pte"):
        for entity, rows in extracted.get(source, {}).items():
            coll_name = f"raw_{source}_{entity}"
            collection = db[coll_name]
            inserted = 0
            for row in rows:
                if not isinstance(row, dict):
                    continue
                source_id = str(row.get("_id") or row.get("id") or "")
                if not source_id:
                    continue
                payload_str = json.dumps(row, default=str, sort_keys=True)
                doc = {
                    "source_id": source_id,
                    "payload": row,
                    "ingested_at": now,
                    "etl_run_id": etl_run_id,
                    "hash": hashlib.sha256(payload_str.encode()).hexdigest(),
                }
                collection.update_one(
                    {"source_id": source_id, "etl_run_id": etl_run_id},
                    {"$set": doc},
                    upsert=True,
                )
                inserted += 1
            counts[coll_name] = inserted
    return counts
```

- [ ] **Step 3: Unit test the entity-list extraction**

`tests/unit/test_extract_envelopes.py`:

```python
from app.etl.extract import _extract_list


def test_envelope_keys():
    assert _extract_list({"items": [{"_id": "a"}, {"_id": "b"}]}) == [{"_id": "a"}, {"_id": "b"}]
    assert _extract_list({"data": [{"_id": "a"}]}) == [{"_id": "a"}]
    assert _extract_list([{"_id": "a"}]) == [{"_id": "a"}]
    assert _extract_list({"unknown": "x"}) == []
```

- [ ] **Step 4: Run**

```bash
pytest tests/unit/test_extract_envelopes.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/etl/extract.py tests/unit/test_extract_envelopes.py
git commit -m "etl: add bronze save + extract OPM/PMA/PTE additional entities"
```

---

### Task 8: Silver transform — bronze (raw_*) → silver (stg_*) typed

**Files:**
- Create: `app/etl/transform_silver.py`
- Create: `tests/unit/test_transform_silver.py`

Silver is "one typed doc per business key, latest". We read latest bronze rows (by `ingested_at`) and emit normalized, type-coerced documents into `stg_*`.

- [ ] **Step 1: Write failing test** — `tests/unit/test_transform_silver.py`:

```python
from datetime import datetime, timezone
from app.etl.transform_silver import normalize_opm_ticket, normalize_pte_leave, normalize_pma_task


def test_normalize_opm_ticket_typed():
    raw = {
        "_id": "tk1", "ticketNumber": "T-001", "status": "Resolved",
        "createdAt": "2026-03-04T08:30:00Z",
        "assignedAt": "2026-03-04T09:00:00Z",
        "resolvedAt": "2026-03-04T11:30:00Z",
        "closedAt": None,
        "contract": "c1", "site": "s1", "equipment": "e1",
        "client": "u1", "assignedTo": "u2",
        "isExpired": False, "isHelpdesk": True, "reopenCount": 0,
    }
    out = normalize_opm_ticket(raw)
    assert out["source_id"] == "tk1"
    assert out["ticket_number"] == "T-001"
    assert out["status"] == "Resolved"
    assert isinstance(out["created_at"], datetime)
    assert out["time_to_assign_min"] == 30
    assert out["time_to_resolve_min"] == 180
    assert out["closed_at"] is None


def test_normalize_pte_leave_business_days():
    raw = {"_id": "l1", "user": "u1", "type": "PAID",
           "startDate": "2026-03-02", "endDate": "2026-03-06", "status": "APPROVED"}
    out = normalize_pte_leave(raw)
    assert out["business_days"] == 5  # Mon-Fri


def test_normalize_pma_task_overdue_derived():
    raw = {"_id": "t1", "project": "p1", "executor": "u1",
           "startDate": "2026-02-01", "deadline": "2026-02-10",
           "closedAt": "2026-02-15", "status": "Closed", "priority": "High",
           "note": 4.5, "progress": 100}
    out = normalize_pma_task(raw)
    assert out["is_overdue"] is True  # closed > deadline
    assert out["priority"] == "High"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/unit/test_transform_silver.py -v
```

Expected: FAIL (module missing).

- [ ] **Step 3: Implement `app/etl/transform_silver.py`**:

```python
from datetime import datetime, date, timezone
from typing import Any
from dateutil.parser import isoparse

from app.db.connections import connections


def _parse_dt(value: Any) -> datetime | None:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day, tzinfo=timezone.utc)
    try:
        return isoparse(str(value))
    except Exception:
        return None


def _minutes_between(a: datetime | None, b: datetime | None) -> int | None:
    if not a or not b:
        return None
    return int((b - a).total_seconds() // 60)


def _business_days(start: datetime | None, end: datetime | None) -> int | None:
    if not start or not end:
        return None
    days = 0
    cur = start.date()
    last = end.date()
    while cur <= last:
        if cur.weekday() < 5:
            days += 1
        cur = cur.fromordinal(cur.toordinal() + 1)
    return days


def normalize_opm_ticket(raw: dict) -> dict:
    created = _parse_dt(raw.get("createdAt"))
    assigned = _parse_dt(raw.get("assignedAt"))
    resolved = _parse_dt(raw.get("resolvedAt"))
    closed = _parse_dt(raw.get("closedAt"))
    return {
        "source_id": str(raw.get("_id")),
        "ticket_number": raw.get("ticketNumber"),
        "status": raw.get("status"),
        "created_at": created, "assigned_at": assigned,
        "resolved_at": resolved, "closed_at": closed,
        "contract_source_id": raw.get("contract"),
        "site_source_id": raw.get("site"),
        "equipment_source_id": raw.get("equipment"),
        "client_source_id": raw.get("client"),
        "technician_source_id": raw.get("assignedTo"),
        "is_expired": bool(raw.get("isExpired")),
        "is_helpdesk": bool(raw.get("isHelpdesk")),
        "is_sla_breach": bool(raw.get("isSlaBreach")),
        "reopen_count": int(raw.get("reopenCount") or 0),
        "time_to_assign_min": _minutes_between(created, assigned),
        "time_to_resolve_min": _minutes_between(created, resolved),
        "time_to_close_min": _minutes_between(created, closed),
    }


def normalize_pma_task(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate"))
    deadline = _parse_dt(raw.get("deadline"))
    closed = _parse_dt(raw.get("closedAt"))
    is_overdue = bool(deadline and closed and closed.date() > deadline.date())
    duration = None
    if start and closed:
        duration = (closed.date() - start.date()).days
    return {
        "source_id": str(raw.get("_id")),
        "task_ref": raw.get("ref") or raw.get("taskRef"),
        "project_source_id": raw.get("project"),
        "executor_source_id": raw.get("executor") or (raw.get("executors") or [None])[0],
        "team_leader_source_id": raw.get("teamLeader"),
        "start_at": start, "deadline_at": deadline, "closed_at": closed,
        "status": raw.get("status"),
        "priority": raw.get("priority") or "Unknown",
        "is_overdue": is_overdue,
        "is_accepted": bool(raw.get("isAccepted")),
        "progress_pct": float(raw.get("progress") or 0),
        "note": float(raw.get("note")) if raw.get("note") is not None else None,
        "rating_weight": float(raw.get("ratingWeight") or 1.0),
        "duration_days": duration,
    }


def normalize_pte_leave(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate"))
    end = _parse_dt(raw.get("endDate"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "leave",
        "applicant_source_id": raw.get("user"),
        "leave_type_code": (raw.get("type") or "OTHER").upper(),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "is_accepted": (raw.get("status") in {"APPROVED", "ACCEPTED"}),
        "business_days": _business_days(start, end),
    }


def normalize_pte_vehicle_event(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "vehicle_usage",
        "applicant_source_id": raw.get("user") or raw.get("driver"),
        "vehicle_source_id": raw.get("vehicle"),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "km": float(raw.get("km") or raw.get("distance") or 0),
        "duration_min": _minutes_between(start, end),
    }


def normalize_pte_room_event(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "room_reservation",
        "applicant_source_id": raw.get("user") or raw.get("reservedBy"),
        "room_source_id": raw.get("room"),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "duration_min": _minutes_between(start, end),
    }


def normalize_pte_vm(raw: dict) -> dict:
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "vm_request",
        "applicant_source_id": raw.get("user") or raw.get("requestedBy"),
        "event_start": _parse_dt(raw.get("requestedAt") or raw.get("createdAt")),
        "event_end": _parse_dt(raw.get("grantedAt") or raw.get("approvedAt")),
        "status": raw.get("status"),
        "ram_gb": int(raw.get("ramGb") or raw.get("ram") or 0) or None,
        "disk_gb": int(raw.get("diskGb") or raw.get("disk") or 0) or None,
    }


def normalize_pte_intervention(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "intervention",
        "applicant_source_id": raw.get("user"),
        "engineer_source_id": raw.get("engineer") or raw.get("assignedTo"),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "duration_min": _minutes_between(start, end),
    }


NORMALIZERS = {
    "raw_opm_tickets":         ("stg_opm_tickets",         normalize_opm_ticket),
    "raw_pma_tasks":           ("stg_pma_tasks",           normalize_pma_task),
    "raw_pte_leaves":          ("stg_pte_leaves",          normalize_pte_leave),
    "raw_pte_vehicle_events":  ("stg_pte_vehicle_events",  normalize_pte_vehicle_event),
    "raw_pte_room_events":     ("stg_pte_room_events",     normalize_pte_room_event),
    "raw_pte_virtualization":  ("stg_pte_virtualization",  normalize_pte_vm),
    "raw_pte_user_events":     ("stg_pte_user_events",     normalize_pte_intervention),
}


def run_silver(etl_run_id: str | None = None) -> dict[str, int]:
    """Read latest bronze docs per source_id and upsert into stg_* by source_id."""
    connections.require_initialized()
    db = connections.warehouse_db
    counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)
    for bronze_name, (silver_name, fn) in NORMALIZERS.items():
        pipeline = [
            {"$sort": {"ingested_at": -1}},
            {"$group": {"_id": "$source_id", "doc": {"$first": "$payload"}}},
        ]
        if etl_run_id:
            pipeline.insert(0, {"$match": {"etl_run_id": etl_run_id}})
        bulk = 0
        for row in db[bronze_name].aggregate(pipeline):
            typed = fn(row["doc"])
            typed["updated_at"] = now
            db[silver_name].update_one({"source_id": typed["source_id"]},
                                       {"$set": typed}, upsert=True)
            bulk += 1
        counts[silver_name] = bulk
    return counts
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/unit/test_transform_silver.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/etl/transform_silver.py tests/unit/test_transform_silver.py
git commit -m "etl: silver transform (bronze raw_* → typed stg_*)"
```

---

### Task 9: MDM — build `dim_person` and `dim_person_xref` from silver users

**Files:**
- Create: `app/etl/mdm.py`
- Create: `tests/unit/test_mdm.py`

Strategy: scan `stg_opm_users`, `stg_pma_users`, `stg_pte_users`, normalize email (`lower(trim)`), apply `seeds/person_overrides.csv` to remap aliased emails to a canonical email, then upsert one `dim_person` per canonical email + one `dim_person_xref` per (source_system, source_user_id).

- [ ] **Step 1: Write failing test** — `tests/unit/test_mdm.py`:

```python
from app.etl.mdm import normalize_email, merge_user_into_person


def test_normalize_email():
    assert normalize_email(" Foo@Bar.COM ") == "foo@bar.com"
    assert normalize_email(None) is None


def test_merge_user_picks_richest_non_null():
    base = {"email_norm": "a@b.c", "full_name": "Alice", "department": None}
    new = {"email_norm": "a@b.c", "full_name": "Alice Doe", "department": "Eng"}
    merged = merge_user_into_person(base, new)
    assert merged["full_name"] == "Alice Doe"
    assert merged["department"] == "Eng"
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pytest tests/unit/test_mdm.py -v
```

- [ ] **Step 3: Implement `app/etl/mdm.py`**:

```python
import csv
from pathlib import Path
from typing import Any

from sqlalchemy import text

from app.db.connections import connections


def normalize_email(value: Any) -> str | None:
    if not value:
        return None
    s = str(value).strip().lower()
    return s or None


def load_overrides(path: str = "seeds/person_overrides.csv") -> dict[str, str]:
    p = Path(path)
    if not p.exists():
        return {}
    out: dict[str, str] = {}
    with p.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            alias = normalize_email(row.get("email_norm"))
            canon = normalize_email(row.get("canonical_email"))
            if alias and canon:
                out[alias] = canon
    return out


def _row_to_person(raw: dict, source_system: str) -> dict:
    email = normalize_email(raw.get("email"))
    return {
        "email_norm": email,
        "source_user_id": str(raw.get("_id") or raw.get("id") or ""),
        "source_system": source_system,
        "full_name": " ".join(filter(None, [raw.get("firstName"), raw.get("lastName")])) or raw.get("fullName") or raw.get("name"),
        "gender": raw.get("gender"),
        "nationality": raw.get("nationality"),
        "department": raw.get("department") or raw.get("departement"),
        "title": raw.get("title") or raw.get("role") or raw.get("authority"),
        "is_internal": bool(raw.get("isInternal", True)),
        "is_active": bool(raw.get("isEnabled", True) and not raw.get("isDeleted", False)),
        "seniority_level": raw.get("seniorityLevel"),
    }


def merge_user_into_person(base: dict, new: dict) -> dict:
    out = dict(base)
    for k, v in new.items():
        if v in (None, "", False) and out.get(k) not in (None, "", False):
            continue
        if out.get(k) in (None, "", False):
            out[k] = v
    return out


def run_mdm() -> dict[str, int]:
    connections.require_initialized()
    db = connections.warehouse_db
    overrides = load_overrides()

    by_email: dict[str, dict] = {}
    xrefs: list[tuple[str, str, str]] = []  # (email_norm, source_system, source_user_id)

    for coll, src in [("stg_opm_users", "OPM"), ("stg_pma_users", "PMA"), ("stg_pte_users", "PTE")]:
        for raw in db[coll].find({}):
            payload = raw.get("payload", raw)
            row = _row_to_person(payload, src)
            email = row["email_norm"]
            if not email:
                continue
            email = overrides.get(email, email)
            row["email_norm"] = email
            by_email[email] = merge_user_into_person(by_email.get(email, {}), row)
            xrefs.append((email, src, row["source_user_id"]))

    person_rows = 0
    xref_rows = 0
    with connections.pg_engine.begin() as conn:
        for email, p in by_email.items():
            conn.execute(text("""
                INSERT INTO core.dim_person
                    (email_norm, full_name, gender, nationality, department, title,
                     is_internal, is_active, seniority_level)
                VALUES (:email_norm, :full_name, :gender, :nationality, :department, :title,
                        :is_internal, :is_active, :seniority_level)
                ON CONFLICT (email_norm) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    department = EXCLUDED.department,
                    title = EXCLUDED.title,
                    is_active = EXCLUDED.is_active
            """), p)
            person_rows += 1

        for email, src, uid in xrefs:
            if not uid:
                continue
            conn.execute(text("""
                INSERT INTO core.dim_person_xref (person_sk, source_system, source_user_id, match_method)
                SELECT person_sk, :src, :uid, 'email' FROM core.dim_person WHERE email_norm = :email
                ON CONFLICT (source_system, source_user_id) DO NOTHING
            """), {"src": src, "uid": uid, "email": email})
            xref_rows += 1

    return {"dim_person": person_rows, "dim_person_xref": xref_rows}
```

- [ ] **Step 4: Run unit tests**

```bash
pytest tests/unit/test_mdm.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/etl/mdm.py tests/unit/test_mdm.py
git commit -m "etl: MDM identity resolution (dim_person + xref)"
```

---

### Task 10: Gold transform — load core dims (clients/contracts/sites/equipment/projects/vehicles/rooms/departments)

**Files:**
- Create: `app/etl/load_dims.py`

Each loader reads `stg_*` from Mongo and upserts to `core.dim_*` in PG via `INSERT ... ON CONFLICT (source_id) DO UPDATE`. Departments are loaded by name from `stg_*_users.department`.

- [ ] **Step 1: Create `app/etl/load_dims.py`**:

```python
from sqlalchemy import text
from app.db.connections import connections


def _upsert(conn, sql: str, rows: list[dict]) -> int:
    n = 0
    for row in rows:
        conn.execute(text(sql), row)
        n += 1
    return n


def load_dim_department() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    names = set()
    for coll in ("stg_opm_users", "stg_pma_users", "stg_pte_users"):
        for raw in db[coll].find({}, {"payload.department": 1, "payload.departement": 1}):
            p = raw.get("payload", raw)
            d = p.get("department") or p.get("departement")
            if d:
                names.add(d.strip())
    with connections.pg_engine.begin() as conn:
        for name in names:
            conn.execute(text(
                "INSERT INTO core.dim_department (name) VALUES (:name) "
                "ON CONFLICT (name) DO NOTHING"
            ), {"name": name})
    return len(names)


def load_dim_client() -> int:
    db = connections.warehouse_db
    seen: dict[str, str] = {}
    for raw in db["stg_opm_contracts"].find({}):
        p = raw.get("payload", raw)
        name = (p.get("clientName") or p.get("client") or "").strip()
        if name:
            seen[name] = p.get("country")
    with connections.pg_engine.begin() as conn:
        for name, country in seen.items():
            conn.execute(text(
                "INSERT INTO core.dim_client (name, country) VALUES (:n, :c) "
                "ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country"
            ), {"n": name, "c": country})
    return len(seen)


def load_dim_contract() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for raw in db["stg_opm_contracts"].find({}):
            p = raw.get("payload", raw)
            conn.execute(text("""
                INSERT INTO core.dim_contract
                  (source_id, contract_number, type, nature, sla_hours, start_date, end_date, client_sk)
                VALUES (:sid, :num, :tp, :nat, :sla, :sd, :ed,
                  (SELECT client_sk FROM core.dim_client WHERE name = :cname))
                ON CONFLICT (source_id) DO UPDATE SET
                  contract_number = EXCLUDED.contract_number,
                  type = EXCLUDED.type,
                  nature = EXCLUDED.nature,
                  sla_hours = EXCLUDED.sla_hours,
                  end_date = EXCLUDED.end_date
            """), {
                "sid": str(p.get("_id")),
                "num": p.get("contractNumber"),
                "tp":  p.get("type"),
                "nat": p.get("nature"),
                "sla": p.get("slaHours"),
                "sd":  p.get("startDate"),
                "ed":  p.get("endDate"),
                "cname": (p.get("clientName") or p.get("client") or "").strip() or None,
            })
            n += 1
    return n


# Similar shape for: load_dim_site, load_dim_equipment, load_dim_project,
# load_dim_vehicle, load_dim_room. Each reads from its silver collection,
# upserts by source_id, and resolves FKs via subselect on (name|source_id).
def load_dim_site() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for raw in db["stg_opm_sites"].find({}):
            p = raw.get("payload", raw)
            conn.execute(text("""
                INSERT INTO core.dim_site (source_id, name, address, lat, lon, client_sk)
                VALUES (:sid, :nm, :addr, :lat, :lon,
                  (SELECT client_sk FROM core.dim_client WHERE name = :cname))
                ON CONFLICT (source_id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address
            """), {
                "sid": str(p.get("_id")), "nm": p.get("name"),
                "addr": p.get("address"),
                "lat": p.get("lat"), "lon": p.get("lon"),
                "cname": (p.get("clientName") or "").strip() or None,
            })
            n += 1
    return n


def load_dim_equipment() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for coll, kind in [("stg_opm_equipment", "HARD"), ("stg_opm_equipment_soft", "SOFT")]:
            for raw in db[coll].find({}):
                p = raw.get("payload", raw)
                conn.execute(text("""
                    INSERT INTO core.dim_equipment
                      (source_id, serial_number, name, kind, version, constructor, site_sk, contract_sk)
                    VALUES (:sid, :sn, :nm, :kd, :ver, :cst,
                      (SELECT site_sk FROM core.dim_site WHERE source_id = :site_sid),
                      (SELECT contract_sk FROM core.dim_contract WHERE source_id = :ct_sid))
                    ON CONFLICT (source_id) DO UPDATE SET
                      name = EXCLUDED.name, version = EXCLUDED.version
                """), {
                    "sid": str(p.get("_id")),
                    "sn": p.get("serialNumber"), "nm": p.get("name"),
                    "kd": kind, "ver": p.get("version"), "cst": p.get("constructor"),
                    "site_sid": str(p.get("site") or ""),
                    "ct_sid": str(p.get("contract") or ""),
                })
                n += 1
    return n


def load_dim_project() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for raw in db["stg_pma_projects"].find({}):
            p = raw.get("payload", raw)
            tl_uid = str(p.get("teamLeader") or "")
            conn.execute(text("""
                INSERT INTO core.dim_project
                  (source_id, name, type, priority,
                   team_leader_person_sk, start_date, end_date, closed_at)
                VALUES (:sid, :nm, :tp, :pr,
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PMA' AND source_user_id=:tl),
                  :sd, :ed, :cl)
                ON CONFLICT (source_id) DO UPDATE SET
                  name = EXCLUDED.name, priority = EXCLUDED.priority, closed_at = EXCLUDED.closed_at
            """), {
                "sid": str(p.get("_id")), "nm": p.get("name"),
                "tp": p.get("type"), "pr": p.get("priority"),
                "tl": tl_uid, "sd": p.get("startDate"),
                "ed": p.get("endDate"), "cl": p.get("closedAt"),
            })
            n += 1
    return n


def load_dim_vehicle() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for raw in db["stg_pte_vehicles"].find({}):
            p = raw.get("payload", raw)
            conn.execute(text("""
                INSERT INTO core.dim_vehicle (source_id, registration, model, type)
                VALUES (:sid, :reg, :md, :tp)
                ON CONFLICT (source_id) DO UPDATE SET model = EXCLUDED.model
            """), {"sid": str(p.get("_id")), "reg": p.get("registration"),
                   "md": p.get("model"), "tp": p.get("type")})
            n += 1
    return n


def load_dim_room() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for raw in db["stg_pte_rooms"].find({}):
            p = raw.get("payload", raw)
            conn.execute(text("""
                INSERT INTO core.dim_room (source_id, label, location, capacity)
                VALUES (:sid, :lb, :loc, :cap)
                ON CONFLICT (source_id) DO UPDATE SET label = EXCLUDED.label
            """), {"sid": str(p.get("_id")), "lb": p.get("label") or p.get("name"),
                   "loc": p.get("location"), "cap": p.get("capacity")})
            n += 1
    return n


def load_all_dims() -> dict[str, int]:
    return {
        "dim_department": load_dim_department(),
        "dim_client":     load_dim_client(),
        "dim_contract":   load_dim_contract(),
        "dim_site":       load_dim_site(),
        "dim_equipment":  load_dim_equipment(),
        "dim_project":    load_dim_project(),
        "dim_vehicle":    load_dim_vehicle(),
        "dim_room":       load_dim_room(),
    }
```

- [ ] **Step 2: Integration smoke** — append to `tests/integration/test_etl_pipeline_pg.py` (created in Task 12). For now skip.

- [ ] **Step 3: Commit**

```bash
git add app/etl/load_dims.py
git commit -m "etl: gold dim loaders (client/contract/site/equipment/project/vehicle/room/department)"
```

---

### Task 11: Gold transform — load junk dim_status and facts

**Files:**
- Create: `app/etl/load_facts.py`

`dim_status` is populated by scanning silver rows for unseen flag combinations and inserting before facts. Each fact loader resolves all FKs via lookup subselects (cached in dicts for perf if needed).

- [ ] **Step 1: Create `app/etl/load_facts.py`**:

```python
from datetime import datetime
from sqlalchemy import text

from app.db.connections import connections


def _date_sk(dt: datetime | None) -> int | None:
    if not dt:
        return None
    return dt.year * 10000 + dt.month * 100 + dt.day


def _hour_sk(dt: datetime | None) -> int | None:
    return dt.hour if dt else None


def _upsert_status(conn, **flags) -> int | None:
    """Insert a status combo if missing; return its status_sk."""
    res = conn.execute(text("""
        INSERT INTO core.dim_status
          (ticket_status, task_status, event_status, is_overdue, is_expired,
           is_helpdesk, is_sla_breach, is_accepted)
        VALUES (:ticket_status, :task_status, :event_status, :is_overdue, :is_expired,
                :is_helpdesk, :is_sla_breach, :is_accepted)
        ON CONFLICT DO NOTHING
        RETURNING status_sk
    """), flags).first()
    if res:
        return res[0]
    row = conn.execute(text("""
        SELECT status_sk FROM core.dim_status WHERE
          COALESCE(ticket_status,'') = COALESCE(:ticket_status,'') AND
          COALESCE(task_status,'')   = COALESCE(:task_status,'') AND
          COALESCE(event_status,'')  = COALESCE(:event_status,'') AND
          COALESCE(is_overdue,FALSE) = COALESCE(:is_overdue,FALSE) AND
          COALESCE(is_expired,FALSE) = COALESCE(:is_expired,FALSE) AND
          COALESCE(is_helpdesk,FALSE)= COALESCE(:is_helpdesk,FALSE) AND
          COALESCE(is_sla_breach,FALSE)=COALESCE(:is_sla_breach,FALSE) AND
          COALESCE(is_accepted,FALSE)= COALESCE(:is_accepted,FALSE)
    """), flags).first()
    return row[0] if row else None


def load_fact_opm_ticket() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for stg in db["stg_opm_tickets"].find({}):
            status_sk = _upsert_status(conn,
                ticket_status=stg.get("status"), task_status=None, event_status=None,
                is_overdue=None, is_expired=stg.get("is_expired"),
                is_helpdesk=stg.get("is_helpdesk"), is_sla_breach=stg.get("is_sla_breach"),
                is_accepted=None)
            conn.execute(text("""
                INSERT INTO core.fact_opm_ticket (
                  source_id, ticket_number, source_system_sk,
                  created_date_sk, created_hour_sk, assigned_date_sk, resolved_date_sk, closed_date_sk,
                  contract_sk, site_sk, equipment_sk,
                  client_person_sk, assigned_technician_person_sk, status_sk,
                  time_to_assign_min, time_to_resolve_min, time_to_close_min, reopen_count
                )
                VALUES (
                  :sid, :tn,
                  (SELECT source_system_sk FROM core.dim_source_system WHERE code='OPM'),
                  :cd, :ch, :ad, :rd, :cld,
                  (SELECT contract_sk FROM core.dim_contract WHERE source_id = :ct),
                  (SELECT site_sk FROM core.dim_site WHERE source_id = :st),
                  (SELECT equipment_sk FROM core.dim_equipment WHERE source_id = :eq),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='OPM' AND source_user_id=:cli),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='OPM' AND source_user_id=:tech),
                  :status_sk, :tta, :ttr, :ttc, :rc
                )
                ON CONFLICT (source_id) DO UPDATE SET
                  status_sk = EXCLUDED.status_sk,
                  resolved_date_sk = EXCLUDED.resolved_date_sk,
                  closed_date_sk = EXCLUDED.closed_date_sk,
                  time_to_resolve_min = EXCLUDED.time_to_resolve_min,
                  time_to_close_min = EXCLUDED.time_to_close_min,
                  reopen_count = EXCLUDED.reopen_count,
                  etl_loaded_at = NOW()
            """), {
                "sid": stg["source_id"], "tn": stg.get("ticket_number"),
                "cd": _date_sk(stg.get("created_at")), "ch": _hour_sk(stg.get("created_at")),
                "ad": _date_sk(stg.get("assigned_at")),
                "rd": _date_sk(stg.get("resolved_at")),
                "cld": _date_sk(stg.get("closed_at")),
                "ct":   str(stg.get("contract_source_id") or ""),
                "st":   str(stg.get("site_source_id") or ""),
                "eq":   str(stg.get("equipment_source_id") or ""),
                "cli":  str(stg.get("client_source_id") or ""),
                "tech": str(stg.get("technician_source_id") or ""),
                "status_sk": status_sk,
                "tta": stg.get("time_to_assign_min"),
                "ttr": stg.get("time_to_resolve_min"),
                "ttc": stg.get("time_to_close_min"),
                "rc":  stg.get("reopen_count") or 0,
            })
            n += 1
    return n


def load_fact_pma_task() -> int:
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for stg in db["stg_pma_tasks"].find({}):
            status_sk = _upsert_status(conn,
                ticket_status=None, task_status=stg.get("status"), event_status=None,
                is_overdue=stg.get("is_overdue"), is_expired=None,
                is_helpdesk=None, is_sla_breach=None,
                is_accepted=stg.get("is_accepted"))
            conn.execute(text("""
                INSERT INTO core.fact_pma_task (
                  source_id, task_ref, source_system_sk,
                  project_sk, executor_person_sk, team_leader_person_sk,
                  start_date_sk, deadline_date_sk, closed_date_sk,
                  status_sk, priority_sk, progress_pct, note, rating_weight, duration_days
                )
                VALUES (
                  :sid, :ref,
                  (SELECT source_system_sk FROM core.dim_source_system WHERE code='PMA'),
                  (SELECT project_sk FROM core.dim_project WHERE source_id=:proj),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PMA' AND source_user_id=:exe),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PMA' AND source_user_id=:tl),
                  :sd, :dd, :cd,
                  :status_sk,
                  (SELECT priority_sk FROM core.dim_priority WHERE level = COALESCE(:pri,'Unknown')),
                  :prog, :note, :rw, :dur
                )
                ON CONFLICT (source_id) DO UPDATE SET
                  status_sk = EXCLUDED.status_sk,
                  closed_date_sk = EXCLUDED.closed_date_sk,
                  progress_pct = EXCLUDED.progress_pct,
                  note = EXCLUDED.note,
                  duration_days = EXCLUDED.duration_days,
                  etl_loaded_at = NOW()
            """), {
                "sid": stg["source_id"], "ref": stg.get("task_ref"),
                "proj": str(stg.get("project_source_id") or ""),
                "exe": str(stg.get("executor_source_id") or ""),
                "tl":  str(stg.get("team_leader_source_id") or ""),
                "sd": _date_sk(stg.get("start_at")),
                "dd": _date_sk(stg.get("deadline_at")),
                "cd": _date_sk(stg.get("closed_at")),
                "status_sk": status_sk,
                "pri": stg.get("priority"),
                "prog": stg.get("progress_pct"),
                "note": stg.get("note"),
                "rw": stg.get("rating_weight"),
                "dur": stg.get("duration_days"),
            })
            n += 1
    return n


def load_fact_pte_event() -> int:
    db = connections.warehouse_db
    n = 0
    silver_colls = [
        ("stg_pte_leaves",          "OPM_ignored"),  # source_system in xref → PTE
        ("stg_pte_vehicle_events",  None),
        ("stg_pte_room_events",     None),
        ("stg_pte_virtualization",  None),
        ("stg_pte_user_events",     None),
    ]
    with connections.pg_engine.begin() as conn:
        for coll, _ in silver_colls:
            for stg in db[coll].find({}):
                status_sk = _upsert_status(conn,
                    ticket_status=None, task_status=None,
                    event_status=stg.get("status"),
                    is_overdue=None, is_expired=None,
                    is_helpdesk=None, is_sla_breach=None,
                    is_accepted=stg.get("is_accepted"))
                conn.execute(text("""
                    INSERT INTO core.fact_pte_event (
                      source_id, event_type, source_system_sk,
                      event_date_sk, event_hour_sk, end_date_sk,
                      applicant_person_sk, engineer_person_sk,
                      vehicle_sk, room_sk, leave_type_sk, status_sk,
                      duration_min, km, ram_gb, disk_gb, business_days
                    )
                    VALUES (
                      :sid, :etype,
                      (SELECT source_system_sk FROM core.dim_source_system WHERE code='PTE'),
                      :sd, :sh, :ed,
                      (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PTE' AND source_user_id=:app),
                      (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PTE' AND source_user_id=:eng),
                      (SELECT vehicle_sk FROM core.dim_vehicle WHERE source_id=:veh),
                      (SELECT room_sk FROM core.dim_room WHERE source_id=:room),
                      (SELECT leave_type_sk FROM core.dim_leave_type WHERE code=:lt),
                      :status_sk, :dur, :km, :ram, :disk, :bd
                    )
                    ON CONFLICT (source_id) DO UPDATE SET
                      status_sk = EXCLUDED.status_sk,
                      end_date_sk = EXCLUDED.end_date_sk,
                      duration_min = EXCLUDED.duration_min,
                      etl_loaded_at = NOW()
                """), {
                    "sid": stg["source_id"], "etype": stg["event_type"],
                    "sd": _date_sk(stg.get("event_start")),
                    "sh": _hour_sk(stg.get("event_start")),
                    "ed": _date_sk(stg.get("event_end")),
                    "app": str(stg.get("applicant_source_id") or ""),
                    "eng": str(stg.get("engineer_source_id") or ""),
                    "veh": str(stg.get("vehicle_source_id") or ""),
                    "room": str(stg.get("room_source_id") or ""),
                    "lt": stg.get("leave_type_code"),
                    "status_sk": status_sk,
                    "dur": stg.get("duration_min"),
                    "km": stg.get("km"),
                    "ram": stg.get("ram_gb"),
                    "disk": stg.get("disk_gb"),
                    "bd": stg.get("business_days"),
                })
                n += 1
    return n


def load_all_facts() -> dict[str, int]:
    return {
        "fact_opm_ticket": load_fact_opm_ticket(),
        "fact_pma_task":   load_fact_pma_task(),
        "fact_pte_event":  load_fact_pte_event(),
    }
```

- [ ] **Step 2: Commit**

```bash
git add app/etl/load_facts.py
git commit -m "etl: gold fact loaders + dim_status junk population"
```

---

### Task 12: Pipeline + backfill orchestration

**Files:**
- Modify: `app/etl/pipeline.py`
- Create: `tests/integration/test_etl_pipeline_pg.py`

- [ ] **Step 1: Rewrite `app/etl/pipeline.py`**:

```python
import uuid
from datetime import datetime, timezone

from app.db.connections import connections
from app.db.pg_apply import apply_sql_dir
from app.db.warehouse_schema import ensure_warehouse_schema
from app.etl.extract import extract_all, save_bronze
from app.etl.transform_silver import run_silver
from app.etl.mdm import run_mdm
from app.etl.load_dims import load_all_dims
from app.etl.load_facts import load_all_facts


def run_full_etl(skip_extract: bool = False) -> dict:
    connections.initialize()
    ensure_warehouse_schema(connections.warehouse_db)
    apply_sql_dir("app/db/ddl")
    apply_sql_dir("seeds")

    etl_run_id = uuid.uuid4().hex
    started = datetime.now(timezone.utc)
    counts: dict = {"etl_run_id": etl_run_id, "started_at": started.isoformat()}

    if not skip_extract:
        extracted = extract_all()
        counts["bronze"] = save_bronze(extracted, etl_run_id)
    counts["silver"] = run_silver(etl_run_id if not skip_extract else None)
    counts["mdm"] = run_mdm()
    counts["dims"] = load_all_dims()
    counts["facts"] = load_all_facts()
    counts["finished_at"] = datetime.now(timezone.utc).isoformat()

    connections.warehouse_db.etl_runs.insert_one({
        "run_id": etl_run_id,
        "started_at": started,
        "finished_at": datetime.now(timezone.utc),
        "status": "ok",
        "counts": counts,
    })
    return counts


def run_backfill_etl() -> dict:
    """Replay silver→gold from existing bronze without hitting REST."""
    return run_full_etl(skip_extract=True)
```

- [ ] **Step 2: Integration test** — `tests/integration/test_etl_pipeline_pg.py`:

```python
import os
import pytest
from sqlalchemy import text

from app.db.connections import connections


@pytest.mark.skipif(not (os.getenv("PG_URL") and os.getenv("MONGO_URI")),
                    reason="requires PG_URL + MONGO_URI")
def test_backfill_idempotent():
    from app.etl.pipeline import run_backfill_etl
    r1 = run_backfill_etl()
    r2 = run_backfill_etl()
    connections.require_initialized()
    with connections.pg_engine.connect() as conn:
        n_dup = conn.execute(text(
            "SELECT COUNT(*) FROM (SELECT source_id FROM core.fact_opm_ticket "
            "GROUP BY source_id HAVING COUNT(*) > 1) x")).scalar()
    assert n_dup == 0
```

- [ ] **Step 3: Commit**

```bash
git add app/etl/pipeline.py tests/integration/test_etl_pipeline_pg.py
git commit -m "etl: orchestrated full + backfill pipeline with run tracking"
```

---

### Task 13: Scheduler — ETL cadence + report jobs hook

**Files:**
- Modify: `app/etl/scheduler.py`

- [ ] **Step 1: Update `app/etl/scheduler.py`** to register two job sets:

```python
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import get_settings
from app.etl.pipeline import run_full_etl

scheduler: BackgroundScheduler | None = None


def start_scheduler() -> BackgroundScheduler:
    global scheduler
    if scheduler:
        return scheduler
    s = get_settings()
    scheduler = BackgroundScheduler(timezone=s.scheduler_timezone)
    scheduler.add_job(run_full_etl, CronTrigger.from_crontab(s.scheduler_cron),
                       id="etl_full", replace_existing=True, misfire_grace_time=600)
    _load_report_jobs(scheduler)
    scheduler.start()
    return scheduler


def _load_report_jobs(s: BackgroundScheduler) -> None:
    # Implemented in Task 22 once report_configs collection exists.
    from app.services.report_runner import refresh_report_jobs
    refresh_report_jobs(s)
```

- [ ] **Step 2: Commit**

```bash
git add app/etl/scheduler.py
git commit -m "etl: scheduler registers full ETL + dynamic report jobs"
```

---

## Group C — Auth & Users

### Task 14: Security — JWT + bcrypt + dependencies

**Files:**
- Modify: `app/core/security.py`
- Create: `tests/unit/test_security.py`

- [ ] **Step 1: Failing test** — `tests/unit/test_security.py`:

```python
from app.core.security import hash_password, verify_password, create_access_token, decode_token


def test_password_round_trip():
    h = hash_password("s3cret")
    assert verify_password("s3cret", h)
    assert not verify_password("wrong", h)


def test_jwt_round_trip():
    tok = create_access_token({"sub": "user-1", "role": "admin"})
    claims = decode_token(tok)
    assert claims["sub"] == "user-1"
    assert claims["role"] == "admin"
```

- [ ] **Step 2: Implement `app/core/security.py`**:

```python
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _pwd.verify(password, hashed)


def create_access_token(claims: dict[str, Any], expires_in: int | None = None) -> str:
    s = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(seconds=expires_in or s.jwt_expires_in)
    payload = {**claims, "exp": exp}
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e))


def get_current_user(token: str = Depends(_oauth2)) -> dict:
    return decode_token(token)


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin role required")
    return user
```

- [ ] **Step 3: Run**

```bash
pytest tests/unit/test_security.py -v
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/core/security.py tests/unit/test_security.py
git commit -m "auth: JWT + bcrypt + RBAC dependencies"
```

---

### Task 15: User model + repository

**Files:**
- Create: `app/models/__init__.py`, `app/models/user.py`

- [ ] **Step 1: Implement `app/models/user.py`**:

```python
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

from app.db.connections import connections
from app.core.security import hash_password


Role = Literal["admin", "viewer"]


class UserIn(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: Role = "viewer"
    isEnabled: bool = True


class UserOut(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    role: Role
    isEnabled: bool
    createdAt: datetime


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.users


def create_user(payload: UserIn) -> UserOut:
    doc = payload.model_dump()
    doc["password_hash"] = hash_password(doc.pop("password"))
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["updatedAt"] = doc["createdAt"]
    res = _coll().insert_one(doc)
    return UserOut(id=str(res.inserted_id), **{k: doc[k] for k in ("fullName","email","role","isEnabled","createdAt")})


def find_by_email(email: str) -> dict | None:
    return _coll().find_one({"email": email})
```

- [ ] **Step 2: Commit**

```bash
git add app/models/__init__.py app/models/user.py
git commit -m "models: User Pydantic + Mongo repo"
```

---

### Task 16: Auth + Users routes

**Files:**
- Create: `app/api/routes/auth.py`, `app/api/routes/users.py`

- [ ] **Step 1: Implement `app/api/routes/auth.py`**:

```python
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import verify_password, create_access_token, get_current_user
from app.models.user import create_user, find_by_email, UserIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: UserIn):
    if find_by_email(payload.email):
        raise HTTPException(409, "Email already registered")
    return create_user(payload)


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = find_by_email(form.username)
    if not user or not verify_password(form.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.get("isEnabled", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
```

- [ ] **Step 2: Implement `app/api/routes/users.py`**:

```python
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import csv, io

from app.core.security import require_admin
from app.db.connections import connections
from app.models.user import UserIn, UserOut, create_user

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_admin)])


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.users


@router.post("", response_model=UserOut)
def add_user(payload: UserIn):
    return create_user(payload)


@router.get("")
def list_users():
    rows = list(_coll().find({}, {"password_hash": 0}))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.get("/export")
def export_csv():
    rows = list(_coll().find({}, {"password_hash": 0}))
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "fullName", "email", "role", "isEnabled", "createdAt"])
    for r in rows:
        w.writerow([str(r["_id"]), r.get("fullName"), r.get("email"),
                    r.get("role"), r.get("isEnabled"), r.get("createdAt")])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"})


@router.put("/{user_id}")
def update_user(user_id: str, payload: dict):
    payload.pop("password_hash", None)
    res = _coll().update_one({"_id": ObjectId(user_id)}, {"$set": payload})
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.delete("/{user_id}")
def delete_user(user_id: str):
    res = _coll().delete_one({"_id": ObjectId(user_id)})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/routes/auth.py app/api/routes/users.py
git commit -m "api: auth (register/login/me) + admin users CRUD"
```

---

## Group D — Reports

### Task 17: Report config + run models

**Files:**
- Create: `app/models/report_config.py`, `app/models/report_run.py`

- [ ] **Step 1: Implement `app/models/report_config.py`**:

```python
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field

from app.db.connections import connections


class Schedule(BaseModel):
    enabled: bool = False
    frequency: Literal["daily", "weekly", "monthly"] = "weekly"
    recipients: list[str] = []
    lastSentAt: datetime | None = None


class ReportConfig(BaseModel):
    id: str | None = None
    name: str
    owner: str
    kpis: list[str]
    filters: dict = {}
    schedule: Schedule = Field(default_factory=Schedule)
    format: Literal["pdf", "xlsx", "json"] = "pdf"
    createdAt: datetime | None = None


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_configs
```

- [ ] **Step 2: Implement `app/models/report_run.py`**:

```python
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel

from app.db.connections import connections


class ReportRun(BaseModel):
    id: str | None = None
    report_id: str
    started_at: datetime
    finished_at: datetime | None = None
    status: Literal["running", "success", "failed"]
    format: str
    file_path: str | None = None
    recipients: list[str] = []
    error: str | None = None


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_runs
```

- [ ] **Step 3: Commit**

```bash
git add app/models/report_config.py app/models/report_run.py
git commit -m "models: ReportConfig + ReportRun"
```

---

### Task 18: Report runner (executes a config's KPIs)

**Files:**
- Create: `app/services/__init__.py`, `app/services/report_runner.py`

- [ ] **Step 1: Implement `app/services/report_runner.py`**:

```python
from datetime import datetime, timezone
from bson import ObjectId

from app.db.connections import connections
from app.metrics.query_engine import run_metric_query


def run_report(report_id: str) -> dict:
    db = connections.warehouse_db
    cfg = db.report_configs.find_one({"_id": ObjectId(report_id)})
    if not cfg:
        raise ValueError(f"Report {report_id} not found")
    filters = cfg.get("filters") or {}
    bundles = []
    for kpi in cfg["kpis"]:
        bundles.append({
            "kpi": kpi,
            "result": run_metric_query(kpi, [], filters, limit=500, include_comparison=False),
        })
    return {
        "report_id": report_id,
        "name": cfg["name"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "filters": filters,
        "kpis": bundles,
    }


def refresh_report_jobs(scheduler) -> None:
    """Sync APScheduler jobs to the current enabled report_configs."""
    from apscheduler.triggers.cron import CronTrigger
    db = connections.warehouse_db
    # remove existing report jobs
    for j in list(scheduler.get_jobs()):
        if j.id.startswith("report:"):
            scheduler.remove_job(j.id)
    cron = {"daily": "0 8 * * *", "weekly": "0 8 * * 1", "monthly": "0 8 1 * *"}
    for cfg in db.report_configs.find({"schedule.enabled": True}):
        rid = str(cfg["_id"])
        freq = cfg.get("schedule", {}).get("frequency", "weekly")
        scheduler.add_job(
            _scheduled_run, CronTrigger.from_crontab(cron[freq]),
            args=[rid], id=f"report:{rid}", replace_existing=True,
        )


def _scheduled_run(report_id: str) -> None:
    from app.services.report_export import export_report
    from app.services.mailer import send_report_email
    cfg = connections.warehouse_db.report_configs.find_one({"_id": ObjectId(report_id)})
    fmt = cfg.get("format", "pdf")
    bundle = run_report(report_id)
    path = export_report(report_id, fmt, bundle)
    recipients = cfg.get("schedule", {}).get("recipients") or []
    if recipients:
        send_report_email(recipients, cfg["name"], path)
    connections.warehouse_db.report_configs.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"schedule.lastSentAt": datetime.now(timezone.utc)}},
    )
```

- [ ] **Step 2: Commit**

```bash
git add app/services/__init__.py app/services/report_runner.py
git commit -m "services: report runner + scheduled job loader"
```

---

### Task 19: Report export — PDF (reportlab) + XLSX (openpyxl) + JSON

**Files:**
- Create: `app/services/report_export.py`
- Create: `tests/unit/test_report_export.py`

- [ ] **Step 1: Failing test** — `tests/unit/test_report_export.py`:

```python
import os, tempfile
from app.services.report_export import _render_xlsx, _render_pdf, _render_json


SAMPLE = {
    "report_id": "r1", "name": "test", "generated_at": "2026-05-18T08:00:00Z",
    "filters": {"dateFrom": "2026-01-01"},
    "kpis": [{"kpi": "opm.tickets.by_status",
              "result": {"data": [{"status": "Resolved", "value": 12}]}}],
}


def test_json_render(tmp_path):
    p = tmp_path / "r.json"
    _render_json(SAMPLE, str(p))
    assert p.read_text().startswith("{")


def test_xlsx_render(tmp_path):
    p = tmp_path / "r.xlsx"
    _render_xlsx(SAMPLE, str(p))
    assert p.stat().st_size > 0


def test_pdf_render(tmp_path):
    p = tmp_path / "r.pdf"
    _render_pdf(SAMPLE, str(p))
    assert p.read_bytes().startswith(b"%PDF")
```

- [ ] **Step 2: Implement `app/services/report_export.py`**:

```python
import json
import os
from pathlib import Path
from uuid import uuid4

from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer

from app.core.config import get_settings


def _output_path(report_id: str, fmt: str) -> str:
    base = Path(get_settings().reports_storage_path) / report_id
    base.mkdir(parents=True, exist_ok=True)
    return str(base / f"{uuid4().hex}.{fmt}")


def _render_json(bundle: dict, path: str) -> None:
    Path(path).write_text(json.dumps(bundle, indent=2, default=str), encoding="utf-8")


def _render_xlsx(bundle: dict, path: str) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Summary"
    ws.append(["Report", bundle.get("name")])
    ws.append(["Generated", bundle.get("generated_at")])
    for kb in bundle["kpis"]:
        sheet = wb.create_sheet(kb["kpi"][:31])
        data = kb["result"].get("data") or []
        if not data:
            sheet.append(["(empty)"])
            continue
        cols = list(data[0].keys())
        sheet.append(cols)
        for row in data:
            sheet.append([row.get(c) for c in cols])
    wb.save(path)


def _render_pdf(bundle: dict, path: str) -> None:
    doc = SimpleDocTemplate(path, pagesize=A4)
    styles = getSampleStyleSheet()
    flow = [Paragraph(bundle.get("name", "Report"), styles["Title"]),
            Paragraph(f"Generated: {bundle.get('generated_at')}", styles["Normal"]),
            Spacer(1, 12)]
    for kb in bundle["kpis"]:
        flow.append(Paragraph(kb["kpi"], styles["Heading2"]))
        data = kb["result"].get("data") or []
        if not data:
            flow.append(Paragraph("(no data)", styles["Normal"]))
            continue
        cols = list(data[0].keys())
        rows = [cols] + [[str(r.get(c, "")) for c in cols] for r in data]
        flow.append(Table(rows))
        flow.append(Spacer(1, 12))
    doc.build(flow)


def export_report(report_id: str, fmt: str, bundle: dict) -> str:
    path = _output_path(report_id, fmt)
    if fmt == "pdf":
        _render_pdf(bundle, path)
    elif fmt == "xlsx":
        _render_xlsx(bundle, path)
    else:
        _render_json(bundle, path)
    return path
```

- [ ] **Step 3: Run**

```bash
pytest tests/unit/test_report_export.py -v
```

- [ ] **Step 4: Commit**

```bash
git add app/services/report_export.py tests/unit/test_report_export.py
git commit -m "services: report export (PDF/XLSX/JSON)"
```

---

### Task 20: Mailer

**Files:**
- Create: `app/services/mailer.py`

- [ ] **Step 1: Implement `app/services/mailer.py`**:

```python
import asyncio
from pathlib import Path

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import get_settings


def _config() -> ConnectionConfig:
    s = get_settings()
    return ConnectionConfig(
        MAIL_USERNAME=s.mail_user or "",
        MAIL_PASSWORD=s.mail_password or "",
        MAIL_FROM=s.mail_from,
        MAIL_PORT=s.mail_port,
        MAIL_SERVER=s.mail_host,
        MAIL_STARTTLS=s.mail_tls,
        MAIL_SSL_TLS=s.mail_ssl,
        USE_CREDENTIALS=bool(s.mail_user),
        VALIDATE_CERTS=False,
    )


def send_report_email(recipients: list[str], subject: str, attachment_path: str) -> None:
    msg = MessageSchema(
        subject=f"Scheduled Report — {subject}",
        recipients=recipients,
        body=f"Attached: {Path(attachment_path).name}",
        subtype=MessageType.plain,
        attachments=[attachment_path],
    )
    asyncio.run(FastMail(_config()).send_message(msg))
```

- [ ] **Step 2: Commit**

```bash
git add app/services/mailer.py
git commit -m "services: fastapi-mail wrapper"
```

---

### Task 21: Reports API routes

**Files:**
- Create: `app/api/routes/reports.py`

- [ ] **Step 1: Implement `app/api/routes/reports.py`**:

```python
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.security import get_current_user
from app.db.connections import connections
from app.services.report_runner import run_report
from app.services.report_export import export_report
from app.models.report_config import ReportConfig

router = APIRouter(prefix="/reports", tags=["reports"])


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_configs


def _runs():
    return connections.warehouse_db.report_runs


@router.post("")
def create_report(cfg: ReportConfig, user: dict = Depends(get_current_user)):
    doc = cfg.model_dump(exclude={"id", "createdAt"})
    doc["owner"] = user["sub"]
    doc["createdAt"] = datetime.now(timezone.utc)
    res = _coll().insert_one(doc)
    return {"id": str(res.inserted_id), **doc}


@router.get("")
def list_reports(user: dict = Depends(get_current_user)):
    rows = list(_coll().find({"owner": user["sub"]}))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.get("/{rid}")
def get_report(rid: str, user: dict = Depends(get_current_user)):
    r = _coll().find_one({"_id": ObjectId(rid), "owner": user["sub"]})
    if not r:
        raise HTTPException(404, "Not found")
    r["id"] = str(r.pop("_id"))
    return r


@router.put("/{rid}")
def update_report(rid: str, payload: dict, user: dict = Depends(get_current_user)):
    res = _coll().update_one(
        {"_id": ObjectId(rid), "owner": user["sub"]},
        {"$set": payload},
    )
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.delete("/{rid}")
def delete_report(rid: str, user: dict = Depends(get_current_user)):
    res = _coll().delete_one({"_id": ObjectId(rid), "owner": user["sub"]})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.post("/{rid}/run")
def run(rid: str, user: dict = Depends(get_current_user)):
    return run_report(rid)


@router.get("/{rid}/export")
def export_(rid: str, format: str = "pdf", user: dict = Depends(get_current_user)):
    bundle = run_report(rid)
    started = datetime.now(timezone.utc)
    try:
        path = export_report(rid, format, bundle)
        _runs().insert_one({"report_id": rid, "started_at": started,
                            "finished_at": datetime.now(timezone.utc),
                            "status": "success", "format": format, "file_path": path})
    except Exception as e:
        _runs().insert_one({"report_id": rid, "started_at": started,
                            "finished_at": datetime.now(timezone.utc),
                            "status": "failed", "format": format, "error": str(e)})
        raise
    return FileResponse(path, filename=f"{rid}.{format}")


@router.get("/{rid}/history")
def history(rid: str, user: dict = Depends(get_current_user)):
    rows = list(_runs().find({"report_id": rid}).sort("started_at", -1).limit(50))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.post("/_scheduler/refresh")
def refresh(user: dict = Depends(get_current_user)):
    from app.etl.scheduler import scheduler
    from app.services.report_runner import refresh_report_jobs
    if scheduler:
        refresh_report_jobs(scheduler)
    return {"ok": True}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/routes/reports.py
git commit -m "api: reports CRUD + run + export + history"
```

---

### Task 22: Scheduler — finalize report job wiring

**Files:**
- Modify: `app/etl/scheduler.py` (no further code; verify import already done in Task 13)

- [ ] **Step 1: Verify both job sets register at startup**

```bash
python -c "from app.etl.scheduler import start_scheduler; s = start_scheduler(); print([j.id for j in s.get_jobs()])"
```

Expected: includes `etl_full` and `report:<id>` for each enabled config.

- [ ] **Step 2: Commit** (no-op if nothing changed)

```bash
git commit --allow-empty -m "scheduler: verify ETL + report job registration"
```

---

## Group E — Metrics, Routes, Decommission

### Task 23: KPI registry rebuild — SQL-backed

**Files:**
- Modify: `app/metrics/definitions.py`, `app/metrics/registry.py`, `app/metrics/query_engine.py`

- [ ] **Step 1: Rewrite `app/metrics/definitions.py`**:

```python
# Each KPI maps to a mart view; group_by are optional columns to project.
KPI_DEFINITIONS = {
    # mart_exec
    "exec.company_throughput":     {"schema": "mart_exec", "view": "v_company_throughput",   "group_by": ["period"]},
    "exec.pm_scorecard":           {"schema": "mart_exec", "view": "v_pm_scorecard",         "group_by": ["team_leader"]},
    "exec.revenue_at_risk":        {"schema": "mart_exec", "view": "v_revenue_at_risk",      "group_by": []},
    "exec.client_health":          {"schema": "mart_exec", "view": "v_client_health",        "group_by": ["client"]},
    "exec.workforce_availability": {"schema": "mart_exec", "view": "v_workforce_availability","group_by": ["department","period"]},

    # mart_opm
    "opm.sla_compliance":          {"schema": "mart_opm",  "view": "v_sla_compliance",       "group_by": ["contract","period"]},
    "opm.mttr":                    {"schema": "mart_opm",  "view": "v_mttr",                 "group_by": ["contract"]},
    "opm.mtta":                    {"schema": "mart_opm",  "view": "v_mtta",                 "group_by": ["contract"]},
    "opm.first_call_resolution":   {"schema": "mart_opm",  "view": "v_first_call_resolution","group_by": ["period"]},
    "opm.technician_load":         {"schema": "mart_opm",  "view": "v_technician_load",      "group_by": ["technician"]},
    "opm.contract_health":         {"schema": "mart_opm",  "view": "v_contract_health",      "group_by": ["contract"]},

    # mart_pma
    "pma.portfolio_status":        {"schema": "mart_pma",  "view": "v_portfolio_status",     "group_by": ["status"]},
    "pma.on_time_delivery":        {"schema": "mart_pma",  "view": "v_on_time_delivery",     "group_by": ["period"]},
    "pma.team_leader_score":       {"schema": "mart_pma",  "view": "v_team_leader_score",    "group_by": ["team_leader"]},
    "pma.engineer_productivity":   {"schema": "mart_pma",  "view": "v_engineer_productivity","group_by": ["engineer"]},
    "pma.overdue_index":           {"schema": "mart_pma",  "view": "v_overdue_index",        "group_by": ["project"]},

    # mart_pte
    "pte.leave_consumption":       {"schema": "mart_pte",  "view": "v_leave_consumption",    "group_by": ["department","leave_type","period"]},
    "pte.headcount_active":        {"schema": "mart_pte",  "view": "v_headcount_active",     "group_by": ["department"]},
    "pte.vehicle_utilization":     {"schema": "mart_pte",  "view": "v_vehicle_utilization",  "group_by": ["vehicle"]},
    "pte.room_occupancy":          {"schema": "mart_pte",  "view": "v_room_occupancy",       "group_by": ["room"]},
    "pte.vm_lead_time":            {"schema": "mart_pte",  "view": "v_vm_lead_time",         "group_by": []},
    "pte.intervention_throughput": {"schema": "mart_pte",  "view": "v_intervention_throughput","group_by": ["engineer","period"]},
}
```

- [ ] **Step 2: Rewrite `app/metrics/registry.py`**:

```python
from app.metrics.definitions import KPI_DEFINITIONS


def get_metric(metric_id: str) -> dict:
    if metric_id not in KPI_DEFINITIONS:
        raise KeyError(f"Unknown metric: {metric_id}")
    return {"metric_id": metric_id, **KPI_DEFINITIONS[metric_id]}


def list_metrics() -> list[dict]:
    return [{"metric_id": k, **v} for k, v in KPI_DEFINITIONS.items()]
```

- [ ] **Step 3: Rewrite `app/metrics/query_engine.py`**:

```python
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text

from app.db.connections import connections
from app.metrics.registry import get_metric

_SAFE_GROUP_BY = {"period", "team_leader", "client", "department", "contract",
                  "technician", "status", "project", "engineer", "vehicle", "room",
                  "leave_type"}

_ALLOWED_FILTERS = {"dateFrom", "dateTo", "department", "client", "contract",
                    "team_leader", "technician", "engineer", "project", "status"}


def _safe_group_by(cols: list[str], allowed: list[str]) -> list[str]:
    return [c for c in cols if c in _SAFE_GROUP_BY and c in allowed]


def run_metric_query(metric_id: str, dimensions: list[str],
                     filters: dict[str, Any], limit: int = 100,
                     include_comparison: bool = False) -> dict:
    m = get_metric(metric_id)
    group_cols = _safe_group_by(dimensions or m["group_by"], m["group_by"]) or m["group_by"]
    where = []
    params: dict[str, Any] = {}
    if filters.get("dateFrom"):
        where.append("period >= :date_from")
        params["date_from"] = filters["dateFrom"]
    if filters.get("dateTo"):
        where.append("period <= :date_to")
        params["date_to"] = filters["dateTo"]
    for f in _ALLOWED_FILTERS - {"dateFrom", "dateTo"}:
        if filters.get(f) is not None:
            where.append(f"{f} = :{f}")
            params[f] = filters[f]
    where_sql = (" WHERE " + " AND ".join(where)) if where else ""

    select_cols = ", ".join(group_cols + ["value"]) if group_cols else "value"
    sql = f'SELECT {select_cols} FROM {m["schema"]}.{m["view"]}{where_sql} ' \
          f'ORDER BY value DESC NULLS LAST LIMIT :lim'
    params["lim"] = int(limit)
    connections.require_initialized()
    with connections.pg_engine.connect() as conn:
        rows = [dict(r._mapping) for r in conn.execute(text(sql), params)]
    return {
        "metric": metric_id,
        "dimensions": group_cols,
        "filters": filters,
        "data": rows,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
```

- [ ] **Step 4: Commit**

```bash
git add app/metrics/definitions.py app/metrics/registry.py app/metrics/query_engine.py
git commit -m "metrics: SQL-backed registry against mart views"
```

---

### Task 24: DDL — mart views

**Files:**
- Create: `app/db/ddl/003_views_marts.sql`

- [ ] **Step 1: Create `app/db/ddl/003_views_marts.sql`** — KPI views per mart. Every view exposes a `period` column (YYYY-MM string from `dim_date`), the optional `group_by` columns, and a `value` column. Example coverage:

```sql
-- =========================
-- mart_opm
-- =========================
CREATE OR REPLACE VIEW mart_opm.v_sla_compliance AS
SELECT
  TO_CHAR(d.full_date, 'YYYY-MM')        AS period,
  c.contract_number                       AS contract,
  AVG(CASE WHEN s.is_sla_breach THEN 0 ELSE 1 END)::NUMERIC(5,4) AS value
FROM core.fact_opm_ticket f
JOIN core.dim_date     d ON d.date_sk = f.created_date_sk
LEFT JOIN core.dim_contract c ON c.contract_sk = f.contract_sk
LEFT JOIN core.dim_status   s ON s.status_sk = f.status_sk
GROUP BY 1, 2;

CREATE OR REPLACE VIEW mart_opm.v_mttr AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       c.contract_number AS contract,
       AVG(f.time_to_resolve_min)::NUMERIC(10,2) AS value
FROM core.fact_opm_ticket f
JOIN core.dim_date d ON d.date_sk = f.created_date_sk
LEFT JOIN core.dim_contract c ON c.contract_sk = f.contract_sk
WHERE f.time_to_resolve_min IS NOT NULL
GROUP BY 1,2;

CREATE OR REPLACE VIEW mart_opm.v_mtta AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       c.contract_number AS contract,
       AVG(f.time_to_assign_min)::NUMERIC(10,2) AS value
FROM core.fact_opm_ticket f
JOIN core.dim_date d ON d.date_sk = f.created_date_sk
LEFT JOIN core.dim_contract c ON c.contract_sk = f.contract_sk
WHERE f.time_to_assign_min IS NOT NULL
GROUP BY 1,2;

CREATE OR REPLACE VIEW mart_opm.v_first_call_resolution AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       AVG(CASE WHEN f.reopen_count = 0 THEN 1 ELSE 0 END)::NUMERIC(5,4) AS value
FROM core.fact_opm_ticket f
JOIN core.dim_date d ON d.date_sk = f.created_date_sk
GROUP BY 1;

CREATE OR REPLACE VIEW mart_opm.v_technician_load AS
SELECT p.full_name AS technician,
       NULL::TEXT AS period,
       COUNT(*)::NUMERIC AS value
FROM core.fact_opm_ticket f
JOIN core.dim_person p ON p.person_sk = f.assigned_technician_person_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
WHERE f.closed_date_sk IS NULL
GROUP BY 1;

CREATE OR REPLACE VIEW mart_opm.v_contract_health AS
SELECT c.contract_number AS contract,
       NULL::TEXT AS period,
       COUNT(*) FILTER (WHERE s.is_sla_breach)::NUMERIC AS value
FROM core.fact_opm_ticket f
LEFT JOIN core.dim_contract c ON c.contract_sk = f.contract_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
GROUP BY 1;

-- =========================
-- mart_pma
-- =========================
CREATE OR REPLACE VIEW mart_pma.v_portfolio_status AS
SELECT s.task_status AS status,
       NULL::TEXT AS period,
       COUNT(*) * AVG(pr.weight)::NUMERIC AS value
FROM core.fact_pma_task f
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
LEFT JOIN core.dim_priority pr ON pr.priority_sk = f.priority_sk
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pma.v_on_time_delivery AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       AVG(CASE WHEN s.is_overdue THEN 0 ELSE 1 END)::NUMERIC(5,4) AS value
FROM core.fact_pma_task f
JOIN core.dim_date d ON d.date_sk = f.closed_date_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
WHERE f.closed_date_sk IS NOT NULL
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pma.v_team_leader_score AS
SELECT p.full_name AS team_leader,
       NULL::TEXT AS period,
       AVG(f.note)::NUMERIC(5,2) AS value
FROM core.fact_pma_task f
JOIN core.dim_person p ON p.person_sk = f.team_leader_person_sk
WHERE f.note IS NOT NULL
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pma.v_engineer_productivity AS
SELECT p.full_name AS engineer,
       NULL::TEXT AS period,
       SUM(COALESCE(f.note,0) * COALESCE(f.rating_weight,1))::NUMERIC AS value
FROM core.fact_pma_task f
JOIN core.dim_person p ON p.person_sk = f.executor_person_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
WHERE f.closed_date_sk IS NOT NULL
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pma.v_overdue_index AS
SELECT pj.name AS project,
       NULL::TEXT AS period,
       AVG(CASE WHEN s.is_overdue THEN 1 ELSE 0 END)::NUMERIC(5,4) AS value
FROM core.fact_pma_task f
JOIN core.dim_project pj ON pj.project_sk = f.project_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
GROUP BY 1;

-- =========================
-- mart_pte
-- =========================
CREATE OR REPLACE VIEW mart_pte.v_leave_consumption AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       dep.name AS department,
       lt.code  AS leave_type,
       SUM(f.business_days)::NUMERIC AS value
FROM core.fact_pte_event f
JOIN core.dim_date d ON d.date_sk = f.event_date_sk
LEFT JOIN core.dim_department dep ON dep.department_sk = f.department_sk
LEFT JOIN core.dim_leave_type lt  ON lt.leave_type_sk = f.leave_type_sk
WHERE f.event_type = 'leave'
GROUP BY 1,2,3;

CREATE OR REPLACE VIEW mart_pte.v_headcount_active AS
SELECT dep.name AS department,
       NULL::TEXT AS period,
       COUNT(*)::NUMERIC AS value
FROM core.dim_person p
LEFT JOIN core.dim_department dep ON dep.name = p.department
WHERE p.is_active
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pte.v_vehicle_utilization AS
SELECT v.registration AS vehicle,
       NULL::TEXT AS period,
       (SUM(f.duration_min)::NUMERIC / 60.0) AS value
FROM core.fact_pte_event f
JOIN core.dim_vehicle v ON v.vehicle_sk = f.vehicle_sk
WHERE f.event_type = 'vehicle_usage'
GROUP BY 1;

CREATE OR REPLACE VIEW mart_pte.v_room_occupancy AS
SELECT r.label AS room,
       NULL::TEXT AS period,
       (SUM(f.duration_min)::NUMERIC / NULLIF(r.capacity,0)) AS value
FROM core.fact_pte_event f
JOIN core.dim_room r ON r.room_sk = f.room_sk
WHERE f.event_type = 'room_reservation'
GROUP BY r.label, r.capacity;

CREATE OR REPLACE VIEW mart_pte.v_vm_lead_time AS
SELECT NULL::TEXT AS period,
       AVG(f.duration_min)::NUMERIC(10,2) AS value
FROM core.fact_pte_event f
WHERE f.event_type = 'vm_request' AND f.duration_min IS NOT NULL;

CREATE OR REPLACE VIEW mart_pte.v_intervention_throughput AS
SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period,
       p.full_name AS engineer,
       COUNT(*)::NUMERIC AS value
FROM core.fact_pte_event f
JOIN core.dim_date d ON d.date_sk = f.event_date_sk
JOIN core.dim_person p ON p.person_sk = f.engineer_person_sk
WHERE f.event_type = 'intervention'
GROUP BY 1,2;

-- =========================
-- mart_exec
-- =========================
CREATE OR REPLACE VIEW mart_exec.v_company_throughput AS
SELECT period, SUM(value) AS value
FROM (
  SELECT TO_CHAR(d.full_date,'YYYY-MM') AS period, COUNT(*)::NUMERIC AS value
  FROM core.fact_opm_ticket f
  JOIN core.dim_date d ON d.date_sk = f.resolved_date_sk
  WHERE f.resolved_date_sk IS NOT NULL
  GROUP BY 1
  UNION ALL
  SELECT TO_CHAR(d.full_date,'YYYY-MM'), COUNT(*)
  FROM core.fact_pma_task f
  JOIN core.dim_date d ON d.date_sk = f.closed_date_sk
  WHERE f.closed_date_sk IS NOT NULL
  GROUP BY 1
) u
GROUP BY period;

CREATE OR REPLACE VIEW mart_exec.v_pm_scorecard AS
SELECT tl.full_name AS team_leader,
       NULL::TEXT AS period,
       AVG(t.note)::NUMERIC(5,2)
         + AVG(CASE WHEN ts.is_overdue THEN -1 ELSE 0 END)
         + AVG(COALESCE(tt.time_to_resolve_min,0) / 60.0) * -0.01
         AS value
FROM core.fact_pma_task t
JOIN core.dim_person tl ON tl.person_sk = t.team_leader_person_sk
LEFT JOIN core.dim_status ts ON ts.status_sk = t.status_sk
LEFT JOIN core.fact_opm_ticket tt ON tt.assigned_technician_person_sk = t.executor_person_sk
GROUP BY 1;

CREATE OR REPLACE VIEW mart_exec.v_revenue_at_risk AS
SELECT NULL::TEXT AS period,
       COUNT(*)::NUMERIC AS value
FROM core.dim_contract c
WHERE c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND EXISTS (
    SELECT 1 FROM core.fact_opm_ticket f
    JOIN core.dim_status s ON s.status_sk = f.status_sk
    WHERE f.contract_sk = c.contract_sk AND s.is_sla_breach
  );

CREATE OR REPLACE VIEW mart_exec.v_client_health AS
SELECT cl.name AS client,
       NULL::TEXT AS period,
       AVG(CASE WHEN s.is_sla_breach THEN 0 ELSE 1 END)::NUMERIC(5,4) AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract c ON c.contract_sk = f.contract_sk
JOIN core.dim_client cl ON cl.client_sk = c.client_sk
LEFT JOIN core.dim_status s ON s.status_sk = f.status_sk
GROUP BY 1;

CREATE OR REPLACE VIEW mart_exec.v_workforce_availability AS
SELECT dep.name AS department,
       TO_CHAR(d.full_date,'YYYY-MM') AS period,
       SUM(f.business_days)::NUMERIC AS value
FROM core.fact_pte_event f
JOIN core.dim_date d ON d.date_sk = f.event_date_sk
LEFT JOIN core.dim_department dep ON dep.department_sk = f.department_sk
WHERE f.event_type = 'leave'
GROUP BY 1,2;
```

- [ ] **Step 2: Apply + verify**

```bash
python -c "from app.db.pg_apply import apply_sql_dir; print(apply_sql_dir('app/db/ddl'))"
docker exec -i $(docker ps -qf name=postgres) psql -U postgres -d reporting -c "\dv mart_exec.*"
```

Expected: 5 views in `mart_exec`, similar for other marts.

- [ ] **Step 3: Commit**

```bash
git add app/db/ddl/003_views_marts.sql
git commit -m "ddl: mart KPI views (exec/opm/pma/pte)"
```

---

### Task 25: Per-app routes — back by PG (same surface)

**Files:**
- Modify: `app/api/routes/opm.py`, `app/api/routes/pma.py`, `app/api/routes/pte.py`, `app/api/routes/metrics.py`

These routes currently hit Mongo `fact_*` collections. After Task 23, `run_metric_query` already targets PG mart views — most routes just call into it. Audit each route: if it directly used `connections.warehouse_db`, replace with a PG query through SQLAlchemy or a registered metric.

- [ ] **Step 1: For each route**, replace direct Mongo aggregation pipelines with calls to `run_metric_query(<new metric id>, ...)`. The metric ID mapping (old → new) is provided by the new KPI registry in Task 23.

  Example: `/opm/tickets/by-status` becomes:

```python
from app.metrics.query_engine import run_metric_query

@router.get("/tickets/by-status")
def by_status(...):
    return run_metric_query("opm.contract_health", [], {...})
```

- [ ] **Step 2: Add Depends(get_current_user)** to every route — the Node backend's `protect` middleware moves here:

```python
from fastapi import Depends
from app.core.security import get_current_user
router = APIRouter(prefix="/opm", tags=["opm"], dependencies=[Depends(get_current_user)])
```

- [ ] **Step 3: Commit**

```bash
git add app/api/routes/opm.py app/api/routes/pma.py app/api/routes/pte.py app/api/routes/metrics.py
git commit -m "api: protect /opm, /pma, /pte; back by PG via metric engine"
```

---

### Task 26: Main wiring + Node decommission

**Files:**
- Modify: `app/main.py`
- Delete (last step, only after verification): `D:\Git\PFE\Reporting\reporting-backend\`

- [ ] **Step 1: Mount new routers in `app/main.py`**:

```python
from app.api.routes import auth as auth_routes
from app.api.routes import users as users_routes
from app.api.routes import reports as reports_routes

app.include_router(auth_routes.router)
app.include_router(users_routes.router)
app.include_router(reports_routes.router)
```

Ensure `start_scheduler()` is invoked in startup event.

- [ ] **Step 2: Smoke test full stack**

```bash
uvicorn app.main:app --reload
# In a second shell:
curl -s -X POST localhost:8000/auth/register -H 'Content-Type: application/json' \
  -d '{"fullName":"Admin","email":"a@a.com","password":"x","role":"admin"}'
curl -s -X POST localhost:8000/auth/login -d 'username=a@a.com&password=x' | tee /tmp/login.json
TOKEN=$(jq -r .access_token /tmp/login.json)
curl -s localhost:8000/auth/me -H "Authorization: Bearer $TOKEN"
```

Expected: register returns user; login returns JWT; `/auth/me` returns claims.

- [ ] **Step 3: Parity check vs Node** — run each Node endpoint and the FastAPI equivalent against the same dataset; compare KPI numbers and report exports. If any divergence, file as a follow-up and fix before deletion.

- [ ] **Step 4: Stop Node backend, confirm frontend works**

  - Stop `Reporting/reporting-backend/`
  - Point any frontend `.env` `API_URL` to FastAPI (`http://localhost:8000`)
  - Walk through: login, list/create report, run, export PDF.

- [ ] **Step 5: Delete Node directory**

```bash
rm -rf D:/Git/PFE/Reporting/reporting-backend
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "decommission: remove Node reporting-backend; FastAPI is sole backend"
```

---

## Verification (run after Task 26)

1. **DDL** — `python -c "from app.db.pg_apply import apply_sql_dir; apply_sql_dir('app/db/ddl'); apply_sql_dir('seeds')"` succeeds twice (idempotent).
2. **Backfill** — `python -c "from app.etl.pipeline import run_full_etl; print(run_full_etl())"` returns counts > 0 for bronze, silver, dims, facts.
3. **MDM** — `SELECT email_norm, COUNT(*) FROM core.dim_person GROUP BY 1 HAVING COUNT(*)>1` → 0 rows.
4. **Grain** — per fact, `SELECT source_id, COUNT(*) FROM core.fact_X GROUP BY 1 HAVING COUNT(*)>1` → 0 rows.
5. **Mart views** — `SELECT * FROM mart_exec.v_pm_scorecard LIMIT 5` returns rows joining tickets + tasks via `dim_person`.
6. **Replay** — `python -c "from app.etl.pipeline import run_backfill_etl; print(run_backfill_etl())"` produces identical fact counts (idempotent upserts).
7. **Auth** — register, login, `/auth/me` flow returns JWT claims; admin-only endpoints 403 for viewer.
8. **Reports** — create report config, `POST /reports/{id}/run` returns KPI bundle; `GET /reports/{id}/export?format=pdf` downloads a valid PDF; scheduled cron creates `report_runs` doc + saved file + email.
9. **Node parity** — every endpoint in Node `reporting-backend/` has a working FastAPI counterpart.
10. **Decommission** — Node directory deleted; frontend works against FastAPI only.
