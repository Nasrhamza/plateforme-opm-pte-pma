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
