from fastapi import APIRouter
from sqlalchemy import text

from app.db.connections import connections

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/options")
def metadata_options():
    connections.require_initialized()
    with connections.pg_engine.connect() as conn:
        departments = [
            r[0] for r in conn.execute(text(
                "SELECT DISTINCT department FROM core.dim_person "
                "WHERE department IS NOT NULL ORDER BY 1"
            ))
        ]
        clients = [
            r[0] for r in conn.execute(text(
                "SELECT DISTINCT client_name FROM core.dim_contract "
                "WHERE client_name IS NOT NULL ORDER BY 1"
            ))
        ]
        contracts = [
            r[0] for r in conn.execute(text(
                "SELECT DISTINCT contract_number FROM core.dim_contract "
                "WHERE contract_number IS NOT NULL ORDER BY 1"
            ))
        ]
    return {
        "departments": departments,
        "clients": clients,
        "contracts": contracts,
        "periods": ["daily", "weekly", "monthly", "custom"],
    }
