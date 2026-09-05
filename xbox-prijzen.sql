-- ============================================================
-- Xbox-prijslijst invoegen (One / Series S / Series X)
-- Plak dit volledige script in de Neon SQL-editor en klik "Run".
-- Je kan dit veilig meerdere keren draaien: bestaande reparaties
-- (zelfde merk + model + naam) worden niet gedupliceerd.
-- ============================================================

-- Als je een foutmelding krijgt over "gen_random_uuid does not exist",
-- verwijder dan het streepje hieronder en draai deze regel eerst apart:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Zorg dat de 3 modellen bestaan onder het merk "Xbox"
--    (slaat automatisch over als ze al bestaan)
INSERT INTO "Model" ("id","categoryId","name","slug","order","active")
SELECT gen_random_uuid()::text, c.id, v.name, v.slug, v.ord, true
FROM "Category" c
CROSS JOIN (VALUES
  ('Xbox One',      'xbox-one',      0),
  ('Xbox Series S', 'xbox-series-s', 1),
  ('Xbox Series X', 'xbox-series-x', 2)
) AS v(name, slug, ord)
WHERE c.slug = 'xbox'
ON CONFLICT ("categoryId","slug") DO NOTHING;

-- 2) Alle reparaties + prijzen per model invoegen
WITH cat AS (
  SELECT id FROM "Category" WHERE slug = 'xbox'
),
mdl AS (
  SELECT m.id, m.slug FROM "Model" m
  JOIN cat c ON m."categoryId" = c.id
),
-- prijs in centen, duur in minuten, eenheid "min" of "uur" (bepaalt enkel de weergave)
data(model_slug, service_name, price_cents, duration_min, duration_unit) AS (
  VALUES
    ('xbox-one',      'Diagnose van de console', 999, 30, 'min'),
    ('xbox-series-s', 'Diagnose van de console', 999, 30, 'min'),
    ('xbox-series-x', 'Diagnose van de console', 999, 30, 'min'),

    ('xbox-one',      'Systeemsoftware herstellen', 3999, 60, 'min'),
    ('xbox-series-s', 'Systeemsoftware herstellen', 4499, 60, 'min'),
    ('xbox-series-x', 'Systeemsoftware herstellen', 4499, 60, 'min'),

    ('xbox-one',      'Console reinigen & thermische pasta vervangen', 3999, 90, 'uur'),
    ('xbox-series-s', 'Console reinigen & thermische pasta vervangen', 4999, 90, 'uur'),
    ('xbox-series-x', 'Console reinigen & thermische pasta vervangen', 5999, 90, 'uur'),

    ('xbox-one',      'Koelventilator vervangen', 4999, 90, 'uur'),
    ('xbox-series-s', 'Koelventilator vervangen', 5999, 90, 'uur'),
    ('xbox-series-x', 'Koelventilator vervangen', 6999, 90, 'uur'),

    ('xbox-one',      'USB-poort vervangen', 4499, 90, 'min'),
    ('xbox-series-s', 'USB-poort vervangen', 4999, 90, 'min'),
    ('xbox-series-x', 'USB-poort vervangen', 4999, 90, 'min'),

    ('xbox-one',      'Voeding herstellen', 5999, 120, 'uur'),
    ('xbox-series-s', 'Voeding herstellen', 6999, 120, 'uur'),
    ('xbox-series-x', 'Voeding herstellen', 7999, 120, 'uur'),

    ('xbox-one',      'HDMI-poort vervangen', 6999, 120, 'uur'),
    ('xbox-series-s', 'HDMI-poort vervangen', 8999, 120, 'uur'),
    ('xbox-series-x', 'HDMI-poort vervangen', 9999, 120, 'uur'),

    ('xbox-one',      'Opslag upgraden (+ onderdeel)', 5999, 120, 'uur'),
    ('xbox-series-s', 'Opslag upgraden (+ onderdeel)', 6999, 120, 'uur'),
    ('xbox-series-x', 'Opslag upgraden (+ onderdeel)', 7999, 120, 'uur'),

    -- Xbox Series S heeft geen schijfstation -> bewust overgeslagen
    ('xbox-one',      'Schijfstation herstellen', 6999, 120, 'uur'),
    ('xbox-series-x', 'Schijfstation herstellen', 7999, 120, 'uur'),

    ('xbox-one',      'Algemene consolereparatie (prijs vanaf)', 2999, 30, 'min'),
    ('xbox-series-s', 'Algemene consolereparatie (prijs vanaf)', 3499, 30, 'min'),
    ('xbox-series-x', 'Algemene consolereparatie (prijs vanaf)', 3499, 30, 'min')
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
