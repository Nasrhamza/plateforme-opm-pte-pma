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
