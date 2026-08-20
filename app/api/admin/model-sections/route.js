import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const categoryId = String(body.categoryId || "");
  const name = String(body.name || "").trim();
  if (!categoryId || !name) return NextResponse.json({ error: "Vul een sectienaam in." }, { status: 400 });

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) return NextResponse.json({ error: "Merk niet gevonden." }, { status: 400 });

  const count = await db.modelSection.count({ where: { categoryId } });
  try {
    const section = await db.modelSection.create({
      data: { categoryId, name: name.slice(0, 100), order: count },
    });
    return NextResponse.json({ section }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Deze sectie bestaat al voor dit merk." }, { status: 400 });
  }
}
