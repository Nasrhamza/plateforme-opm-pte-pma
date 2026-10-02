INSERT INTO core.dim_role (source_system, role_code, role_label, seniority_level) VALUES
  ('OPM', 'admin',          'Admin',                 'Director'),
  ('OPM', 'client',         'Client',                'IC'),
  ('OPM', 'technician',     'Technician',            'IC'),
  ('OPM', 'commercial',     'Commercial',            'Lead'),
  ('OPM', 'assistant',      'Assistant',             'IC'),
  ('OPM', 'pmo',            'PMO',                   'Manager'),
  ('OPM', 'helpdeskUser',   'Helpdesk User',         'IC'),
  ('PMA', 'Admin',          'Admin',                 'Director'),
  ('PMA', 'Engineer',       'Engineer',              'IC'),
  ('PMA', 'Client',         'Client',                'IC'),
  ('PMA', 'Team Leader',    'Team Leader',           'Lead'),
  ('PTE', 'ADMIN',          'Admin',                 'Director'),
  ('PTE', 'ENGINEER',       'Engineer',              'IC'),
  ('PTE', 'ASSISTANT',      'Assistant',             'IC'),
  ('PTE', 'LAB-MANAGER',    'Lab Manager',           'Manager')
ON CONFLICT (source_system, role_code) DO NOTHING;
