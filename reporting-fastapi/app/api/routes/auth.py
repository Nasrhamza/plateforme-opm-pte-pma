from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import verify_password, create_access_token, get_current_user, require_admin
from app.models.user import create_user, find_by_email, UserIn, UserOut, EmailField

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    email: EmailField
    password: str


@router.post("/register", response_model=UserOut)
def register(payload: UserIn, _: dict = Depends(require_admin)):
    if find_by_email(payload.email):
        raise HTTPException(409, "Email already registered")
    return create_user(payload)


@router.post("/login")
def login(body: LoginIn):
    user = find_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.get("isEnabled", True):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user["role"],
        },
    }


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
