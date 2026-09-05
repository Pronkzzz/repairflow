import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

export async function GET(request, { params }) {
  const gate = await requirePermission("pos");
  if (gate.error) return gate.error;

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Bon niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
