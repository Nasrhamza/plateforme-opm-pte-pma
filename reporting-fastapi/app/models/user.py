from datetime import datetime, timezone
from typing import Annotated, Literal
from pydantic import BaseModel, BeforeValidator, Field

from app.db.connections import connections
from app.core.security import hash_password


Role = Literal["admin", "viewer"]


def _validate_email(v: object) -> str:
    """Accept any syntactically valid email including internal .local domains."""
    s = str(v).strip().lower()
    parts = s.split("@")
    if len(parts) != 2 or not parts[0] or "." not in parts[1]:
        raise ValueError("Invalid email address")
    return s


EmailField = Annotated[str, BeforeValidator(_validate_email)]


class UserIn(BaseModel):
    fullName: str
    email: EmailField
    password: str
    role: Role = "viewer"
    isEnabled: bool = True


class UserOut(BaseModel):
    id: str
    fullName: str
    email: EmailField
    role: Role
    isEnabled: bool
    createdAt: datetime


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.users


def create_user(payload: UserIn) -> UserOut:
    doc = payload.model_dump()
    doc["password_hash"] = hash_password(doc.pop("password"))
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["updatedAt"] = doc["createdAt"]
    res = _coll().insert_one(doc)
    return UserOut(id=str(res.inserted_id), **{k: doc[k] for k in ("fullName","email","role","isEnabled","createdAt")})


def find_by_email(email: str) -> dict | None:
    return _coll().find_one({"email": email})
