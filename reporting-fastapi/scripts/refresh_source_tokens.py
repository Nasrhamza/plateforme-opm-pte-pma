from __future__ import annotations

import subprocess
from pathlib import Path

import requests
from pymongo import MongoClient


ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT_DIR / "app" / ".env"

PTE_BASE_URL = "http://localhost:3001/api"
PMA_BASE_URL = "http://localhost:3002/api/v1"
MONGO_URI = "mongodb://localhost:27017"
PTE_EMAIL = "etl_pte@prologic.local"
PTE_PASSWORD = "PteEtl123!"
PMA_EMAIL = "etl_pma@prologic.local"
PMA_PASSWORD = "PmaEtl123!"


def _bcrypt_hash(password: str, backend_dir: Path) -> str:
    result = subprocess.run(
        [
            "node",
            "-e",
            "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync(process.argv[1],10));",
            password,
        ],
        cwd=str(backend_dir),
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def _ensure_pte_user(email: str, password: str) -> None:
    password_hash = _bcrypt_hash(password, ROOT_DIR.parent / "PTE" / "PTE_Backend")
    users = MongoClient(MONGO_URI)["pte"]["users"]
    users.update_one(
        {"email": email},
        {
            "$set": {
                "firstName": "ETL",
                "lastName": "PTE",
                "email": email,
                "password": password_hash,
                "roles": ["ADMIN"],
                "departement": "Data",
                "isEnabled": "Active",
            }
        },
        upsert=True,
    )


def _ensure_pma_user(email: str, password: str) -> None:
    password_hash = _bcrypt_hash(password, ROOT_DIR.parent / "PMA" / "PMA-Backend")
    users = MongoClient(MONGO_URI)["pma"]["users"]
    users.update_one(
        {"email": email},
        {
            "$set": {
                "fullName": "ETL PMA",
                "phone": "+21600000000",
                "email": email,
                "password": password_hash,
                "roles": ["Admin"],
                "department": "Data",
                "isEnabled": True,
            }
        },
        upsert=True,
    )

def _login_pte(email: str, password: str) -> str:
    response = requests.post(
        f"{PTE_BASE_URL}/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    token = (payload or {}).get("token") or ((payload or {}).get("data") or {}).get("token")
    if not token:
        raise RuntimeError("PTE token not found in /login response")
    return token


def _login_pma(email: str, password: str) -> str:
    response = requests.post(
        f"{PMA_BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json() or {}
    token = (payload.get("data") or {}).get("token") or payload.get("token")
    if not token:
        raise RuntimeError("PMA token not found in /auth/login response")
    return token


def _upsert_env_var(content: str, key: str, value: str) -> str:
    lines = content.splitlines()
    updated = False
    for index, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[index] = f"{key}={value}"
            updated = True
            break
    if not updated:
        lines.append(f"{key}={value}")
    return "\n".join(lines) + "\n"


def main() -> None:
    _ensure_pte_user(PTE_EMAIL, PTE_PASSWORD)
    _ensure_pma_user(PMA_EMAIL, PMA_PASSWORD)

    pte_token = _login_pte(PTE_EMAIL, PTE_PASSWORD)
    pma_token = _login_pma(PMA_EMAIL, PMA_PASSWORD)

    current = ENV_PATH.read_text(encoding="utf-8") if ENV_PATH.exists() else ""
    current = _upsert_env_var(current, "PTE_API_TOKEN", pte_token)
    current = _upsert_env_var(current, "PMA_API_TOKEN", pma_token)
    ENV_PATH.write_text(current, encoding="utf-8")

    print("Updated app/.env with fresh PTE_API_TOKEN and PMA_API_TOKEN")


if __name__ == "__main__":
    main()
