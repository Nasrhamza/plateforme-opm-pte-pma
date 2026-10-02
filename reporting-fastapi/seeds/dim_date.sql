INSERT INTO core.dim_date (date_sk, full_date, day_of_week, day_name, day_of_month,
                           day_of_year, week_of_year, month_num, month_name, quarter, year, is_weekend)
SELECT
    EXTRACT(YEAR FROM d)::INT * 10000 + EXTRACT(MONTH FROM d)::INT * 100 + EXTRACT(DAY FROM d)::INT AS date_sk,
    d::DATE AS full_date,
    EXTRACT(ISODOW FROM d)::INT AS day_of_week,
    TRIM(TO_CHAR(d, 'Day')) AS day_name,
    EXTRACT(DAY FROM d)::INT AS day_of_month,
    EXTRACT(DOY FROM d)::INT AS day_of_year,
    EXTRACT(WEEK FROM d)::INT AS week_of_year,
    EXTRACT(MONTH FROM d)::INT AS month_num,
    TRIM(TO_CHAR(d, 'Month')) AS month_name,
    EXTRACT(QUARTER FROM d)::INT AS quarter,
    EXTRACT(YEAR FROM d)::INT AS year,
    EXTRACT(ISODOW FROM d) IN (6, 7) AS is_weekend
FROM generate_series('2022-01-01'::DATE, '2030-12-31'::DATE, INTERVAL '1 day') AS d
ON CONFLICT (date_sk) DO NOTHING;
