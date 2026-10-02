from fastapi import APIRouter
from sqlalchemy import text

from app.db.connections import connections

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    mongo_ok = True
    postgres_ok = True
    try:
        connections.warehouse_db.command("ping")
    except Exception:
        mongo_ok = False
    try:
        with connections.pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        postgres_ok = False
    healthy = mongo_ok and postgres_ok
    return {
        "status": "ok" if healthy else "degraded",
        "mongodb": mongo_ok,
        "postgresql": postgres_ok,
    }
