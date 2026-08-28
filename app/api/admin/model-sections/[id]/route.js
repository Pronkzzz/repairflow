import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

export async function PATCH(request, { params }) {
  const gate = await requirePermission("models");
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = {};
  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Sectienaam mag niet leeg zijn." }, { status: 400 });
    data.name = name.slice(0, 100);
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  try {
    const section = await db.modelSection.update({ where: { id }, data });
    return NextResponse.json({ section });
  } catch {
    return NextResponse.json({ error: "Kon sectie niet opslaan." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const gate = await requirePermission("models");
  if (gate.error) return gate.error;
  const { id } = await params;
  await db.modelSection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
