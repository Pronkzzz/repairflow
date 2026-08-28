import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request) {
  const gate = await requirePermission("models");
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const { categoryId, name, imageUrl } = body || {};

  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json({ error: "Kies een merk." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return NextResponse.json({ error: "Vul een modelnaam in." }, { status: 400 });
  }

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Merk niet gevonden." }, { status: 400 });
  }

  const slug = slugify(name.trim());
  const existing = await db.model.findUnique({
    where: { categoryId_slug: { categoryId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "Dit model bestaat al voor dit merk." }, { status: 400 });
  }

  const count = await db.model.count({ where: { categoryId } });

  const model = await db.model.create({
    data: {
      categoryId,
      name: name.trim(),
      slug,
      order: count,
      imageUrl: imageUrl ? String(imageUrl).trim().slice(0, 1000) : null,
    },
  });

  return NextResponse.json({ model }, { status: 201 });
}
