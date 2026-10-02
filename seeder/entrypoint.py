"""
Seeder entrypoint: waits for all services, seeds MongoDB, triggers ETL.
Idempotent: skips seed if data already present.
"""
import os
import sys
import subprocess
import time
from pathlib import Path

import httpx
from pymongo import MongoClient

MONGO_URI = "mongodb://mongo:27017"
REPORTING_URL = "http://reporting-backend:8000"
BACKENDS = [
    "http://opm-backend:3000",
    "http://pte-backend:3001",
    "http://pma-backend:3002",
]
ARCHIVE = Path("/archive")

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL",    "saharbouhjar14@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin2025!")
ADMIN_NAME     = os.environ.get("ADMIN_NAME",     "Sahar Bouhjar")


def _log(msg: str) -> None:
    print(msg, flush=True)


def wait_mongo(retries: int = 60, delay: int = 3) -> None:
    _log("Waiting for MongoDB...")
    for _ in range(retries):
        try:
            MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000).admin.command("ping")
            _log("MongoDB ready")
            return
        except Exception:
            time.sleep(delay)
    sys.exit("ERROR: MongoDB unreachable after timeout")


def wait_http(url: str, retries: int = 60, delay: int = 3) -> None:
    _log(f"Waiting for {url}...")
    for _ in range(retries):
        try:
            if httpx.get(url, timeout=3).status_code < 500:
                _log(f"{url} ready")
                return
        except Exception:
            pass
        time.sleep(delay)
    _log(f"WARNING: {url} did not respond after timeout, continuing anyway")


def is_seeded() -> bool:
    try:
        c = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        return c["opm"]["tickets"].count_documents({}) > 0
    except Exception:
        return False


def run_seed() -> None:
    seed_src = ARCHIVE / "seed.py"
    if not seed_src.exists():
        sys.exit(f"ERROR: seed.py not found at {seed_src}")

    code = seed_src.read_text()
    # Fix MongoDB URI for Docker network
    code = code.replace("mongodb://127.0.0.1:27017", MONGO_URI)
    # Fix PMA isEnabled: Mongoose Boolean schema rejects string "Active" → stores false
    code = code.replace(
        '"roles": [ur.pma_role], "isEnabled": "Active", "image": "User.jpg"}',
        '"roles": [ur.pma_role], "isEnabled": True, "image": "User.jpg"}',
    )

    patched = ARCHIVE / "seed_run.py"
    patched.write_text(code)

    _log("Running seed.py...")
    subprocess.run(["python", str(patched)], cwd=str(ARCHIVE), check=True)
    _log("Seed complete")


def seed_admin() -> None:
    """Register the default admin account if it doesn't exist yet."""
    _log(f"Ensuring admin account: {ADMIN_EMAIL}")
    for attempt in range(10):
        try:
            r = httpx.post(
                f"{REPORTING_URL}/auth/register",
                json={
                    "fullName": ADMIN_NAME,
                    "email": ADMIN_EMAIL,
                    "password": ADMIN_PASSWORD,
                    "role": "admin",
                    "isEnabled": True,
                },
                timeout=10,
            )
            if r.status_code == 200:
                _log("Admin account created")
            elif r.status_code == 409:
                _log("Admin account already exists — skipping")
            else:
                _log(f"Admin register returned {r.status_code}: {r.text}")
            return
        except Exception as exc:
            _log(f"Admin seed attempt {attempt + 1} failed: {exc}")
            time.sleep(3)
    _log("WARNING: Could not create admin account after all attempts")


def trigger_etl() -> None:
    _log("Triggering ETL...")
    for attempt in range(15):
        try:
            r = httpx.post(f"{REPORTING_URL}/etl/run", timeout=180)
            data = r.json()
            facts = data.get("facts", {})
            _log(f"ETL done: finished_at={data.get('finished_at')}")
            _log(f"  fact_opm_ticket : {facts.get('fact_opm_ticket')}")
            _log(f"  fact_pma_task   : {facts.get('fact_pma_task')}")
            _log(f"  fact_pte_event  : {facts.get('fact_pte_event')}")
            return
        except Exception as exc:
            _log(f"ETL attempt {attempt + 1} failed: {exc}")
            time.sleep(5)
    _log("WARNING: ETL did not complete after all attempts")


if __name__ == "__main__":
    wait_mongo()
    for url in BACKENDS:
        wait_http(url)

    if is_seeded():
        _log("Data already present — skipping seed")
    else:
        run_seed()

    wait_http(f"{REPORTING_URL}/health")
    seed_admin()
    trigger_etl()
    _log("Seeder finished")
