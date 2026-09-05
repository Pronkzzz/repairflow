import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/apiAuth";

const PAYMENT_METHODS = ["cash", "online"];

export async function GET(request) {
  const gate = await requirePermission("pos");
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("take")) || 20, 100);

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { items: true },
  });

  return NextResponse.json({ orders });
}

// Verkoop afronden aan de kassa: reparaties en/of losse producten in één
// bon. Prijzen worden hier opnieuw uit de database gehaald (nooit
// vertrouwen op wat de browser meestuurt), en productvoorraad wordt
// atomisch verlaagd zodat er nooit meer verkocht wordt dan er ligt.
export async function POST(request) {
  const gate = await requirePermission("pos");
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const paymentMethod = PAYMENT_METHODS.includes(body.paymentMethod) ? body.paymentMethod : null;
  const customerName = body.customerName ? String(body.customerName).trim().slice(0, 200) : null;
  const notes = body.notes ? String(body.notes).trim().slice(0, 1000) : null;

  if (!paymentMethod) {
    return NextResponse.json({ error: "Kies een betaalmethode (cash of online)." }, { status: 400 });
  }
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Voeg minstens één reparatie of product toe." }, { status: 400 });
  }

  // Normaliseer en valideer de binnenkomende items vóór we iets aanraken.
  const normalized = [];
  for (const raw of rawItems) {
    const quantity = Math.round(Number(raw?.quantity ?? 1));
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Ongeldig aantal voor een item." }, { status: 400 });
    }
    if (raw?.kind === "repair" && raw?.serviceId) {
      normalized.push({ kind: "repair", serviceId: String(raw.serviceId), quantity });
    } else if (raw?.kind === "product" && raw?.productId) {
      normalized.push({ kind: "product", productId: String(raw.productId), quantity });
    } else {
      return NextResponse.json({ error: "Ongeldig item in de winkelmand." }, { status: 400 });
    }
  }

  try {
    const order = await db.$transaction(async (tx) => {
      const itemsData = [];

      for (const item of normalized) {
        if (item.kind === "repair") {
          const service = await tx.service.findUnique({
            where: { id: item.serviceId },
            include: { category: true, model: true },
          });
          if (!service) throw new Error("Eén van de reparaties bestaat niet (meer).");

          const label = service.model
            ? `${service.category.name} — ${service.model.name} — ${service.name}`
            : `${service.category.name} — ${service.name}`;

          itemsData.push({
            kind: "repair",
            name: label,
            unitPriceCents: service.priceCents,
            quantity: item.quantity,
            lineTotalCents: service.priceCents * item.quantity,
            serviceId: service.id,
          });
        } else {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error("Eén van de producten bestaat niet (meer).");
          if (product.stock < item.quantity) {
            throw new Error(`Onvoldoende voorraad voor "${product.name}" (nog ${product.stock} op voorraad).`);
          }

          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });

          itemsData.push({
            kind: "product",
            name: product.name,
            unitPriceCents: product.priceCents,
            quantity: item.quantity,
            lineTotalCents: product.priceCents * item.quantity,
            productId: product.id,
          });
        }
      }

      const totalCents = itemsData.reduce((sum, i) => sum + i.lineTotalCents, 0);

      return tx.order.create({
        data: {
          paymentMethod,
          customerName,
          notes,
          totalCents,
          cashierEmail: gate.admin.email,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Kon de verkoop niet afronden." }, { status: 400 });
  }
}
