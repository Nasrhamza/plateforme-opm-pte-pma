from datetime import datetime, timezone

from app.db.connections import connections


def get_checkpoint(source_system: str, entity_name: str) -> datetime | None:
    doc = connections.warehouse_db.etl_checkpoints.find_one(
        {"source_system": source_system, "entity_name": entity_name}
    )
    return doc.get("last_updated_at") if doc else None


def save_checkpoint(source_system: str, entity_name: str, last_updated_at: datetime | None = None) -> None:
    ts = last_updated_at or datetime.now(timezone.utc)
    connections.warehouse_db.etl_checkpoints.update_one(
        {"source_system": source_system, "entity_name": entity_name},
        {"$set": {"last_updated_at": ts, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
