INSERT INTO core.dim_source_system (code, label) VALUES
  ('OPM', 'Operations Management (Helpdesk)'),
  ('PMA', 'Project Management'),
  ('PTE', 'Personnel & Technical Equipment')
ON CONFLICT (code) DO NOTHING;
