from sqlalchemy import text
from app.db.connections import connections


def _client_map(db) -> dict[str, str]:
    """source_id → company name from stg_opm_clients."""
    return {
        doc["source_id"]: doc.get("company") or doc.get("source_id")
        for doc in db["stg_opm_clients"].find({}, {"source_id": 1, "company": 1})
        if doc.get("source_id")
    }


def load_dim_department() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    names = set()
    for coll in ("stg_opm_users", "stg_pma_users", "stg_pte_users"):
        for doc in db[coll].find({}, {"department": 1}):
            d = doc.get("department")
            if d:
                names.add(d.strip())
    for doc in db["stg_pte_leaves"].find({}, {"department": 1}):
        d = doc.get("department")
        if d:
            names.add(d.strip())
    with connections.pg_engine.begin() as conn:
        for name in names:
            conn.execute(text(
                "INSERT INTO core.dim_department (name) VALUES (:name) "
                "ON CONFLICT (name) DO NOTHING"
            ), {"name": name})
    return len(names)


def load_dim_contract() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    clients = _client_map(db)
    n = 0
    with connections.pg_engine.begin() as conn:
        for doc in db["stg_opm_contracts"].find({}):
            # Resolve primary client name from stg_opm_clients
            client_ids = doc.get("client_source_ids") or []
            cname = clients.get(client_ids[0]) if client_ids else None
            conn.execute(text("""
                INSERT INTO core.dim_contract
                  (source_id, contract_number, type, nature, sla_hours,
                   start_date, end_date, client_name, commercial_person_name)
                VALUES (:sid, :num, :tp, :nat, :sla, :sd, :ed, :cname, :cpname)
                ON CONFLICT (source_id) DO UPDATE SET
                  contract_number        = EXCLUDED.contract_number,
                  type                   = EXCLUDED.type,
                  nature                 = EXCLUDED.nature,
                  sla_hours              = EXCLUDED.sla_hours,
                  end_date               = EXCLUDED.end_date,
                  client_name            = COALESCE(EXCLUDED.client_name,            core.dim_contract.client_name),
                  commercial_person_name = COALESCE(EXCLUDED.commercial_person_name, core.dim_contract.commercial_person_name)
            """), {
                "sid":    doc["source_id"],
                "num":    doc.get("contract_number"),
                "tp":     doc.get("type"),
                "nat":    doc.get("nature"),
                "sla":    int(str(doc.get("sla") or "0").replace("h", "").strip() or 0),
                "sd":     doc.get("start_date"),
                "ed":     doc.get("end_date"),
                "cname":  cname,
                "cpname": doc.get("commercial_person_name"),
            })
            n += 1
    return n


def load_dim_site() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    # Build site_id → client_name via contracts
    clients = _client_map(db)
    site_to_client: dict[str, str | None] = {}
    for contract in db["stg_opm_contracts"].find({}, {"list_site_ids": 1, "client_source_ids": 1}):
        client_ids = contract.get("client_source_ids") or []
        cname = clients.get(client_ids[0]) if client_ids else None
        for sid in contract.get("list_site_ids") or []:
            if sid not in site_to_client:
                site_to_client[sid] = cname
    n = 0
    with connections.pg_engine.begin() as conn:
        for doc in db["stg_opm_sites"].find({}):
            cname = site_to_client.get(doc.get("source_id") or "")
            conn.execute(text("""
                INSERT INTO core.dim_site (source_id, name, address, lat, lon, client_name)
                VALUES (:sid, :nm, :addr, :lat, :lon, :cname)
                ON CONFLICT (source_id) DO UPDATE SET
                  name        = EXCLUDED.name,
                  address     = EXCLUDED.address,
                  client_name = COALESCE(EXCLUDED.client_name, core.dim_site.client_name)
            """), {
                "sid":   doc.get("source_id") or "",
                "nm":    doc.get("name"),
                "addr":  doc.get("address"),
                "lat":   doc.get("lat"),
                "lon":   doc.get("lon"),
                "cname": cname,
            })
            n += 1
    return n


def load_dim_equipment() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    # equip_id → site_name  (from stg_opm_sites.list_equipment_ids)
    equip_to_site_id:   dict[str, str] = {}
    equip_to_site_name: dict[str, str] = {}
    for site in db["stg_opm_sites"].find({}, {"source_id": 1, "name": 1, "list_equipment_ids": 1}):
        for eid in site.get("list_equipment_ids") or []:
            equip_to_site_id[eid]   = site.get("source_id") or ""
            equip_to_site_name[eid] = site.get("name") or ""
    # site_id → contract_number  (from stg_opm_contracts.list_site_ids)
    site_to_contract: dict[str, str] = {}
    for contract in db["stg_opm_contracts"].find({}, {"contract_number": 1, "list_site_ids": 1}):
        for sid in contract.get("list_site_ids") or []:
            if sid not in site_to_contract:
                site_to_contract[sid] = contract.get("contract_number") or ""
    n = 0
    with connections.pg_engine.begin() as conn:
        for coll, kind in [("stg_opm_equipment", "HARD"), ("stg_opm_equipment_soft", "SOFT")]:
            for doc in db[coll].find({}):
                eid       = doc.get("source_id") or ""
                site_nm   = equip_to_site_name.get(eid)
                site_id   = equip_to_site_id.get(eid)
                ct_num    = site_to_contract.get(site_id) if site_id else None
                conn.execute(text("""
                    INSERT INTO core.dim_equipment
                      (source_id, serial_number, name, kind, version, constructor, site_name, contract_number)
                    VALUES (:sid, :sn, :nm, :kd, :ver, :cst, :site_nm, :ct_num)
                    ON CONFLICT (source_id) DO UPDATE SET
                      name            = EXCLUDED.name,
                      version         = EXCLUDED.version,
                      site_name       = COALESCE(EXCLUDED.site_name,       core.dim_equipment.site_name),
                      contract_number = COALESCE(EXCLUDED.contract_number, core.dim_equipment.contract_number)
                """), {
                    "sid":     eid,
                    "sn":      doc.get("serial_number"),
                    "nm":      doc.get("name"),
                    "kd":      kind,
                    "ver":     doc.get("version"),
                    "cst":     doc.get("constructor"),
                    "site_nm": site_nm,
                    "ct_num":  ct_num,
                })
                n += 1
    return n


def load_dim_project() -> int:
    connections.require_initialized()
    db = connections.warehouse_db

    # Build project_source_id → reclamation count from silver
    rec_counts: dict[str, int] = {}
    for rec in db["stg_pma_reclamations"].find({}, {"project_source_id": 1}):
        pid = str(rec.get("project_source_id") or "")
        if pid:
            rec_counts[pid] = rec_counts.get(pid, 0) + 1

    n = 0
    with connections.pg_engine.begin() as conn:
        for doc in db["stg_pma_projects"].find({}):
            sid = doc["source_id"]
            conn.execute(text("""
                INSERT INTO core.dim_project
                  (source_id, name, type, priority, team_leader_name,
                   start_date, end_date, closed_at, reclamation_count)
                VALUES (:sid, :nm, :tp, :pr,
                  (SELECT dp.full_name
                   FROM core.dim_person dp
                   JOIN core.dim_person_xref xr ON xr.person_sk = dp.person_sk
                   WHERE xr.source_system = 'PMA' AND xr.source_user_id = :tl_id
                   LIMIT 1),
                  :sd, :ed, :cl, :rc)
                ON CONFLICT (source_id) DO UPDATE SET
                  name              = EXCLUDED.name,
                  priority          = EXCLUDED.priority,
                  closed_at         = EXCLUDED.closed_at,
                  reclamation_count = EXCLUDED.reclamation_count,
                  team_leader_name  = COALESCE(EXCLUDED.team_leader_name, core.dim_project.team_leader_name)
            """), {
                "sid":   sid,
                "nm":    doc.get("name"),
                "tp":    doc.get("type"),
                "pr":    doc.get("priority"),
                "tl_id": str(doc.get("team_leader_source_id") or ""),
                "sd":    doc.get("start_date"),
                "ed":    doc.get("end_date"),
                "cl":    doc.get("closed_at"),
                "rc":    rec_counts.get(sid, 0),
            })
            n += 1
    return n


def load_dim_vehicle() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for doc in db["stg_pte_vehicles"].find({}):
            conn.execute(text("""
                INSERT INTO core.dim_vehicle (source_id, registration, model, type)
                VALUES (:sid, :reg, :md, :tp)
                ON CONFLICT (source_id) DO UPDATE SET model = EXCLUDED.model
            """), {
                "sid": doc.get("source_id") or "",
                "reg": doc.get("registration"),
                "md":  doc.get("model"),
                "tp":  doc.get("type"),
            })
            n += 1
    return n


def load_dim_room() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        for doc in db["stg_pte_rooms"].find({}):
            conn.execute(text("""
                INSERT INTO core.dim_room (source_id, label, location, capacity)
                VALUES (:sid, :lb, :loc, :cap)
                ON CONFLICT (source_id) DO UPDATE SET label = EXCLUDED.label
            """), {
                "sid": doc.get("source_id") or "",
                "lb":  doc.get("label") or doc.get("name"),
                "loc": doc.get("location"),
                "cap": doc.get("capacity"),
            })
            n += 1
    return n


def load_all_dims() -> dict[str, int]:
    return {
        "dim_department": load_dim_department(),
        "dim_contract":   load_dim_contract(),
        "dim_site":       load_dim_site(),
        "dim_equipment":  load_dim_equipment(),
        "dim_project":    load_dim_project(),
        "dim_vehicle":    load_dim_vehicle(),
        "dim_room":       load_dim_room(),
    }
