from datetime import datetime, timedelta, timezone

from pymongo import MongoClient


def main() -> None:
    client = MongoClient("mongodb://localhost:27017")
    db = client["pte"]

    now = datetime.now(timezone.utc)
    users = db["users"]
    leaves = db["leaves"]
    virtualization = db["virtualizationenvs"]

    existing_user = users.find_one({"email": "seed.employee@prologic.local"})
    if existing_user:
        user_id = existing_user["_id"]
    else:
        user_id = users.insert_one(
            {
                "firstName": "Seed",
                "lastName": "Employee",
                "email": "seed.employee@prologic.local",
                "password": "$2a$10$seedseedseedseedseedseedseedseedseedseedseed",
                "roles": ["ENGINEER"],
                "departement": "Engineering",
                "isEnabled": "Active",
                "createdAt": now,
                "updatedAt": now,
            }
        ).inserted_id

    for i in range(8):
        start = now - timedelta(days=20 - i * 2)
        end = start + timedelta(days=2)
        leaves.update_one(
            {"email": "seed.employee@prologic.local", "startDate": start},
            {
                "$set": {
                    "applicant": user_id,
                    "date": start,
                    "fullName": "Seed Employee",
                    "email": "seed.employee@prologic.local",
                    "startDate": start,
                    "endDate": end,
                    "type": "Annual",
                    "note": f"Seed leave {i + 1}",
                    "status": "Pending 1/2" if i % 2 else "Pending 0/2",
                    "supervisorAccepted": bool(i % 2),
                    "managerAccepted": False,
                    "updatedAt": now,
                },
                "$setOnInsert": {"createdAt": start},
            },
            upsert=True,
        )

    for i in range(5):
        start = now - timedelta(days=10 - i)
        end = start + timedelta(days=30)
        virtualization.update_one(
            {"email": "seed.employee@prologic.local", "type": f"Lab-{i + 1}"},
            {
                "$set": {
                    "firstName": "Seed",
                    "lastName": "Employee",
                    "email": "seed.employee@prologic.local",
                    "departement": "Engineering",
                    "type": f"Lab-{i + 1}",
                    "backup": bool(i % 2),
                    "ram": "16GB",
                    "disk": "200GB",
                    "processor": "4 vCPU",
                    "dhcp": True,
                    "start": start,
                    "end": end,
                    "goals": f"Validation env {i + 1}",
                    "status": "Accepted",
                    "isAccepted": True,
                    "applicant": user_id,
                },
                "$setOnInsert": {"code": f"VENV-{i + 1:03d}"},
            },
            upsert=True,
        )

    print("seed user:", user_id)
    print("seed leaves:", leaves.count_documents({"email": "seed.employee@prologic.local"}))
    print("seed virtualization:", virtualization.count_documents({"email": "seed.employee@prologic.local"}))


if __name__ == "__main__":
    main()
