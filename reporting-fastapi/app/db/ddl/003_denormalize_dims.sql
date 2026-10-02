-- Migration: flatten snowflake dims into proper constellation (idempotent)

-- 0. Drop all mart views so column alterations below don't hit dependency errors
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_company_throughput CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_pm_scorecard CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_revenue_at_risk CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_client_health CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_workforce_availability CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_sla_compliance CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_mttr CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_mtta CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_first_call_resolution CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_technician_load CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_contract_health CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_tickets_by_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_portfolio_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_on_time_delivery CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_team_leader_score CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_engineer_productivity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_overdue_index CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_tasks_by_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_tasks_by_priority CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_leave_consumption CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_headcount_active CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_vehicle_utilization CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_room_occupancy CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_vm_lead_time CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_intervention_throughput CASCADE;

-- 1. Drop dimÃ¢â€ â€™dim FK constraints
ALTER TABLE core.dim_contract  DROP CONSTRAINT IF EXISTS dim_contract_client_sk_fkey;
ALTER TABLE core.dim_contract  DROP CONSTRAINT IF EXISTS dim_contract_commercial_person_sk_fkey;
ALTER TABLE core.dim_site      DROP CONSTRAINT IF EXISTS dim_site_client_sk_fkey;
ALTER TABLE core.dim_equipment DROP CONSTRAINT IF EXISTS dim_equipment_site_sk_fkey;
ALTER TABLE core.dim_equipment DROP CONSTRAINT IF EXISTS dim_equipment_contract_sk_fkey;
ALTER TABLE core.dim_project   DROP CONSTRAINT IF EXISTS dim_project_team_leader_person_sk_fkey;
ALTER TABLE core.dim_project   DROP CONSTRAINT IF EXISTS dim_project_client_person_sk_fkey;

-- 2. Drop the snowflake FK columns
ALTER TABLE core.dim_contract  DROP COLUMN IF EXISTS client_sk;
ALTER TABLE core.dim_contract  DROP COLUMN IF EXISTS commercial_person_sk;
ALTER TABLE core.dim_site      DROP COLUMN IF EXISTS client_sk;
ALTER TABLE core.dim_equipment DROP COLUMN IF EXISTS site_sk;
ALTER TABLE core.dim_equipment DROP COLUMN IF EXISTS contract_sk;
ALTER TABLE core.dim_project   DROP COLUMN IF EXISTS team_leader_person_sk;
ALTER TABLE core.dim_project   DROP COLUMN IF EXISTS client_person_sk;

-- 3. Drop dim_client (fully absorbed into dim_contract and dim_site)
DROP TABLE IF EXISTS core.dim_client CASCADE;

-- 4. Add flat denormalized columns (IF NOT EXISTS = safe on fresh deploys)
ALTER TABLE core.dim_contract  ADD COLUMN IF NOT EXISTS client_name            VARCHAR(255);
ALTER TABLE core.dim_contract  ADD COLUMN IF NOT EXISTS client_country         VARCHAR(100);
ALTER TABLE core.dim_contract  ADD COLUMN IF NOT EXISTS commercial_person_name VARCHAR(255);
ALTER TABLE core.dim_site      ADD COLUMN IF NOT EXISTS client_name            VARCHAR(255);
ALTER TABLE core.dim_equipment ADD COLUMN IF NOT EXISTS site_name              VARCHAR(255);
ALTER TABLE core.dim_equipment ADD COLUMN IF NOT EXISTS contract_number        VARCHAR(100);
ALTER TABLE core.dim_project   ADD COLUMN IF NOT EXISTS team_leader_name       VARCHAR(255);
ALTER TABLE core.dim_project   ADD COLUMN IF NOT EXISTS client_name            VARCHAR(255);
