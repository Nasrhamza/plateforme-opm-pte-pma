from __future__ import annotations

import argparse
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from pymongo import MongoClient


STATUSES_OPM = ["Open", "In Progress", "Resolved", "On Hold"]
LEAVE_TYPES = ["Annual", "Sick", "Maternity", "Unpaid"]
LEAVE_STATUS = ["Pending 0/2", "Pending 1/2", "Approved", "Rejected"]
VEHICLE_TYPES = ["civil", "commercial", "utility"]
VIRT_STATUS = ["pending", "approved", "rejected", "deployed"]
PMA_PROJECT_STATUS = ["Not Started", "In Progress", "Completed", "Blocked"]
PMA_TASK_STATUS = ["todo", "in_progress", "review", "done"]
PMA_TASK_PRIORITY = ["low", "medium", "high", "critical"]
RECLAMATION_STATUS = ["open", "in_progress", "closed"]
DEPARTMENTS = ["HR", "Engineering", "Finance", "Operations", "Support"]
OPM_AUTHORITIES = ["client", "technician", "commercial", "assistant", "pmo", "helpdeskUser"]
PTE_ROLES = ["ADMIN", "ENGINEER", "ASSISTANT", "LAB-MANAGER"]
PMA_ROLES = ["Admin", "Engineer", "Client", "Team Leader"]


@dataclass
class SeedConfig:
    mongo_uri: str
    opm_db: str
    pte_db: str
    pma_db: str
    months: int
    scale: int
    reset: bool
    seed: int


def rand_dt(start: datetime, end: datetime) -> datetime:
    delta = end - start
    seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=seconds)


def reset_collections(db, names: list[str]) -> None:
    for name in names:
        db[name].delete_many({})


def build_shared_people(scale: int, start: datetime, now: datetime) -> list[dict]:
    people = []
    for i in range(80 * scale):
        person_id = ObjectId()
        created_at = rand_dt(start, now)
        people.append(
            {
                "_id": person_id,
                "fullName": f"User {i + 1}",
                "email": f"user{i + 1}@synthetic.local",
                "department": random.choice(DEPARTMENTS),
                "createdAt": created_at,
                "updatedAt": now,
                "opm_authority": random.choice(OPM_AUTHORITIES),
                "pte_role": random.choice(PTE_ROLES),
                "pma_role": random.choice(PMA_ROLES),
            }
        )
    return people


def seed_shared_users(opm_db, pte_db, pma_db, people: list[dict]) -> dict[str, int]:
    opm_users = []
    pte_users = []
    pma_users = []
    for p in people:
        opm_users.append(
            {
                "_id": p["_id"],
                "fullName": p["fullName"],
                "email": p["email"],
                "authority": p["opm_authority"],
                "createdAt": p["createdAt"],
                "updatedAt": p["updatedAt"],
            }
        )
        pte_users.append(
            {
                "_id": p["_id"],
                "fullName": p["fullName"],
                "email": p["email"],
                "department": p["department"],
                "role": p["pte_role"],
                "createdAt": p["createdAt"],
                "updatedAt": p["updatedAt"],
            }
        )
        pma_users.append(
            {
                "_id": p["_id"],
                "fullName": p["fullName"],
                "email": p["email"],
                "role": p["pma_role"],
                "department": p["department"],
                "createdAt": p["createdAt"],
                "updatedAt": p["updatedAt"],
            }
        )

    opm_db["users"].insert_many(opm_users)
    pte_db["users"].insert_many(pte_users)
    pma_db["users"].insert_many(pma_users)
    return {"opm_users": len(opm_users), "pte_users": len(pte_users), "pma_users": len(pma_users)}


def seed_opm(opm_db, people: list[dict], months: int, scale: int) -> dict[str, int]:
    tech_ids = [p["_id"] for p in people if p["opm_authority"] == "technician"] or [p["_id"] for p in people[:12]]
    client_ids = [p["_id"] for p in people if p["opm_authority"] == "client"] or [p["_id"] for p in people[12:24]]
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30 * months)

    tickets = []
    for i in range(500 * scale):
        created_at = rand_dt(start, now)
        status = random.choice(STATUSES_OPM)
        is_expired = random.random() < 0.18
        resolved_at = created_at + timedelta(days=random.randint(1, 12))
        tickets.append(
            {
                "_id": ObjectId(),
                "number": 100000 + i,
                "createdAt": created_at,
                "updatedAt": resolved_at if status == "Resolved" else now,
                "status": status,
                "technician": random.choice(tech_ids),
                "client": random.choice(client_ids),
                "isExpired": is_expired,
            }
        )

    opm_db["tickets"].insert_many(tickets)
    return {"tickets": len(tickets)}


def seed_pte(pte_db, people: list[dict], months: int, scale: int) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30 * months)
    users = people

    leaves = []
    for _ in range(320 * scale):
        start_date = rand_dt(start, now)
        chosen_user = random.choice(users)
        leaves.append(
            {
                "_id": ObjectId(),
                "type": random.choice(LEAVE_TYPES),
                "status": random.choice(LEAVE_STATUS),
                "department": chosen_user["department"],
                "user": chosen_user["_id"],
                "startDate": start_date,
                "createdAt": start_date - timedelta(days=random.randint(1, 10)),
                "updatedAt": now,
            }
        )
    pte_db["leaves"].insert_many(leaves)

    vehicles = []
    for _ in range(260 * scale):
        date = rand_dt(start, now)
        distance = random.randint(10, 450)
        consumption = round(distance * random.uniform(0.05, 0.18), 2)
        vehicles.append(
            {
                "_id": ObjectId(),
                "type": random.choice(VEHICLE_TYPES),
                "distance": distance,
                "consumption": consumption,
                "mission": random.random() < 0.45,
                "date": date,
                "createdAt": date,
                "updatedAt": now,
            }
        )
    pte_db["vehicles"].insert_many(vehicles)

    rooms = []
    for i in range(12 * scale):
        utilization = round(random.uniform(0.2, 0.95), 3)
        created_at = rand_dt(start, now)
        rooms.append(
            {
                "_id": ObjectId(),
                "name": f"Room-{i + 1}",
                "utilizationRate": utilization,
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pte_db["rooms"].insert_many(rooms)

    virtualization = []
    for _ in range(150 * scale):
        created_at = rand_dt(start, now)
        virtualization.append(
            {
                "_id": ObjectId(),
                "status": random.choice(VIRT_STATUS),
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pte_db["virtualization_env"].insert_many(virtualization)

    return {
        "leaves": len(leaves),
        "vehicles": len(vehicles),
        "rooms": len(rooms),
        "virtualization_env": len(virtualization),
    }


def seed_pma(pma_db, people: list[dict], months: int, scale: int) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30 * months)

    team_leaders = [p["_id"] for p in people if p["pma_role"] == "Team Leader"] or [p["_id"] for p in people[:10]]
    executors = [p["_id"] for p in people if p["pma_role"] in {"Engineer", "Team Leader"}] or [p["_id"] for p in people]
    project_ids = [ObjectId() for _ in range(75 * scale)]

    projects = []
    for pid in project_ids:
        created_at = rand_dt(start, now)
        due = created_at + timedelta(days=random.randint(20, 120))
        status = random.choice(PMA_PROJECT_STATUS)
        projects.append(
            {
                "_id": pid,
                "status": status,
                "teamLeader": random.choice(team_leaders),
                "dueDate": due,
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pma_db["projects"].insert_many(projects)

    tasks = []
    for _ in range(900 * scale):
        created_at = rand_dt(start, now)
        tasks.append(
            {
                "_id": ObjectId(),
                "status": random.choice(PMA_TASK_STATUS),
                "priority": random.choice(PMA_TASK_PRIORITY),
                "project": random.choice(project_ids),
                "executor": random.choice(executors),
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pma_db["tasks"].insert_many(tasks)

    reclamations = []
    for _ in range(220 * scale):
        created_at = rand_dt(start, now)
        reclamations.append(
            {
                "_id": ObjectId(),
                "status": random.choice(RECLAMATION_STATUS),
                "project": random.choice(project_ids),
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pma_db["reclamations"].insert_many(reclamations)

    ratings = []
    for _ in range(180 * scale):
        created_at = rand_dt(start, now)
        ratings.append(
            {
                "_id": ObjectId(),
                "project": random.choice(project_ids),
                "finalRating": round(random.uniform(1.5, 5.0), 2),
                "createdAt": created_at,
                "updatedAt": now,
            }
        )
    pma_db["projectratings"].insert_many(ratings)

    return {
        "projects": len(projects),
        "tasks": len(tasks),
        "reclamations": len(reclamations),
        "projectratings": len(ratings),
    }


def parse_args() -> SeedConfig:
    parser = argparse.ArgumentParser(description="Seed synthetic data for OPM/PTE/PMA reporting sources.")
    parser.add_argument("--mongo-uri", default="mongodb://localhost:27017", help="Base Mongo connection URI.")
    parser.add_argument("--opm-db", default="opm")
    parser.add_argument("--pte-db", default="pte")
    parser.add_argument("--pma-db", default="pma")
    parser.add_argument("--months", type=int, default=9, help="How many months of historical data.")
    parser.add_argument("--scale", type=int, default=1, help="Data volume multiplier.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    parser.add_argument("--reset", action="store_true", help="Delete target collections before seeding.")
    ns = parser.parse_args()
    return SeedConfig(
        mongo_uri=ns.mongo_uri,
        opm_db=ns.opm_db,
        pte_db=ns.pte_db,
        pma_db=ns.pma_db,
        months=ns.months,
        scale=ns.scale,
        reset=ns.reset,
        seed=ns.seed,
    )


def main() -> None:
    cfg = parse_args()
    random.seed(cfg.seed)
    client = MongoClient(cfg.mongo_uri)

    opm_db = client[cfg.opm_db]
    pte_db = client[cfg.pte_db]
    pma_db = client[cfg.pma_db]

    opm_cols = ["users", "tickets"]
    pte_cols = ["users", "leaves", "vehicles", "rooms", "virtualization_env"]
    pma_cols = ["users", "projects", "tasks", "reclamations", "projectratings"]

    if cfg.reset:
        reset_collections(opm_db, opm_cols)
        reset_collections(pte_db, pte_cols)
        reset_collections(pma_db, pma_cols)

    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30 * cfg.months)
    people = build_shared_people(cfg.scale, start, now)
    identity_stats = seed_shared_users(opm_db, pte_db, pma_db, people)

    opm_stats = seed_opm(opm_db, people, cfg.months, cfg.scale)
    pte_stats = seed_pte(pte_db, people, cfg.months, cfg.scale)
    pma_stats = seed_pma(pma_db, people, cfg.months, cfg.scale)

    print("Synthetic data seeded successfully.")
    print("SHARED:", identity_stats)
    print("OPM:", opm_stats)
    print("PTE:", pte_stats)
    print("PMA:", pma_stats)


if __name__ == "__main__":
    main()
