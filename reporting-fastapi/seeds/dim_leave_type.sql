INSERT INTO core.dim_leave_type (code, label, is_paid) VALUES
  ('PAID',       'Paid Leave',            TRUE),
  ('UNPAID',     'Unpaid Leave',          FALSE),
  ('SICK',       'Sick Leave',            TRUE),
  ('MATERNITY',  'Maternity Leave',       TRUE),
  ('PATERNITY',  'Paternity Leave',       TRUE),
  ('BEREAVEMENT','Bereavement Leave',     TRUE),
  ('OTHER',      'Other',                 FALSE)
ON CONFLICT (code) DO NOTHING;
