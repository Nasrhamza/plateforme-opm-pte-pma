from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import csv, io

from app.core.security import require_admin
from app.db.connections import connections
from app.models.user import UserIn, UserOut, create_user

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_admin)])


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.users


@router.post("", response_model=UserOut)
def add_user(payload: UserIn):
    return create_user(payload)


@router.get("")
def list_users():
    rows = list(_coll().find({}, {"password_hash": 0}))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.get("/export")
def export_csv():
    rows = list(_coll().find({}, {"password_hash": 0}))
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "fullName", "email", "role", "isEnabled", "createdAt"])
    for r in rows:
        w.writerow([str(r["_id"]), r.get("fullName"), r.get("email"),
                    r.get("role"), r.get("isEnabled"), r.get("createdAt")])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"})


@router.put("/{user_id}")
def update_user(user_id: str, payload: dict):
    payload.pop("password_hash", None)
    res = _coll().update_one({"_id": ObjectId(user_id)}, {"$set": payload})
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.delete("/{user_id}")
def delete_user(user_id: str):
    res = _coll().delete_one({"_id": ObjectId(user_id)})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}
