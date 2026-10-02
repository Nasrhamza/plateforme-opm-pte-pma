from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes import auth, etl, exec, health, meta, metrics, opm, pma, pte, reports, users
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.connections import connections
from app.db.warehouse_schema import ensure_warehouse_schema
from app.etl.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    setup_logging(settings.log_level)
    try:
        connections.initialize()
        ensure_warehouse_schema(connections.warehouse_db)
        start_scheduler()
    except Exception:
        logging.getLogger(__name__).warning("Startup degraded: warehouse DB/scheduler unavailable", exc_info=True)
    yield
    try:
        stop_scheduler()
        connections.close()
    except Exception:
        logging.getLogger(__name__).warning("Shutdown completed with non-fatal errors", exc_info=True)


settings = get_settings()
app = FastAPI(title="Reporting Aggregation API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(health.router)
app.include_router(exec.router)
app.include_router(opm.router)
app.include_router(pte.router)
app.include_router(pma.router)
app.include_router(metrics.router)
app.include_router(etl.router)
app.include_router(meta.router)
app.include_router(reports.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
