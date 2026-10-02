INSERT INTO core.dim_priority (level, weight) VALUES
  ('Low',      0.5),
  ('Medium',   1.0),
  ('High',     2.0),
  ('Critical', 3.0),
  ('Unknown',  1.0)
ON CONFLICT (level) DO NOTHING;
