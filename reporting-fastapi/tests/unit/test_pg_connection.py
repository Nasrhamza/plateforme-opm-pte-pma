import os
import pytest

from app.db.connections import connections


@pytest.mark.skipif(not os.getenv("PG_URL"), reason="PG_URL not set")
def test_pg_engine_connects():
    connections.initialize()
    with connections.pg_engine.connect() as conn:
        assert conn is not None
