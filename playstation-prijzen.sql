-- ============================================================
-- PlayStation-prijslijst invoegen (PS4 / PS4 Pro / PS5 / PS5 Slim)
-- Plak dit volledige script in de Neon SQL-editor en klik "Run".
-- Veilig om meerdere keren te draaien: bestaande reparaties
-- (zelfde merk + model + naam) worden niet gedupliceerd.
-- ============================================================

-- 1) Zorg dat de 4 modellen bestaan onder het merk "PlayStation"
--    (PS4, PS4 Pro en PS5 bestaan meestal al; PS5 Slim wordt hier toegevoegd
--    als hij nog niet bestaat)
INSERT INTO "Model" ("id","categoryId","name","slug","order","active")
SELECT gen_random_uuid()::text, c.id, v.name, v.slug, v.ord, true
FROM "Category" c
CROSS JOIN (VALUES
  ('PlayStation 4',      'playstation-4',      0),
  ('PlayStation 4 Pro',  'playstation-4-pro',  1),
  ('PlayStation 5',      'playstation-5',      2),
  ('PlayStation 5 Slim', 'playstation-5-slim', 3)
) AS v(name, slug, ord)
WHERE c.slug = 'playstation'
ON CONFLICT ("categoryId","slug") DO NOTHING;

-- 2) Alle reparaties + prijzen per model invoegen
WITH cat AS (
  SELECT id FROM "Category" WHERE slug = 'playstation'
),
mdl AS (
  SELECT m.id, m.slug FROM "Model" m
  JOIN cat c ON m."categoryId" = c.id
),
-- prijs in centen, duur in minuten, eenheid "min" of "uur" (bepaalt enkel de weergave)
data(model_slug, service_name, price_cents, duration_min, duration_unit) AS (
  VALUES
    ('playstation-4',      'Diagnose van de console', 999, 30, 'min'),
    ('playstation-4-pro',  'Diagnose van de console', 999, 30, 'min'),
    ('playstation-5',      'Diagnose van de console', 999, 30, 'min'),
    ('playstation-5-slim', 'Diagnose van de console', 999, 30, 'min'),

    ('playstation-4',      'Systeemsoftware herstellen', 3999, 60, 'min'),
    ('playstation-4-pro',  'Systeemsoftware herstellen', 3999, 60, 'min'),
    ('playstation-5',      'Systeemsoftware herstellen', 4499, 60, 'min'),
    ('playstation-5-slim', 'Systeemsoftware herstellen', 4499, 60, 'min'),

    ('playstation-4',      'Console reinigen & thermische pasta vervangen', 3999, 90, 'uur'),
    ('playstation-4-pro',  'Console reinigen & thermische pasta vervangen', 4999, 90, 'uur'),
    ('playstation-5',      'Console reinigen & thermische pasta vervangen', 5999, 90, 'uur'),
    ('playstation-5-slim', 'Console reinigen & thermische pasta vervangen', 5999, 90, 'uur'),

    ('playstation-4',      'Koelventilator vervangen', 4999, 90, 'uur'),
    ('playstation-4-pro',  'Koelventilator vervangen', 5499, 90, 'uur'),
    ('playstation-5',      'Koelventilator vervangen', 6999, 90, 'uur'),
    ('playstation-5-slim', 'Koelventilator vervangen', 6999, 90, 'uur'),

    ('playstation-4',      'USB-poort vervangen', 4499, 90, 'min'),
    ('playstation-4-pro',  'USB-poort vervangen', 4499, 90, 'min'),
    ('playstation-5',      'USB-poort vervangen', 4999, 90, 'min'),
    ('playstation-5-slim', 'USB-poort vervangen', 4999, 90, 'min'),

    ('playstation-4',      'HDMI-poort vervangen', 6999, 120, 'uur'),
    ('playstation-4-pro',  'HDMI-poort vervangen', 7499, 120, 'uur'),
    ('playstation-5',      'HDMI-poort vervangen', 8999, 120, 'uur'),
    ('playstation-5-slim', 'HDMI-poort vervangen', 8999, 120, 'uur'),

    ('playstation-4',      'Voeding herstellen', 5999, 120, 'uur'),
    ('playstation-4-pro',  'Voeding herstellen', 6499, 120, 'uur'),
    ('playstation-5',      'Voeding herstellen', 7999, 120, 'uur'),
    ('playstation-5-slim', 'Voeding herstellen', 7999, 120, 'uur'),

    ('playstation-4',      'Opslag upgraden (+ onderdeel)', 5999, 120, 'uur'),
    ('playstation-4-pro',  'Opslag upgraden (+ onderdeel)', 5999, 120, 'uur'),
    ('playstation-5',      'Opslag upgraden (+ onderdeel)', 6999, 120, 'uur'),
    ('playstation-5-slim', 'Opslag upgraden (+ onderdeel)', 6999, 120, 'uur'),

    ('playstation-4',      'Schijfstation herstellen', 6999, 120, 'uur'),
    ('playstation-4-pro',  'Schijfstation herstellen', 7499, 120, 'uur'),
    ('playstation-5',      'Schijfstation herstellen', 7999, 120, 'uur'),
    ('playstation-5-slim', 'Schijfstation herstellen', 7999, 120, 'uur'),

    ('playstation-4',      'Schijfstation vervangen (+ onderdeel)', 8999, 120, 'uur'),
    ('playstation-4-pro',  'Schijfstation vervangen (+ onderdeel)', 9499, 120, 'uur'),
    ('playstation-5',      'Schijfstation vervangen (+ onderdeel)', 9999, 120, 'uur'),
    ('playstation-5-slim', 'Schijfstation vervangen (+ onderdeel)', 9999, 120, 'uur'),

    ('playstation-4',      'Algemene consolereparatie (prijs vanaf)', 2999, 30, 'min'),
    ('playstation-4-pro',  'Algemene consolereparatie (prijs vanaf)', 3499, 30, 'min'),
    ('playstation-5',      'Algemene consolereparatie (prijs vanaf)', 3999, 30, 'min'),
    ('playstation-5-slim', 'Algemene consolereparatie (prijs vanaf)', 3999, 30, 'min')
)
INSERT INTO "Service"
  ("id","categoryId","modelId","name","priceCents","durationMin","durationUnit","active","featured","featuredOrder","createdAt")
SELECT
  gen_random_uuid()::text, cat.id, mdl.id, d.service_name, d.price_cents, d.duration_min, d.duration_unit,
  true, false, 0, now()
FROM data d
JOIN mdl ON mdl.slug = d.model_slug
CROSS JOIN cat
WHERE NOT EXISTS (
  SELECT 1 FROM "Service" s
  WHERE s."categoryId" = cat.id
    AND s."modelId" = mdl.id
    AND s.name = d.service_name
);
