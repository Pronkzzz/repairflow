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
  const data = [
    {
      name: "iPhone",
      slug: "iphone",
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
      services: [
        { name: "Scherm vervangen", priceCents: 8900, durationMin: 45 },
        { name: "Batterij vervangen", priceCents: 5900, durationMin: 30 },
        { name: "Laadpoort herstellen", priceCents: 6500, durationMin: 45 },
      ],
    },
    {
      name: "MacBook",
      slug: "macbook",
      services: [
        { name: "Scherm vervangen", priceCents: 19900, durationMin: 90 },
        { name: "Batterij vervangen", priceCents: 12900, durationMin: 60 },
        { name: "Toetsenbord vervangen", priceCents: 14900, durationMin: 90 },
      ],
    },
    {
      name: "iPad",
      slug: "ipad",
      services: [
        { name: "Scherm vervangen", priceCents: 9900, durationMin: 60 },
        { name: "Batterij vervangen", priceCents: 7900, durationMin: 60 },
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
  }

  console.log("Categorieën en diensten geladen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
