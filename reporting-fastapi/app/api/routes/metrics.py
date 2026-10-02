from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.metrics.query_engine import run_metric_query
from app.metrics.registry import list_metrics
from app.schemas.metrics import MetricQueryRequest

router = APIRouter(prefix="/metrics", tags=["metrics"], dependencies=[Depends(get_current_user)])


@router.get("")
def get_metrics_catalog():
    return {"items": list_metrics()}


@router.post("/query")
def query_metrics(payload: MetricQueryRequest):
    try:
        return run_metric_query(
            metric_id=payload.metric_id,
            dimensions=payload.dimensions,
            filters=payload.filters,
            limit=payload.limit,
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
