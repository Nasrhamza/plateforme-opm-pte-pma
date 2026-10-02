CREATE TABLE IF NOT EXISTS core.fact_opm_ticket (
    ticket_sk                     BIGSERIAL PRIMARY KEY,
    source_id                     VARCHAR(255) NOT NULL UNIQUE,
    ticket_number                 VARCHAR(100),
    source_system_sk              INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    created_date_sk               INT REFERENCES core.dim_date(date_sk),
    created_hour_sk               INT REFERENCES core.dim_time_of_day(hour_sk),
    assigned_date_sk              INT REFERENCES core.dim_date(date_sk),
    resolved_date_sk              INT REFERENCES core.dim_date(date_sk),
    closed_date_sk                INT REFERENCES core.dim_date(date_sk),
    contract_sk                   BIGINT REFERENCES core.dim_contract(contract_sk),
    site_sk                       BIGINT REFERENCES core.dim_site(site_sk),
    equipment_sk                  BIGINT REFERENCES core.dim_equipment(equipment_sk),
    client_person_sk              BIGINT REFERENCES core.dim_person(person_sk),
    assigned_technician_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    status_sk                     INT REFERENCES core.dim_status(status_sk),
    time_to_assign_min            INT,
    time_to_resolve_min           INT,
    time_to_close_min             INT,
    reopen_count                  INT NOT NULL DEFAULT 0,
    etl_loaded_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_created_idx ON core.fact_opm_ticket(created_date_sk);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_tech_idx ON core.fact_opm_ticket(assigned_technician_person_sk);
CREATE INDEX IF NOT EXISTS fact_opm_ticket_contract_idx ON core.fact_opm_ticket(contract_sk);

CREATE TABLE IF NOT EXISTS core.fact_pma_task (
    task_sk               BIGSERIAL PRIMARY KEY,
    source_id             VARCHAR(255) NOT NULL UNIQUE,
    task_ref              VARCHAR(100),
    source_system_sk      INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    project_sk            BIGINT REFERENCES core.dim_project(project_sk),
    executor_person_sk    BIGINT REFERENCES core.dim_person(person_sk),
    team_leader_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    department_sk         INT REFERENCES core.dim_department(department_sk),
    start_date_sk         INT REFERENCES core.dim_date(date_sk),
    deadline_date_sk      INT REFERENCES core.dim_date(date_sk),
    closed_date_sk        INT REFERENCES core.dim_date(date_sk),
    status_sk             INT REFERENCES core.dim_status(status_sk),
    priority_sk           INT REFERENCES core.dim_priority(priority_sk),
    progress_pct          NUMERIC(5,2),
    note                  NUMERIC(5,2),
    rating_weight         NUMERIC(5,2),
    duration_days         INT,
    etl_loaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_pma_task_project_idx ON core.fact_pma_task(project_sk);
CREATE INDEX IF NOT EXISTS fact_pma_task_executor_idx ON core.fact_pma_task(executor_person_sk);
CREATE INDEX IF NOT EXISTS fact_pma_task_tl_idx ON core.fact_pma_task(team_leader_person_sk);

CREATE TABLE IF NOT EXISTS core.fact_pte_event (
    event_sk            BIGSERIAL PRIMARY KEY,
    source_id           VARCHAR(255) NOT NULL UNIQUE,
    event_type          VARCHAR(30) NOT NULL CHECK (event_type IN ('leave','vehicle_usage','room_reservation','vm_request','intervention')),
    source_system_sk    INT NOT NULL REFERENCES core.dim_source_system(source_system_sk),
    event_date_sk       INT REFERENCES core.dim_date(date_sk),
    event_hour_sk       INT REFERENCES core.dim_time_of_day(hour_sk),
    end_date_sk         INT REFERENCES core.dim_date(date_sk),
    applicant_person_sk BIGINT REFERENCES core.dim_person(person_sk),
    engineer_person_sk  BIGINT REFERENCES core.dim_person(person_sk),
    department_sk       INT REFERENCES core.dim_department(department_sk),
    vehicle_sk          BIGINT REFERENCES core.dim_vehicle(vehicle_sk),
    room_sk             BIGINT REFERENCES core.dim_room(room_sk),
    leave_type_sk       INT REFERENCES core.dim_leave_type(leave_type_sk),
    status_sk           INT REFERENCES core.dim_status(status_sk),
    duration_min        INT,
    km                  NUMERIC(10,2),
    ram_gb              INT,
    disk_gb             INT,
    business_days       INT,
    etl_loaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS fact_pte_event_type_idx ON core.fact_pte_event(event_type);
CREATE INDEX IF NOT EXISTS fact_pte_event_date_idx ON core.fact_pte_event(event_date_sk);
CREATE INDEX IF NOT EXISTS fact_pte_event_applicant_idx ON core.fact_pte_event(applicant_person_sk);
