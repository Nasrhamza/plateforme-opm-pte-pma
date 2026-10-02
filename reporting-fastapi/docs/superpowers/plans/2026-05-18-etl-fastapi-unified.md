# Unified Reporting Backend & Dimensional ETL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Node.js `Reporting/reporting-backend` and the non-conformant Mongo-only ETL in `reporting-fastapi` with a single FastAPI service that runs a medallion ETL (Mongo bronze/silver → PostgreSQL gold star) over OPM/PMA/PTE and serves auth, user admin, scheduled report generation (PDF/XLSX/email), and persona-aligned KPI dashboards.

**Architecture:**
- **Bronze + Silver** stay in MongoDB (raw API payloads + typed staging).
- **Gold** is a Kimball star in PostgreSQL: 17 conformed dimensions (incl. `dim_person` MDM, junk `dim_status`/`dim_priority`, `dim_time_of_day`, `dim_site`, `dim_equipment`, `dim_department`) + **one fact per source app** (`fact_opm_ticket`, `fact_pma_task`, `fact_pte_event`) + **4 data marts** (`mart_exec`, `mart_opm`, `mart_pma`, `mart_pte`) as SQL views.
- **One FastAPI service** owns auth (JWT/bcrypt), users, report CRUD, PDF/XLSX export, scheduled email delivery, and the KPI query engine. The Node backend is deleted at the end.

**Tech Stack:** Python 3.11+, FastAPI, PyMongo (Mongo bronze/silver), SQLAlchemy 2.0 + psycopg 3 (Postgres gold), APScheduler, python-jose, passlib[bcrypt], reportlab, openpyxl, fastapi-mail, pytest, httpx (REST extract). PostgreSQL 16 + MongoDB 7 via Docker Compose.

---

## File Structure

### Created
```
reporting-fastapi/
├── docker-compose.yml                              # postgres + mongo
├── app/
│   ├── core/security.py                            # REWRITE: real JWT + bcrypt + RBAC deps
│   ├── db/
│   │   ├── ddl/
│   │   │   ├── 001_schemas_dims.sql                # schemas + 17 dims
│   │   │   ├── 002_facts.sql                       # 3 facts
│   │   │   └── 003_views_marts.sql                 # 4 mart schemas + KPI views
│   │   └── pg_apply.py                             # idempotent DDL applier
│   ├── etl/
│   │   ├── transform_silver.py                     # mongo bronze → mongo stg_*
│   │   ├── transform_gold.py                       # mongo stg_* → pg core.*
│   │   └── mdm.py                                  # email-based identity resolution
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                                 # User Pydantic + repo
│   │   ├── report_config.py
│   │   └── report_run.py
│   ├── api/routes/
│   │   ├── auth.py
│   │   ├── users.py
│   │   └── reports.py
│   └── services/
│       ├── __init__.py
│       ├── report_runner.py                        # runs KPIs for a config
│       ├── report_export.py                        # PDF (reportlab) + XLSX (openpyxl)
│       └── mailer.py                               # fastapi-mail wrapper
├── seeds/
│   ├── dim_date.sql                                # 2022-2030 day rows
│   ├── dim_time_of_day.sql                         # 24 hour rows
│   ├── dim_source_system.sql
│   ├── dim_role.sql
│   ├── dim_leave_type.sql
│   ├── dim_priority.sql
│   └── person_overrides.csv
└── tests/
    ├── unit/test_mdm.py
    ├── unit/test_transform_silver.py
    ├── unit/test_security.py
    ├── unit/test_report_export.py
    └── integration/test_etl_pipeline_pg.py
```

### Modified
```
requirements.txt                                    # add jwt, bcrypt, sqlalchemy, psycopg, reportlab, openpyxl, fastapi-mail
app/core/config.py                                  # PG_URL, JWT, MAIL_*, reports_storage_path
app/db/connections.py                               # add pg_engine() + pg_session()
app/db/warehouse_schema.py                          # bronze (raw_*) + silver (stg_*) indexes only
app/etl/extract.py                                  # also write to raw_* mongo + extract new entities
app/etl/load.py                                     # PG upserts via SQLAlchemy
app/etl/pipeline.py                                 # real run_backfill_etl (no REST hit)
app/etl/scheduler.py                                # add report-config jobs
app/metrics/definitions.py                          # registry of (kpi_id, schema, view, group_by)
app/metrics/query_engine.py                         # SQL execution against marts
app/metrics/registry.py                             # list + get adapted to new shape
app/api/routes/opm.py                               # same paths, back by PG
app/api/routes/pma.py
app/api/routes/pte.py
app/main.py                                         # mount auth, users, reports routers
```

### Deleted (at the very end after verification)
- `D:\Git\PFE\Reporting\reporting-backend\` (entire Node.js project)

---

## Conventions

- **Surrogate keys**: `BIGSERIAL` on every dim and fact in PG. Suffix `_sk`.
- **Business keys**: `source_id` (Mongo `_id` as string) on every dim + fact, unique-indexed.
- **Dates**: `date_sk = year*10000 + month*100 + day` (integer YYYYMMDD). `dim_date.date_sk` matches.
- **Hours**: `hour_sk = 0..23`.
- **Status junk dim**: nullable fields per fact-type; UNIQUE constraint across the column set.
- **MongoDB layers**:
  - Bronze: `raw_{source}_{entity}` (e.g. `raw_opm_tickets`). Doc shape: `{source_id, payload, ingested_at, etl_run_id, hash}`.
  - Silver: `stg_{source}_{entity}` (e.g. `stg_opm_tickets`). Doc shape: typed dict with `source_id` unique key.
- **PG schemas**: `core` (dims + facts), `mart_exec`, `mart_opm`, `mart_pma`, `mart_pte`.
- **Tests**: pytest. Mongo tests skip if no Mongo URI; PG tests skip if no PG_URL.

---
