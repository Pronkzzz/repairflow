import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // --- Categorieën + diensten ---
  // imageUrl = gratis te gebruiken foto (Wikimedia Commons, CC-BY-SA) waar beschikbaar.
  // Ontbreekt er een echte foto, dan valt de site automatisch terug op een icoon (zie CategoryCard).
  const data = [
    {
      name: "iPhone",
      slug: "iphone",
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Apple%20iPhone%2015.png",
      services: [
        { name: "Scherm vervangen", priceCents: 7900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
        { name: "Achterkant vervangen", priceCents: 6900, durationMin: 60 },
        { name: "Waterschade herstellen", priceCents: 4900, durationMin: 90 },
        { name: "Camera repareren", priceCents: 6900, durationMin: 45 },
        { name: "Laadpoort herstellen", priceCents: 5900, durationMin: 45 },
      ],
    },
    {
      name: "Samsung",
      slug: "samsung",
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Galaxy%20S23%20(cropped).png",
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
        { name: "Laadpoort herstellen", priceCents: 6500, durationMin: 45 },
        { name: "Achterkant vervangen", priceCents: 6900, durationMin: 60 },
        { name: "Camera repareren", priceCents: 6900, durationMin: 45 },
      ],
    },
    {
      name: "iPad",
      slug: "ipad",
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/IPad%20Pro%2011%20mockup.png",
      services: [
        { name: "Scherm vervangen", priceCents: 9900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
        { name: "Laadpoort herstellen", priceCents: 6900, durationMin: 45 },
      ],
    },
    {
      name: "Samsung Galaxy Tab",
      slug: "samsung-tablet",
      imageUrl: null,
      services: [
        { name: "Scherm vervangen", priceCents: 10900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
      ],
    },
    {
      name: "MacBook",
      slug: "macbook",
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/MacBook%20Air%20M1.png",
      services: [
        { name: "Scherm vervangen", priceCents: 19900, durationMin: 90 },
        { name: "Batterij vervangen", priceCents: 12900, durationMin: 60 },
        { name: "Toetsenbord vervangen", priceCents: 14900, durationMin: 90 },
        { name: "Laadpoort herstellen", priceCents: 9900, durationMin: 60 },
      ],
    },
    {
      name: "iMac",
      slug: "imac",
      imageUrl: null,
      services: [
        { name: "Scherm vervangen", priceCents: 24900, durationMin: 120 },
        { name: "SSD/opslag upgraden", priceCents: 14900, durationMin: 90 },
      ],
    },
    {
      name: "Apple Watch",
      slug: "apple-watch",
      imageUrl: null,
      services: [
        { name: "Schermglas vervangen", priceCents: 6900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
      ],
    },
    {
      name: "Google Pixel",
      slug: "google-pixel",
      imageUrl: null,
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
      ],
    },
    {
      name: "OnePlus",
      slug: "oneplus",
      imageUrl: null,
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
      ],
    },
    {
      name: "PlayStation",
      slug: "playstation",
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/PS5DigitalEdition.png",
      services: [
        { name: "HDMI-poort herstellen", priceCents: 6900, durationMin: 60 },
        { name: "Interne reiniging + pasta", priceCents: 4900, durationMin: 45 },
        { name: "Schijfeenheid repareren", priceCents: 7900, durationMin: 60 },
      ],
    },
    {
      name: "Xbox",
      slug: "xbox",
      imageUrl: null,
      services: [
        { name: "HDMI-poort herstellen", priceCents: 6900, durationMin: 60 },
        { name: "Interne reiniging + pasta", priceCents: 4900, durationMin: 45 },
      ],
    },
  ];

  for (let i = 0; i < data.length; i++) {
    const cat = data[i];
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: i, imageUrl: cat.imageUrl },
      create: { name: cat.name, slug: cat.slug, order: i, imageUrl: cat.imageUrl },
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
  }

  console.log("Categorieën en diensten geladen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
