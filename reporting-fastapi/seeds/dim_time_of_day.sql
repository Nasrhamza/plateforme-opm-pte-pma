INSERT INTO core.dim_time_of_day (hour_sk, hour_label)
SELECT h, LPAD(h::TEXT, 2, '0') || ':00'
FROM generate_series(0, 23) AS h
ON CONFLICT (hour_sk) DO NOTHING;
