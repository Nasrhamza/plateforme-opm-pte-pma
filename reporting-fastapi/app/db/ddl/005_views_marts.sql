-- mart_opm: 7 KPI materialized views

DROP VIEW IF EXISTS mart_opm.v_sla_compliance CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_sla_compliance CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_sla_compliance AS
SELECT
    dc.contract_number                                                    AS contract,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                      AS period,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_sla_breach IS NOT TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                     AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract  dc ON dc.contract_sk  = f.contract_sk
JOIN core.dim_date      dd ON dd.date_sk       = f.created_date_sk
LEFT JOIN core.dim_status ds ON ds.status_sk  = f.status_sk
GROUP BY dc.contract_number, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_mttr CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_mttr CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_mttr AS
SELECT
    dc.contract_number                              AS contract,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')            AS period,
    ROUND(AVG(f.time_to_resolve_min) / 60.0, 2)   AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract dc ON dc.contract_sk = f.contract_sk
JOIN core.dim_date     dd ON dd.date_sk     = f.created_date_sk
WHERE f.time_to_resolve_min IS NOT NULL
  AND f.created_date_sk IS NOT NULL
GROUP BY dc.contract_number, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_mtta CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_mtta CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_mtta AS
SELECT
    dc.contract_number                              AS contract,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')            AS period,
    ROUND(AVG(f.time_to_assign_min) / 60.0, 2)    AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract dc ON dc.contract_sk = f.contract_sk
JOIN core.dim_date     dd ON dd.date_sk     = f.created_date_sk
WHERE f.time_to_assign_min IS NOT NULL
  AND f.created_date_sk IS NOT NULL
GROUP BY dc.contract_number, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_first_call_resolution CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_first_call_resolution CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_first_call_resolution AS
SELECT
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                              AS period,
    ROUND(
        100.0 * SUM(CASE WHEN f.reopen_count = 0 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                             AS value
FROM core.fact_opm_ticket f
JOIN core.dim_date dd ON dd.date_sk = f.created_date_sk
GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_technician_load CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_technician_load CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_technician_load AS
SELECT
    dp.full_name                            AS technician,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')    AS period,
    COUNT(*)                                AS value
FROM core.fact_opm_ticket f
JOIN core.dim_person dp ON dp.person_sk = f.assigned_technician_person_sk
JOIN core.dim_date   dd ON dd.date_sk   = f.created_date_sk
WHERE f.created_date_sk IS NOT NULL
GROUP BY dp.full_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_contract_health CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_contract_health CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_contract_health AS
SELECT
    dc.contract_number                                                    AS contract,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                  AS period,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_sla_breach IS NOT TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                     AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract  dc ON dc.contract_sk = f.contract_sk
JOIN core.dim_date      dd ON dd.date_sk     = f.created_date_sk
LEFT JOIN core.dim_status ds ON ds.status_sk = f.status_sk
WHERE f.created_date_sk IS NOT NULL
GROUP BY dc.contract_number, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_opm.v_tickets_by_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_opm.v_tickets_by_status CASCADE;
CREATE MATERIALIZED VIEW mart_opm.v_tickets_by_status AS
SELECT
    TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
    ds.ticket_status                  AS status,
    COUNT(*)                          AS value
FROM core.fact_opm_ticket f
LEFT JOIN core.dim_status ds ON ds.status_sk  = f.status_sk
JOIN      core.dim_date   dd ON dd.date_sk    = f.created_date_sk
WHERE ds.ticket_status IS NOT NULL
GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD'), ds.ticket_status;

-- mart_pma: 7 KPI materialized views

DROP VIEW IF EXISTS mart_pma.v_portfolio_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_portfolio_status CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_portfolio_status AS
SELECT
    TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
    ds.task_status                    AS status,
    COUNT(DISTINCT f.project_sk)      AS value
FROM core.fact_pma_task f
LEFT JOIN core.dim_status ds ON ds.status_sk = f.status_sk
JOIN      core.dim_date   dd ON dd.date_sk   = f.start_date_sk
WHERE ds.task_status IS NOT NULL
GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD'), ds.task_status;

DROP VIEW IF EXISTS mart_pma.v_on_time_delivery CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_on_time_delivery CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_on_time_delivery AS
SELECT
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                              AS period,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_overdue IS NOT TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                             AS value
FROM core.fact_pma_task f
JOIN core.dim_date    dd ON dd.date_sk   = f.closed_date_sk
LEFT JOIN core.dim_status ds ON ds.status_sk = f.status_sk
WHERE f.closed_date_sk IS NOT NULL
GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pma.v_team_leader_score CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_team_leader_score CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_team_leader_score AS
SELECT
    dp.full_name                                             AS team_leader,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                     AS period,
    ROUND(AVG(f.note * COALESCE(f.rating_weight, 1.0)), 2) AS value
FROM core.fact_pma_task f
JOIN core.dim_person dp ON dp.person_sk = f.team_leader_person_sk
JOIN core.dim_date   dd ON dd.date_sk   = f.closed_date_sk
WHERE f.note IS NOT NULL
  AND f.closed_date_sk IS NOT NULL
GROUP BY dp.full_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pma.v_engineer_productivity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_engineer_productivity CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_engineer_productivity AS
SELECT
    dp.full_name                            AS engineer,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')    AS period,
    COUNT(*)                                AS value
FROM core.fact_pma_task f
JOIN core.dim_person dp ON dp.person_sk = f.executor_person_sk
JOIN core.dim_date   dd ON dd.date_sk   = f.start_date_sk
WHERE f.start_date_sk IS NOT NULL
GROUP BY dp.full_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pma.v_overdue_index CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_overdue_index CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_overdue_index AS
SELECT
    dproj.name                                                            AS project,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                  AS period,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_overdue = TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                     AS value
FROM core.fact_pma_task f
JOIN core.dim_project dproj ON dproj.project_sk = f.project_sk
JOIN core.dim_date    dd    ON dd.date_sk        = f.deadline_date_sk
LEFT JOIN core.dim_status ds  ON ds.status_sk    = f.status_sk
WHERE f.deadline_date_sk IS NOT NULL
GROUP BY dproj.name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pma.v_tasks_by_status CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_tasks_by_status CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_tasks_by_status AS
SELECT
    ds.task_status                          AS status,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')    AS period,
    COUNT(*)                                AS value
FROM core.fact_pma_task f
LEFT JOIN core.dim_status ds ON ds.status_sk = f.status_sk
JOIN core.dim_date        dd ON dd.date_sk   = f.start_date_sk
WHERE ds.task_status IS NOT NULL
  AND f.start_date_sk IS NOT NULL
GROUP BY ds.task_status, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pma.v_tasks_by_priority CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pma.v_tasks_by_priority CASCADE;
CREATE MATERIALIZED VIEW mart_pma.v_tasks_by_priority AS
SELECT
    dp.level                                AS priority,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')    AS period,
    COUNT(*)                                AS value
FROM core.fact_pma_task f
JOIN core.dim_priority dp ON dp.priority_sk = f.priority_sk
JOIN core.dim_date     dd ON dd.date_sk     = f.start_date_sk
WHERE f.start_date_sk IS NOT NULL
GROUP BY dp.level, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

-- mart_pte: 6 KPI materialized views

DROP VIEW IF EXISTS mart_pte.v_leave_consumption CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_leave_consumption CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_leave_consumption AS
SELECT
    COALESCE(dp.department, ddep.name, 'Unknown')::varchar(100) AS department,
    dlt.code                                                      AS leave_type,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                              AS period,
    SUM(f.business_days)                                          AS value
FROM core.fact_pte_event f
LEFT JOIN core.dim_person     dp   ON dp.person_sk       = f.applicant_person_sk
LEFT JOIN core.dim_department ddep ON ddep.department_sk = f.department_sk
JOIN      core.dim_leave_type dlt  ON dlt.leave_type_sk  = f.leave_type_sk
JOIN      core.dim_date       dd   ON dd.date_sk          = f.event_date_sk
WHERE f.event_type = 'leave'
GROUP BY COALESCE(dp.department, ddep.name, 'Unknown')::varchar(100), dlt.code, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pte.v_headcount_active CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_headcount_active CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_headcount_active AS
SELECT
    dp.department   AS department,
    COUNT(*)        AS value
FROM core.dim_person dp
WHERE dp.is_active   = TRUE
  AND dp.is_internal = TRUE
  AND dp.department IS NOT NULL
GROUP BY dp.department;

DROP VIEW IF EXISTS mart_pte.v_vehicle_utilization CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_vehicle_utilization CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_vehicle_utilization AS
SELECT
    dv.registration                     AS vehicle,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
    SUM(COALESCE(f.km, 0))             AS value
FROM core.fact_pte_event f
JOIN core.dim_vehicle dv ON dv.vehicle_sk = f.vehicle_sk
JOIN core.dim_date    dd ON dd.date_sk    = f.event_date_sk
WHERE f.event_type = 'vehicle_usage'
  AND f.event_date_sk IS NOT NULL
GROUP BY dv.registration, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_pte.v_room_occupancy CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_room_occupancy CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_room_occupancy AS
SELECT
    dr.label                                    AS room,
    ROUND(SUM(f.duration_min) / 60.0, 2)       AS value
FROM core.fact_pte_event f
JOIN core.dim_room dr ON dr.room_sk = f.room_sk
WHERE f.event_type = 'room_reservation'
GROUP BY dr.label;

DROP VIEW IF EXISTS mart_pte.v_vm_lead_time CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_vm_lead_time CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_vm_lead_time AS
SELECT
    ROUND(AVG(f.duration_min) / 60.0, 2) AS value
FROM core.fact_pte_event f
WHERE f.event_type = 'vm_request';

DROP VIEW IF EXISTS mart_pte.v_intervention_throughput CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_pte.v_intervention_throughput CASCADE;
CREATE MATERIALIZED VIEW mart_pte.v_intervention_throughput AS
SELECT
    dp.full_name                     AS engineer,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
    COUNT(*)                         AS value
FROM core.fact_pte_event f
JOIN core.dim_person dp ON dp.person_sk = f.engineer_person_sk
JOIN core.dim_date   dd ON dd.date_sk   = f.event_date_sk
WHERE f.event_type = 'intervention'
GROUP BY dp.full_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

-- mart_exec: 5 KPI materialized views

DROP VIEW IF EXISTS mart_exec.v_company_throughput CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_company_throughput CASCADE;
CREATE MATERIALIZED VIEW mart_exec.v_company_throughput AS
SELECT
    period,
    SUM(value) AS value
FROM (
    SELECT
        TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
        COUNT(*)                          AS value
    FROM core.fact_opm_ticket f
    JOIN core.dim_date dd ON dd.date_sk = f.closed_date_sk
    WHERE f.closed_date_sk IS NOT NULL
    GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD')
    UNION ALL
    SELECT
        TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
        COUNT(*)                          AS value
    FROM core.fact_pma_task f
    JOIN core.dim_date dd ON dd.date_sk = f.closed_date_sk
    WHERE f.closed_date_sk IS NOT NULL
    GROUP BY TO_CHAR(dd.full_date, 'YYYY-MM-DD')
) sub
GROUP BY period;

-- Cross-app join: for each TL, aggregate their engineers' task scores AND ticket resolution
-- times. Both sides resolve through dim_person (MDM-unified person_sk).
DROP VIEW IF EXISTS mart_exec.v_pm_scorecard CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_pm_scorecard CASCADE;
CREATE MATERIALIZED VIEW mart_exec.v_pm_scorecard AS
SELECT
    tl.full_name                                                              AS team_leader,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                      AS period,
    ROUND(AVG(t.note * COALESCE(t.rating_weight, 1.0)), 2)                   AS avg_task_score,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_overdue IS NOT TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(DISTINCT t.task_sk), 0),
        2
    )                                                                         AS value,
    ROUND(AVG(ot.time_to_resolve_min) / 60.0, 2)                             AS avg_engineer_ticket_resolve_h
FROM core.fact_pma_task t
JOIN core.dim_person tl ON tl.person_sk = t.team_leader_person_sk
JOIN core.dim_date   dd ON dd.date_sk   = t.closed_date_sk
LEFT JOIN core.dim_status ds ON ds.status_sk = t.status_sk
LEFT JOIN core.fact_opm_ticket ot
       ON ot.assigned_technician_person_sk = t.executor_person_sk
WHERE t.closed_date_sk IS NOT NULL
GROUP BY tl.full_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

-- Contracts expiring within 90 days that had at least one SLA breach last quarter
DROP VIEW IF EXISTS mart_exec.v_revenue_at_risk CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_revenue_at_risk CASCADE;
CREATE MATERIALIZED VIEW mart_exec.v_revenue_at_risk AS
SELECT COUNT(DISTINCT c.contract_sk) AS value
FROM core.dim_contract c
WHERE c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days')::DATE
  AND EXISTS (
    SELECT 1
    FROM core.fact_opm_ticket f
    JOIN core.dim_status ds ON ds.status_sk = f.status_sk
    JOIN core.dim_date   dd ON dd.date_sk   = f.created_date_sk
    WHERE f.contract_sk    = c.contract_sk
      AND ds.is_sla_breach = TRUE
      AND dd.full_date    >= (date_trunc('quarter', CURRENT_DATE) - INTERVAL '3 months')::DATE
  );

-- Uses denormalized client_name on dim_contract — no extra join to dim_client needed
DROP VIEW IF EXISTS mart_exec.v_client_health CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_client_health CASCADE;
CREATE MATERIALIZED VIEW mart_exec.v_client_health AS
SELECT
    dcon.client_name                                                      AS client,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD')                                  AS period,
    ROUND(
        100.0 * SUM(CASE WHEN ds.is_sla_breach IS NOT TRUE THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    )                                                                     AS value
FROM core.fact_opm_ticket f
JOIN core.dim_contract dcon ON dcon.contract_sk = f.contract_sk
JOIN core.dim_date     dd   ON dd.date_sk       = f.created_date_sk
LEFT JOIN core.dim_status ds ON ds.status_sk    = f.status_sk
WHERE dcon.client_name IS NOT NULL
  AND f.created_date_sk IS NOT NULL
GROUP BY dcon.client_name, TO_CHAR(dd.full_date, 'YYYY-MM-DD');

DROP VIEW IF EXISTS mart_exec.v_workforce_availability CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mart_exec.v_workforce_availability CASCADE;
CREATE MATERIALIZED VIEW mart_exec.v_workforce_availability AS
SELECT
    dp.department                    AS department,
    TO_CHAR(dd.full_date, 'YYYY-MM-DD') AS period,
    COUNT(DISTINCT dp.person_sk)     AS value
FROM core.dim_person dp
JOIN core.fact_pte_event f  ON f.applicant_person_sk = dp.person_sk
JOIN core.dim_date       dd ON dd.date_sk             = f.event_date_sk
WHERE dp.is_active   = TRUE
  AND dp.is_internal = TRUE
  AND dp.department IS NOT NULL
GROUP BY dp.department, TO_CHAR(dd.full_date, 'YYYY-MM-DD');
