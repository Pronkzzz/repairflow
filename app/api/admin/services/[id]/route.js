import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function toDurationMin(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(unit === "uur" ? n * 60 : n);
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = {};

  if (body.priceCents !== undefined) {
    const price = Number(body.priceCents);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Ongeldige prijs." }, { status: 400 });
    }
    data.priceCents = Math.round(price);
  }

  if (body.durationValue !== undefined || body.durationUnit !== undefined) {
    const unit = body.durationUnit === "uur" ? "uur" : "min";
    const existing = await db.service.findUnique({ where: { id } });
    const value = body.durationValue !== undefined
      ? body.durationValue
      : (unit === "uur" ? existing?.durationMin / 60 : existing?.durationMin);
    const durationMin = toDurationMin(value, unit);

    if (durationMin === null) {
      return NextResponse.json({ error: "Ongeldige duur." }, { status: 400 });
    }
    data.durationMin = durationMin;
    data.durationUnit = unit;
  }

  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.featured !== undefined) data.featured = Boolean(body.featured);

  if (body.featuredOrder !== undefined) {
    const order = Number(body.featuredOrder);
    if (Number.isFinite(order)) data.featuredOrder = Math.round(order);
  }

  const service = await db.service.update({ where: { id }, data });
  return NextResponse.json({ service });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  await db.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
