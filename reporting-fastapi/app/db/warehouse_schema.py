from pymongo import ASCENDING, DESCENDING
from pymongo.database import Database


BRONZE_COLLECTIONS = [
    # OPM
    "raw_opm_tickets", "raw_opm_users", "raw_opm_contracts", "raw_opm_clients",
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
