-- ============================================================
-- Zet de al ingevoerde Engelse Xbox-reparatienamen om naar Nederlands.
-- Dit maakt GEEN nieuwe rijen aan, het past enkel de "name"-kolom aan
-- van de reparaties die je eerder met de Engelse namen hebt ingevoegd.
-- Prijs en duur blijven ongewijzigd.
-- Plak dit in de Neon SQL-editor en klik "Run".
-- ============================================================

UPDATE "Service" s
SET name = r.new_name
FROM (VALUES
  ('Console Diagnostics',                    'Diagnose van de console'),
  ('System Software Repair',                 'Systeemsoftware herstellen'),
  ('Console Cleaning & Thermal Paste',       'Console reinigen & thermische pasta vervangen'),
  ('Cooling Fan Replacement',                'Koelventilator vervangen'),
  ('USB Port Replacement',                   'USB-poort vervangen'),
  ('Power Supply Repair',                    'Voeding herstellen'),
  ('HDMI Port Replacement',                  'HDMI-poort vervangen'),
  ('Storage Upgrade (+ onderdeel)',          'Opslag upgraden (+ onderdeel)'),
  ('Disc Drive Repair',                      'Schijfstation herstellen'),
  ('General Console Repair (prijs vanaf)',   'Algemene consolereparatie (prijs vanaf)')
) AS r(old_name, new_name)
WHERE s.name = r.old_name
  AND s."categoryId" = (SELECT id FROM "Category" WHERE slug = 'xbox');
