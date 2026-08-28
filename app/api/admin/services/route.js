import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

function toDurationMin(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(unit === "uur" ? n * 60 : n);
}

export async function POST(request) {
  const gate = await requirePermission("pricing");
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const { categoryId, modelId, name, priceCents, durationValue, durationUnit } = body || {};

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

  const unit = durationUnit === "uur" ? "uur" : "min";
  const durationMin = toDurationMin(durationValue ?? 60, unit);
  if (durationMin === null) {
    return NextResponse.json({ error: "Vul een geldige duur in." }, { status: 400 });
  }

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Merk niet gevonden." }, { status: 400 });
  }

  if (modelId) {
    const model = await db.model.findUnique({ where: { id: String(modelId) } });
    if (!model || model.categoryId !== categoryId) {
      return NextResponse.json({ error: "Model hoort niet bij dit merk." }, { status: 400 });
    }
  }

  const service = await db.service.create({
    data: {
      categoryId,
      modelId: modelId ? String(modelId) : null,
      name: name.trim(),
      priceCents: Math.round(price),
      durationMin,
      durationUnit: unit,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
