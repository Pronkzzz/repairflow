import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { requirePermission } from "@/lib/apiAuth";

// Zowel het voorraadscherm ("products") als de kassa ("pos") mogen de
// productenlijst opvragen — anders kan een kassamedewerker zonder
// voorraadrechten geen producten verkopen.
async function requireProductsRead() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }) };
  }
  if (!hasPermission(admin, "products") && !hasPermission(admin, "pos")) {
    return { error: NextResponse.json({ error: "Geen toegang tot dit onderdeel." }, { status: 403 }) };
  }
  return { admin };
}

export async function GET() {
  const gate = await requireProductsRead();
  if (gate.error) return gate.error;

  const products = await db.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const gate = await requirePermission("products");
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const category = String(body.category || "Overig").trim() || "Overig";
  const sku = body.sku ? String(body.sku).trim().slice(0, 100) : null;

  if (!name) {
    return NextResponse.json({ error: "Vul een productnaam in." }, { status: 400 });
  }

  const price = Number(body.priceCents);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Vul een geldige prijs in." }, { status: 400 });
  }

  const stock = Number(body.stock ?? 0);
  if (!Number.isFinite(stock) || stock < 0) {
    return NextResponse.json({ error: "Vul een geldige voorraad in." }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      name,
      category,
      sku,
      priceCents: Math.round(price),
      stock: Math.round(stock),
      active: true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
