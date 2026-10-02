from datetime import datetime, timezone
from uuid import uuid4

from app.db.connections import connections
from app.etl.checkpoints import save_checkpoint


def _upsert_many(collection_name: str, docs: list[dict]) -> int:
    if not docs:
        return 0
    coll = connections.warehouse_db[collection_name]
    count = 0
    for doc in docs:
        source_id = doc["source_id"]
        coll.update_one({"source_id": source_id}, {"$set": doc}, upsert=True)
        count += 1
    return count


def load_transformed(transformed: dict[str, list[dict]]) -> dict:
    run_id = str(uuid4())
    started_at = datetime.now(timezone.utc)
    stats = {}
    total = 0
    for collection_name, docs in transformed.items():
        inserted = _upsert_many(collection_name, docs)
        stats[collection_name] = inserted
        total += inserted

    for source, entities in {
        "opm": ["tickets"],
        "pte": ["leaves", "vehicles", "rooms", "virtualization_env", "users"],
        "pma": ["projects", "tasks", "reclamations", "projectratings"],
    }.items():
        for entity in entities:
            save_checkpoint(source, entity)

    connections.warehouse_db.etl_runs.insert_one(
        {
            "run_id": run_id,
            "status": "success",
            "started_at": started_at,
            "ended_at": datetime.now(timezone.utc),
            "stats": stats,
            "total_records": total,
        }
    )
    return {"runId": run_id, "status": "success", "stats": stats, "total": total}
