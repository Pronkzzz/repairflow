import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // --- Admin account ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@repairflow.be";
  const adminPassword = process.env.ADMIN_PASSWORD || "wijzig-dit-wachtwoord";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });
  console.log(`Admin klaar: ${adminEmail} / wachtwoord: ${adminPassword}`);

  // --- Categorieën + modellen + diensten ---
  const data = [
    {
      name: "iPhone",
      slug: "iphone",
      models: ["iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone SE"],
      services: [
        { name: "Scherm vervangen", priceCents: 7900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
        { name: "Achterkant vervangen", priceCents: 6900, durationMin: 60 },
        { name: "Waterschade herstellen", priceCents: 4900, durationMin: 90 },
      ],
    },
    {
      name: "Samsung",
      slug: "samsung",
      models: ["Galaxy S24", "Galaxy S23", "Galaxy S22", "Galaxy A54", "Galaxy A34"],
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
        { name: "Laadpoort herstellen", priceCents: 6500, durationMin: 45 },
      ],
    },
    {
      name: "MacBook",
      slug: "macbook",
      models: ["MacBook Air M2", "MacBook Air M1", "MacBook Pro 14\"", "MacBook Pro 16\"", "MacBook Pro (Intel)"],
      services: [
        { name: "Scherm vervangen", priceCents: 19900, durationMin: 90 },
        { name: "Batterij vervangen", priceCents: 12900, durationMin: 60 },
        { name: "Toetsenbord vervangen", priceCents: 14900, durationMin: 90 },
      ],
    },
    {
      name: "iPad",
      slug: "ipad",
      models: ["iPad (10e gen)", "iPad Air", "iPad Pro 11\"", "iPad Pro 12.9\"", "iPad Mini"],
      services: [
        { name: "Scherm vervangen", priceCents: 9900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
      ],
    },
    {
      name: "Apple Watch",
      slug: "applewatch",
      models: ["Apple Watch Series 9", "Apple Watch SE", "Apple Watch Ultra 2"],
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 6900, durationMin: 45 },
      ],
    },
    {
      name: "iMac",
      slug: "imac",
      models: ["iMac 24\" M3", "iMac 24\" M1", "iMac 21.5\" (Intel)"],
      services: [
        { name: "Scherm vervangen", priceCents: 24900, durationMin: 90 },
        { name: "SSD/opslag vervangen", priceCents: 14900, durationMin: 60 },
      ],
    },
    {
      name: "Samsung Galaxy Tab",
      slug: "samsunggalaxytab",
      models: ["Galaxy Tab S9", "Galaxy Tab S8", "Galaxy Tab A9"],
      services: [
        { name: "Scherm vervangen", priceCents: 10900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
      ],
    },
    {
      name: "PlayStation",
      slug: "playstation",
      models: ["PlayStation 5", "PlayStation 4 Pro", "PlayStation 4"],
      services: [
        { name: "HDMI-poort herstellen", priceCents: 6900, durationMin: 60 },
        { name: "Oververhitting/fan reinigen", priceCents: 4900, durationMin: 45 },
        { name: "Controller stick drift herstellen", priceCents: 3900, durationMin: 30 },
      ],
    },
    {
      name: "Xbox",
      slug: "xbox",
      models: ["Xbox Series X", "Xbox Series S", "Xbox One"],
      services: [
        { name: "HDMI-poort herstellen", priceCents: 6900, durationMin: 60 },
        { name: "Oververhitting/fan reinigen", priceCents: 4900, durationMin: 45 },
        { name: "Controller stick drift herstellen", priceCents: 3900, durationMin: 30 },
      ],
    },
  ];

  for (let i = 0; i < data.length; i++) {
    const cat = data[i];
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: i },
      create: { name: cat.name, slug: cat.slug, order: i },
    });

    for (const svc of cat.services) {
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, name: svc.name },
      });
      if (!existing) {
        await prisma.service.create({
          data: { ...svc, categoryId: category.id },
        });
      }
    }

    for (let j = 0; j < (cat.models || []).length; j++) {
      const modelName = cat.models[j];
      const modelSlug = slugify(modelName);
      await prisma.model.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: modelSlug } },
        update: { name: modelName, order: j },
        create: { name: modelName, slug: modelSlug, order: j, categoryId: category.id },
      });
    }
  }

  console.log("Categorieën, modellen en diensten geladen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
