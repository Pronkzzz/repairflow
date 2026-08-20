import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = {};

  if (body.name !== undefined) {
    if (!body.name || String(body.name).trim().length < 1) {
      return NextResponse.json({ error: "Vul een modelnaam in." }, { status: 400 });
    }
    data.name = String(body.name).trim();
  }
  if (body.imageUrl !== undefined) {
    data.imageUrl = body.imageUrl ? String(body.imageUrl).trim().slice(0, 1000) : null;
  }
  if (body.sectionId !== undefined) {
    if (body.sectionId === null || body.sectionId === "") {
      data.sectionId = null;
    } else {
      const section = await db.modelSection.findUnique({ where: { id: String(body.sectionId) } });
      if (!section) return NextResponse.json({ error: "Sectie niet gevonden." }, { status: 400 });
      const current = await db.model.findUnique({ where: { id }, select: { categoryId: true } });
      if (!current || current.categoryId !== section.categoryId) {
        return NextResponse.json({ error: "Sectie hoort niet bij dit merk." }, { status: 400 });
      }
      data.sectionId = section.id;
    }
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0;

  const model = await db.model.update({ where: { id }, data });
  return NextResponse.json({ model });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  await db.model.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
