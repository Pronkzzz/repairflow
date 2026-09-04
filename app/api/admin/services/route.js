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
  const { categoryId, modelId, modelIds, name, priceCents, durationValue, durationUnit } = body || {};

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

  // Meerdere modellen tegelijk selecteren: modelIds is een array met 1 of meer
  // model-id's. Voor elk model wordt een aparte reparatie/prijs aangemaakt
  // (zelfde naam, prijs en duur), zodat je niet steeds hetzelfde opnieuw
  // hoeft te maken.
  const idList = Array.isArray(modelIds)
    ? [...new Set(modelIds.map((id) => String(id)).filter(Boolean))]
    : [];

  if (idList.length > 0) {
    const models = await db.model.findMany({ where: { id: { in: idList } } });
    if (models.length !== idList.length || models.some((m) => m.categoryId !== categoryId)) {
      return NextResponse.json({ error: "Eén of meer modellen horen niet bij dit merk." }, { status: 400 });
    }

    const services = await db.$transaction(
      idList.map((id) =>
        db.service.create({
          data: {
            categoryId,
            modelId: id,
            name: name.trim(),
            priceCents: Math.round(price),
            durationMin,
            durationUnit: unit,
          },
        })
      )
    );

    return NextResponse.json({ services }, { status: 201 });
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
