CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS mart_exec;
CREATE SCHEMA IF NOT EXISTS mart_opm;
CREATE SCHEMA IF NOT EXISTS mart_pma;
CREATE SCHEMA IF NOT EXISTS mart_pte;

-- Static time dimensions
CREATE TABLE IF NOT EXISTS core.dim_date (
    date_sk      INT PRIMARY KEY,
    full_date    DATE NOT NULL UNIQUE,
    day_of_week  INT NOT NULL,
    day_name     VARCHAR(10) NOT NULL,
    day_of_month INT NOT NULL,
    day_of_year  INT NOT NULL,
    week_of_year INT NOT NULL,
    month_num    INT NOT NULL,
    month_name   VARCHAR(10) NOT NULL,
    quarter      INT NOT NULL,
    year         INT NOT NULL,
    is_weekend   BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS core.dim_time_of_day (
    hour_sk    INT PRIMARY KEY,
    hour_label VARCHAR(8) NOT NULL
);

CREATE TABLE IF NOT EXISTS core.dim_source_system (
    source_system_sk SERIAL PRIMARY KEY,
    code             VARCHAR(10) NOT NULL UNIQUE,
    label            VARCHAR(50) NOT NULL
);

-- MDM: one physical person across OPM/PMA/PTE (conformed dimension)
CREATE TABLE IF NOT EXISTS core.dim_person (
    person_sk       BIGSERIAL PRIMARY KEY,
    email_norm      VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255),
    gender          VARCHAR(20),
    nationality     VARCHAR(100),
    dob             DATE,
    hiring_date     DATE,
    department      VARCHAR(100),
    title           VARCHAR(100),
    is_internal     BOOLEAN NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    seniority_level VARCHAR(20)
);

-- MDM cross-reference: (source_system, source_user_id) → person_sk
CREATE TABLE IF NOT EXISTS core.dim_person_xref (
    person_sk      BIGINT NOT NULL REFERENCES core.dim_person(person_sk),
    source_system  VARCHAR(10) NOT NULL,
    source_user_id VARCHAR(255) NOT NULL,
    match_method   VARCHAR(20) NOT NULL DEFAULT 'email',
    PRIMARY KEY (source_system, source_user_id)
);

CREATE TABLE IF NOT EXISTS core.dim_role (
    role_sk         SERIAL PRIMARY KEY,
    source_system   VARCHAR(10) NOT NULL,
    role_code       VARCHAR(50) NOT NULL,
    role_label      VARCHAR(100) NOT NULL,
    seniority_level VARCHAR(20),
    UNIQUE (source_system, role_code)
);

CREATE TABLE IF NOT EXISTS core.dim_department (
    department_sk SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    cost_center   VARCHAR(50)
);

-- Flat contract dim — client attributes denormalized directly (no FK to dim_client)
CREATE TABLE IF NOT EXISTS core.dim_contract (
    contract_sk            BIGSERIAL PRIMARY KEY,
    source_id              VARCHAR(255) NOT NULL UNIQUE,
    contract_number        VARCHAR(100),
    type                   VARCHAR(50),
    nature                 VARCHAR(50),
    sla_hours              INT,
    start_date             DATE,
    end_date               DATE,
    client_name            VARCHAR(255),
    client_country         VARCHAR(100),
    commercial_person_name VARCHAR(255)
);

-- Flat site dim — client attributes denormalized directly (no FK to dim_client)
CREATE TABLE IF NOT EXISTS core.dim_site (
    site_sk     BIGSERIAL PRIMARY KEY,
    source_id   VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255),
    address     VARCHAR(500),
    lat         NUMERIC(10,6),
    lon         NUMERIC(10,6),
    client_name VARCHAR(255)
);

-- Flat equipment dim — site/contract attributes denormalized directly (no hop through other dims)
CREATE TABLE IF NOT EXISTS core.dim_equipment (
    equipment_sk    BIGSERIAL PRIMARY KEY,
    source_id       VARCHAR(255) NOT NULL UNIQUE,
    serial_number   VARCHAR(255),
    name            VARCHAR(255),
    kind            VARCHAR(10) NOT NULL CHECK (kind IN ('HARD', 'SOFT')),
    version         VARCHAR(100),
    constructor     VARCHAR(100),
    site_name       VARCHAR(255),
    contract_number VARCHAR(100)
);

-- Flat project dim — TL/client names denormalized directly (no FK to dim_person)
CREATE TABLE IF NOT EXISTS core.dim_project (
    project_sk        BIGSERIAL PRIMARY KEY,
    source_id         VARCHAR(255) NOT NULL UNIQUE,
    name              VARCHAR(255),
    type              VARCHAR(50),
    priority          VARCHAR(20),
    team_leader_name  VARCHAR(255),
    client_name       VARCHAR(255),
    start_date        DATE,
    end_date          DATE,
    closed_at         TIMESTAMPTZ,
    reclamation_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS core.dim_vehicle (
    vehicle_sk   BIGSERIAL PRIMARY KEY,
    source_id    VARCHAR(255) NOT NULL UNIQUE,
    registration VARCHAR(50),
    model        VARCHAR(100),
    type         VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS core.dim_room (
    room_sk   BIGSERIAL PRIMARY KEY,
    source_id VARCHAR(255) NOT NULL UNIQUE,
    label     VARCHAR(100),
    location  VARCHAR(200),
    capacity  INT
);

CREATE TABLE IF NOT EXISTS core.dim_leave_type (
    leave_type_sk SERIAL PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    label         VARCHAR(100) NOT NULL,
    is_paid       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Junk dim: low-cardinality flag/status combinations across all three facts
CREATE TABLE IF NOT EXISTS core.dim_status (
    status_sk     SERIAL PRIMARY KEY,
    ticket_status VARCHAR(50),
    task_status   VARCHAR(50),
    event_status  VARCHAR(50),
    is_overdue    BOOLEAN,
    is_expired    BOOLEAN,
    is_helpdesk   BOOLEAN,
    is_sla_breach BOOLEAN,
    is_accepted   BOOLEAN
);
CREATE UNIQUE INDEX IF NOT EXISTS dim_status_combo_uq ON core.dim_status (
    COALESCE(ticket_status, ''),
    COALESCE(task_status, ''),
    COALESCE(event_status, ''),
    COALESCE(is_overdue, FALSE),
    COALESCE(is_expired, FALSE),
    COALESCE(is_helpdesk, FALSE),
    COALESCE(is_sla_breach, FALSE),
    COALESCE(is_accepted, FALSE)
);

CREATE TABLE IF NOT EXISTS core.dim_priority (
    priority_sk SERIAL PRIMARY KEY,
    level       VARCHAR(20) NOT NULL UNIQUE,
    weight      NUMERIC(5,2) NOT NULL DEFAULT 1.0
);
