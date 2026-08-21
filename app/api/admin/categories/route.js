import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function slugify(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Vul een merknaam in." }, { status: 400 });
  const slug = slugify(name);
  if (!slug) return NextResponse.json({ error: "Ongeldige merknaam." }, { status: 400 });
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Dit merk bestaat al." }, { status: 400 });
  const count = await db.category.count();
  const category = await db.category.create({
    data: { name, slug, order: count, active: true },
  });
  return NextResponse.json({ category }, { status: 201 });
}
