import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

export async function PATCH(request, { params }) {
  const gate = await requirePermission("products");
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Productnaam mag niet leeg zijn." }, { status: 400 });
    data.name = name;
  }

  if (body.category !== undefined) {
    const category = String(body.category).trim();
    data.category = category || "Overig";
  }

  if (body.sku !== undefined) {
    data.sku = body.sku ? String(body.sku).trim().slice(0, 100) : null;
  }

  if (body.priceCents !== undefined) {
    const price = Number(body.priceCents);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Ongeldige prijs." }, { status: 400 });
    }
    data.priceCents = Math.round(price);
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json({ error: "Ongeldige voorraad." }, { status: 400 });
    }
    data.stock = Math.round(stock);
  }

  if (body.active !== undefined) data.active = Boolean(body.active);

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  const gate = await requirePermission("products");
  if (gate.error) return gate.error;

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
