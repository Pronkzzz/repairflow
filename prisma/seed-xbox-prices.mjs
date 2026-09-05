// Eenmalig script om de volledige Xbox-prijslijst (One / Series S / Series X)
// toe te voegen aan de database, met de juiste naam, prijs per model en duur.
//
// Gebruik (lokaal, met je echte DATABASE_URL in .env.local):
//   node prisma/seed-xbox-prices.mjs
//
// Je kan dit script veilig meerdere keren draaien: bestaande reparaties met
// dezelfde naam + model worden geüpdatet (prijs/duur), niet gedupliceerd.
//
// Let op — twee dingen die ik zelf heb ingevuld omdat de tabel het niet
// letterlijk als getal gaf, en die je nadien gewoon kan aanpassen via
// Admin > Diensten & prijzen:
//  1. Tijdsduren waren een bereik (bv. "15–30 min"). Ik heb steeds de
//     bovengrens gebruikt als duur (veiliger dan te kort inschatten).
//  2. "Storage Upgrade" en "General Console Repair" kregen een extra stukje
//     tekst in de naam ("+ onderdeel" / "prijs vanaf") omdat het systeem
//     geen aparte "vanaf"-prijs of onderdeelkost ondersteunt.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_SLUG = "xbox";

// Model-slugs zoals ze al in prisma/seed.mjs staan.
const MODEL_SLUGS = {
  "Xbox One": "xbox-one",
  "Xbox Series S": "xbox-series-s",
  "Xbox Series X": "xbox-series-x",
};

// prijs in euro's (niet centen) — null = niet van toepassing voor dat model
const SERVICES = [
  {
    name: "Diagnose van de console",
    durationMin: 30,
    durationUnit: "min",
    prices: { "Xbox One": 9.99, "Xbox Series S": 9.99, "Xbox Series X": 9.99 },
  },
  {
    name: "Systeemsoftware herstellen",
    durationMin: 60,
    durationUnit: "min",
    prices: { "Xbox One": 39.99, "Xbox Series S": 44.99, "Xbox Series X": 44.99 },
  },
  {
    name: "Console reinigen & thermische pasta vervangen",
    durationMin: 1.5,
    durationUnit: "uur",
    prices: { "Xbox One": 39.99, "Xbox Series S": 49.99, "Xbox Series X": 59.99 },
  },
  {
    name: "Koelventilator vervangen",
    durationMin: 1.5,
    durationUnit: "uur",
    prices: { "Xbox One": 49.99, "Xbox Series S": 59.99, "Xbox Series X": 69.99 },
  },
  {
    name: "USB-poort vervangen",
    durationMin: 90,
    durationUnit: "min",
    prices: { "Xbox One": 44.99, "Xbox Series S": 49.99, "Xbox Series X": 49.99 },
  },
  {
    name: "Voeding herstellen",
    durationMin: 2,
    durationUnit: "uur",
    prices: { "Xbox One": 59.99, "Xbox Series S": 69.99, "Xbox Series X": 79.99 },
  },
  {
    name: "HDMI-poort vervangen",
    durationMin: 2,
    durationUnit: "uur",
    prices: { "Xbox One": 69.99, "Xbox Series S": 89.99, "Xbox Series X": 99.99 },
  },
  {
    name: "Opslag upgraden (+ onderdeel)",
    durationMin: 2,
    durationUnit: "uur",
    prices: { "Xbox One": 59.99, "Xbox Series S": 69.99, "Xbox Series X": 79.99 },
  },
  {
    name: "Schijfstation herstellen",
    durationMin: 2,
    durationUnit: "uur",
    // Xbox Series S heeft geen schijfstation -> geen prijs voor dat model
    prices: { "Xbox One": 69.99, "Xbox Series X": 79.99 },
  },
  {
    name: "Algemene consolereparatie (prijs vanaf)",
    durationMin: 30,
    durationUnit: "min",
    prices: { "Xbox One": 29.99, "Xbox Series S": 34.99, "Xbox Series X": 34.99 },
  },
];

function toDurationMin(value, unit) {
  return Math.round(unit === "uur" ? value * 60 : value);
}

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (!category) {
    throw new Error(
      `Categorie met slug "${CATEGORY_SLUG}" niet gevonden. Draai eerst 'npm run db:seed' of maak het merk Xbox aan via het admin panel.`
    );
  }

  // Modellen opzoeken (of aanmaken als ze om een of andere reden nog niet bestaan).
  const modelsByName = {};
  let order = 0;
  for (const [name, slug] of Object.entries(MODEL_SLUGS)) {
    const model = await prisma.model.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug } },
      update: {},
      create: { categoryId: category.id, name, slug, order: order++ },
    });
    modelsByName[name] = model;
  }

  let created = 0;
  let updated = 0;

  for (const svc of SERVICES) {
    const durationMin = toDurationMin(svc.durationMin, svc.durationUnit);

    for (const [modelName, priceEuro] of Object.entries(svc.prices)) {
      const model = modelsByName[modelName];
      if (!model || priceEuro === null || priceEuro === undefined) continue;

      const priceCents = Math.round(priceEuro * 100);

      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, modelId: model.id, name: svc.name },
      });

      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: { priceCents, durationMin, durationUnit: svc.durationUnit, active: true },
        });
        updated++;
      } else {
        await prisma.service.create({
          data: {
            categoryId: category.id,
            modelId: model.id,
            name: svc.name,
            priceCents,
            durationMin,
            durationUnit: svc.durationUnit,
          },
        });
        created++;
      }
    }
  }

  console.log(`Klaar. ${created} nieuwe reparatie(s) aangemaakt, ${updated} bijgewerkt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
