import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { categoryId, name, priceCents, durationMin } = body || {};

  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "Kies een merk." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return NextResponse.json({ error: "Vul een naam in voor de reparatie." }, { status: 400 });
  }

  const price = Number(priceCents);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Vul een geldige prijs in." }, { status: 400 });
  }

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Merk niet gevonden." }, { status: 400 });
  }

  const service = await db.service.create({
    data: {
      categoryId,
      name: name.trim(),
      priceCents: Math.round(price),
      durationMin: Number.isFinite(Number(durationMin)) ? Math.round(Number(durationMin)) : 60,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
