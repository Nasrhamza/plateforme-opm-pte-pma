from datetime import datetime, timezone
import hashlib
import json
import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.db.connections import connections
from app.etl.checkpoints import get_checkpoint
logger = logging.getLogger(__name__)


def _as_iso(value: datetime | None) -> str | None:
    if not value:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


def _extract_list(payload: Any) -> list[dict]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if not isinstance(payload, dict):
        return []

    # Common envelope keys used by heterogeneous source APIs.
    for key in ("items", "data", "results", "rows", "docs", "payload"):
        value = payload.get(key)
        if isinstance(value, list):
            return [x for x in value if isinstance(x, dict)]
        if isinstance(value, dict):
            nested = _extract_list(value)
            if nested:
                return nested

    # PMA/PTE-style wrapped objects: first list-valued field is typically the dataset.
    for value in payload.values():
        if isinstance(value, list):
            return [x for x in value if isinstance(x, dict)]
        if isinstance(value, dict):
            nested = _extract_list(value)
            if nested:
                return nested
    return []


def _headers(token: str | None) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"} if token else {}


def _fetch_list(
    client: httpx.Client, path: str, token: str | None = None, params: dict | None = None
) -> tuple[int, list[dict]]:
    res = client.get(path, headers=_headers(token), params=params or {})
    if res.status_code >= 400:
        return res.status_code, []
    return res.status_code, _extract_list(res.json())


def _fetch_first_success(
    client: httpx.Client,
    paths: list[str],
    source: str,
    token: str | None = None,
    params: dict | None = None,
) -> list[dict]:
    last_status = None
    first_success_data: list[dict] | None = None
    for path in paths:
        try:
            status, data = _fetch_list(client, path, token=token, params=params)
            last_status = status
            if status in {401, 403}:
                logger.warning(
                    "%s auth failed on %s (status=%s). Stopping fallback; provide valid API token/credentials.",
                    source,
                    path,
                    status,
                )
                return []
            if status < 400 and data:
                return data
            if status < 400 and first_success_data is None:
                first_success_data = data
            # Incremental filters can be unsupported or too restrictive on legacy APIs.
            if status < 400 and not data and params:
                retry_status, retry_data = _fetch_list(client, path, token=token, params={})
                if retry_status < 400 and retry_data:
                    return retry_data
                if retry_status < 400 and first_success_data is None:
                    first_success_data = retry_data
        except Exception as exc:
            logger.warning("%s extract path %s failed: %s", source, path, exc)
    if first_success_data is not None:
        return first_success_data
    logger.warning("%s extract failed for paths=%s last_status=%s", source, paths, last_status)
    return []


def _login_opm(base_url: str, email: str | None, password: str | None, timeout: int) -> str | None:
    if not email or not password:
        return None
    try:
        with httpx.Client(base_url=base_url, timeout=timeout) as client:
            res = client.post("/auth/login", json={"email": email, "password": password})
            if res.status_code >= 400:
                return None
            payload = res.json() if isinstance(res.json(), dict) else {}
            return payload.get("accessToken")
    except Exception:
        return None


def _login_pte(base_url: str, email: str | None, password: str | None, timeout: int) -> str | None:
    if not email or not password:
        return None
    try:
        with httpx.Client(base_url=base_url, timeout=timeout) as client:
            res = client.post("/login", json={"email": email, "password": password})
            if res.status_code >= 400:
                return None
            payload = res.json() if isinstance(res.json(), dict) else {}
            if isinstance(payload.get("data"), dict) and payload["data"].get("token"):
                return payload["data"]["token"]
            return payload.get("token")
    except Exception:
        return None


def _login_pma(base_url: str, email: str | None, password: str | None, timeout: int) -> str | None:
    if not email or not password:
        return None
    try:
        with httpx.Client(base_url=base_url, timeout=timeout) as client:
            res = client.post("/auth/login", json={"email": email, "password": password})
            if res.status_code >= 400:
                return None
            payload = res.json() if isinstance(res.json(), dict) else {}
            if isinstance(payload.get("data"), dict) and payload["data"].get("token"):
                return payload["data"]["token"]
            return payload.get("token")
    except Exception:
        return None


def _opm_params_for_incremental() -> dict[str, str]:
    checkpoint = get_checkpoint("opm", "tickets")
    if not checkpoint:
        return {}
    return {"dateFrom": _as_iso(checkpoint) or ""}


def _pte_params_for_incremental(collection_name: str) -> dict[str, str]:
    checkpoint = get_checkpoint("pte", collection_name)
    if not checkpoint:
        return {}
    return {"dateFrom": _as_iso(checkpoint) or ""}


def _pma_params_for_incremental(collection_name: str) -> dict[str, str]:
    checkpoint = get_checkpoint("pma", collection_name)
    if not checkpoint:
        return {}
    return {"dateFrom": _as_iso(checkpoint) or ""}


def _fetch_per_item_events(
    client: httpx.Client,
    items: list[dict],
    id_field: str,
    path_tpl: str,
    source: str,
    token: str | None,
) -> list[dict]:
    """Fetch events for each item individually (no global list endpoint)."""
    all_events: list[dict] = []
    for item in items:
        item_id = str(item.get(id_field) or item.get("_id") or "")
        if not item_id:
            continue
        path = path_tpl.format(id=item_id)
        try:
            status, events = _fetch_list(client, path, token=token)
            if status < 400:
                all_events.extend(events)
        except Exception as exc:
            logger.warning("%s per-item fetch %s failed: %s", source, path, exc)
    return all_events


def _opm_mongo_collection(collection: str) -> list[dict]:
    """Read directly from OPM MongoDB for entities with no bulk REST endpoint."""
    try:
        opm_db = connections.warehouse_client["opm"]
        return [doc for doc in opm_db[collection].find({})]
    except Exception as exc:
        logger.warning("OPM mongo fallback for %s failed: %s", collection, exc)
        return []


def _pte_mongo_collection(collection: str) -> list[dict]:
    """Read directly from PTE MongoDB — used when REST endpoint is paginated or incomplete."""
    try:
        pte_db = connections.warehouse_client["pte"]
        return [doc for doc in pte_db[collection].find({})]
    except Exception as exc:
        logger.warning("PTE mongo fallback for %s failed: %s", collection, exc)
        return []


def _pma_mongo_collection(collection: str) -> list[dict]:
    """Read directly from PMA MongoDB — used when REST endpoint is paginated or incomplete."""
    try:
        pma_db = connections.warehouse_client["pma"]
        return [doc for doc in pma_db[collection].find({})]
    except Exception as exc:
        logger.warning("PMA mongo fallback for %s failed: %s", collection, exc)
        return []


def _enrich_tickets_with_equipment(tickets: list[dict]) -> list[dict]:
    """OPM REST API omits equipmentHardId — backfill from MongoDB by _id."""
    try:
        opm_db = connections.warehouse_client["opm"]
        equip_map = {
            str(doc["_id"]): str(doc["equipmentHardId"])
            for doc in opm_db["tickets"].find(
                {"equipmentHardId": {"$ne": None}}, {"_id": 1, "equipmentHardId": 1}
            )
            if doc.get("equipmentHardId")
        }
        for t in tickets:
            tid = str(t.get("_id") or "")
            if tid and not t.get("equipmentHardId"):
                t["equipmentHardId"] = equip_map.get(tid)
    except Exception as exc:
        logger.warning("OPM ticket equipment enrichment failed: %s", exc)
    return tickets


def extract_opm(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    tickets = _fetch_first_success(client, ["/ticket/getAllTickets", "/ticket/getAllTicketsHelpdesk"],
                                   source="opm.tickets", token=token,
                                   params=_opm_params_for_incremental())
    _enrich_tickets_with_equipment(tickets)
    return {
        "tickets": tickets,
        "users": _fetch_first_success(client, ["/tech/getAllEmployees", "/admin/getAllAdmins", "/user/getAll"],
                                       source="opm.users", token=token, params={}),
        "contracts": _fetch_first_success(client, ["/contract/getAllContracts", "/contract"],
                                           source="opm.contracts", token=token, params={}),
        "clients": _fetch_first_success(client, ["/client/getListClient", "/client/getAll"],
                                         source="opm.clients", token=token, params={}),
        # No bulk REST endpoints for sites/equipment — read directly from OPM MongoDB
        "sites":          _opm_mongo_collection("sites"),
        "equipment":      _opm_mongo_collection("equipments"),
        "equipment_soft": _opm_mongo_collection("equipmentsofts"),
    }


def extract_pte(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    vehicles = _fetch_first_success(client, ["/material/vehicle/getVehicles"],
                                    source="pte.vehicles", token=token, params={})
    rooms = _fetch_first_success(client, ["/material/room/getRooms"],
                                  source="pte.rooms", token=token, params={})
    vehicle_events = _fetch_per_item_events(
        client, vehicles, "_id", "/material/vehicle/getVehicleEvents/{id}",
        source="pte.vehicle_events", token=token,
    )
    room_events = _fetch_per_item_events(
        client, rooms, "_id", "/material/room/getRoomEvents/{id}",
        source="pte.room_events", token=token,
    )
    # Leaves: REST endpoint is paginated and returns a subset; read full set from MongoDB.
    leaves_mongo = _pte_mongo_collection("leaves")
    leaves_rest  = _fetch_first_success(client, ["/leave/getAllLeave"],
                                        source="pte.leaves", token=token,
                                        params=_pte_params_for_incremental("leaves"))
    # Merge: mongo is authoritative; REST may have newer docs not yet flushed.
    leaves_by_id: dict[str, dict] = {str(d.get("_id") or ""): d for d in leaves_mongo if d.get("_id")}
    for d in leaves_rest:
        lid = str(d.get("_id") or "")
        if lid and lid not in leaves_by_id:
            leaves_by_id[lid] = d
    leaves = list(leaves_by_id.values())

    return {
        "leaves": leaves,
        "vehicles": vehicles,
        "rooms": rooms,
        "virtualization": _fetch_first_success(client,
            ["/material/virtualization/allActiveLabs", "/material/virtualization/getAll"],
            source="pte.virtualization", token=token, params={}),
        "users": _fetch_first_success(client, ["/users/getall", "/users"],
                                       source="pte.users", token=token, params={}),
        "vehicle_events": vehicle_events,
        "room_events": room_events,
        "user_events": _fetch_first_success(client,
            ["/users/allUserEvents", "/technical-team/getAllUserEvents"],
            source="pte.user_events", token=token, params={}),
    }


def extract_pma(client: httpx.Client, token: str | None) -> dict[str, list[dict]]:
    # Reclamations: REST may be incomplete; merge with MongoDB authoritative source.
    rec_mongo = _pma_mongo_collection("reclamations")
    rec_rest  = _fetch_first_success(client, ["/reclamations"], source="pma.reclamations", token=token,
                                     params=_pma_params_for_incremental("reclamations"))
    rec_by_id: dict[str, dict] = {str(d.get("_id") or ""): d for d in rec_mongo if d.get("_id")}
    for d in rec_rest:
        rid = str(d.get("_id") or "")
        if rid and rid not in rec_by_id:
            rec_by_id[rid] = d
    return {
        "projects": _fetch_first_success(client, ["/projects"], source="pma.projects", token=token,
                                          params=_pma_params_for_incremental("projects")),
        "tasks": _fetch_first_success(client, ["/tasks"], source="pma.tasks", token=token,
                                       params=_pma_params_for_incremental("tasks")),
        "reclamations": list(rec_by_id.values()),
        "users": _fetch_first_success(client, ["/users", "/user"], source="pma.users", token=token, params={}),
    }


def extract_all() -> dict[str, dict[str, list[dict]]]:
    settings = get_settings()
    opm_token = settings.opm_api_token or _login_opm(
        settings.opm_api_base_url, settings.opm_api_email, settings.opm_api_password, settings.api_timeout_seconds
    )
    pte_token = settings.pte_api_token or _login_pte(
        settings.pte_api_base_url, settings.pte_api_email, settings.pte_api_password, settings.api_timeout_seconds
    )
    pma_token = settings.pma_api_token or _login_pma(
        settings.pma_api_base_url, settings.pma_api_email, settings.pma_api_password, settings.api_timeout_seconds
    )
    with httpx.Client(base_url=settings.opm_api_base_url, timeout=settings.api_timeout_seconds) as opm_client:
        opm = extract_opm(opm_client, opm_token)
    with httpx.Client(base_url=settings.pte_api_base_url, timeout=settings.api_timeout_seconds) as pte_client:
        pte = extract_pte(pte_client, pte_token)
    with httpx.Client(base_url=settings.pma_api_base_url, timeout=settings.api_timeout_seconds) as pma_client:
        pma = extract_pma(pma_client, pma_token)
    return {
        "opm": opm,
        "pte": pte,
        "pma": pma,
        "extracted_at": {"value": datetime.utcnow()},
    }


def save_bronze(extracted: dict, etl_run_id: str) -> dict[str, int]:
    """Write every extracted record into raw_{source}_{entity} Mongo collections.

    Doc shape: {source_id, payload, ingested_at, etl_run_id, hash}.
    Idempotent per (source_id, etl_run_id) via the unique index.
    """
    connections.require_initialized()
    db = connections.warehouse_db
    counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)
    for source in ("opm", "pma", "pte"):
        for entity, rows in extracted.get(source, {}).items():
            coll_name = f"raw_{source}_{entity}"
            collection = db[coll_name]
            inserted = 0
            for row in rows:
                if not isinstance(row, dict):
                    continue
                source_id = str(row.get("_id") or row.get("id") or "")
                if not source_id:
                    continue
                payload_str = json.dumps(row, default=str, sort_keys=True)
                doc = {
                    "source_id": source_id,
                    "payload": row,
                    "ingested_at": now,
                    "etl_run_id": etl_run_id,
                    "hash": hashlib.sha256(payload_str.encode()).hexdigest(),
                }
                collection.update_one(
                    {"source_id": source_id, "etl_run_id": etl_run_id},
                    {"$set": doc},
                    upsert=True,
                )
                inserted += 1
            counts[coll_name] = inserted
    return counts
