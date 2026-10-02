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
        "source_user_id": str(raw.get("source_id") or raw.get("_id") or raw.get("id") or ""),
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
        current = out.get(k)
        if current in (None, "", False):
            out[k] = v
        elif isinstance(current, str) and isinstance(v, str) and len(v.strip()) > len(current.strip()):
            # Prefer the richer identity value when two source systems disagree.
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
