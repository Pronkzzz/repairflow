-- ============================================================
-- Custom PC-prijslijst invoegen als nieuwe categorie "PC".
-- Deze reparaties zijn algemeen (niet per specifiek model), dus er
-- wordt één model "Desktop & Laptop" aangemaakt zodat bezoekers op
-- de site kunnen doorklikken naar de prijzenlijst.
-- Plak dit volledige script in de Neon SQL-editor en klik "Run".
-- Veilig om meerdere keren te draaien.
-- ============================================================

-- 1) Categorie "PC" aanmaken als ze nog niet bestaat
INSERT INTO "Category" ("id","name","slug","order","active")
SELECT gen_random_uuid()::text, 'PC', 'pc', COALESCE((SELECT MAX("order") FROM "Category"), 0) + 1, true
WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE slug = 'pc');

-- 2) Eén model aanmaken zodat er een prijzenpagina te bezoeken is
INSERT INTO "Model" ("id","categoryId","name","slug","order","active")
SELECT gen_random_uuid()::text, c.id, 'Desktop & Laptop', 'desktop-laptop', 0, true
FROM "Category" c
WHERE c.slug = 'pc'
ON CONFLICT ("categoryId","slug") DO NOTHING;

-- 3) De reparaties zelf (algemeen, niet gekoppeld aan één specifiek model)
WITH cat AS (
  SELECT id FROM "Category" WHERE slug = 'pc'
),
-- prijs in centen, duur in minuten, eenheid "min" of "uur" (bepaalt enkel de weergave)
data(service_name, price_cents, duration_min, duration_unit) AS (
  VALUES
    ('Pc op maat samenstellen',                       9999, 180, 'uur'),
    ('Pc-upgrade (prijs vanaf)',                       3999,  90, 'min'),
    ('Onderdeel installeren (prijs vanaf)',            2499,  60, 'min'),
    ('Windows installeren',                            3999,  60, 'min'),
    ('Pc instellen & optimaliseren',                   4999,  90, 'uur'),
    ('Gaming-pc optimaliseren',                        5999, 120, 'uur'),
    ('Diagnose van de pc',                              999,  30, 'min'),
    ('Pc-reparatie (prijs vanaf)',                     3999, 120, 'uur'),
    ('Pc reinigen',                                    2999,  60, 'min'),
    ('Thermische pasta vervangen',                     2999,  45, 'min'),
    ('Kabelmanagement',                                2999,  60, 'min'),
    ('BIOS-update & instellen',                        2499,  40, 'min'),
    ('Opslag upgraden (+ onderdeel)',                  2999,  60, 'min'),
    ('RAM-geheugen installeren (+ onderdeel)',         1999,  30, 'min'),
    ('Videokaart installeren (+ onderdeel)',           2999,  40, 'min'),
    ('Processor & koeler installeren (+ onderdeel)',   4999,  90, 'min'),
    ('Gegevens overzetten (prijs vanaf)',              3999, 120, 'uur')
)
INSERT INTO "Service"
  ("id","categoryId","modelId","name","priceCents","durationMin","durationUnit","active","featured","featuredOrder","createdAt")
SELECT
  gen_random_uuid()::text, cat.id, NULL, d.service_name, d.price_cents, d.duration_min, d.duration_unit,
  true, false, 0, now()
FROM data d
CROSS JOIN cat
WHERE NOT EXISTS (
  SELECT 1 FROM "Service" s
  WHERE s."categoryId" = cat.id
    AND s."modelId" IS NULL
    AND s.name = d.service_name
);
