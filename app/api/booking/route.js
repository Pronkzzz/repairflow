import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotsForDate, MAX_BOOKINGS_PER_SLOT } from "@/lib/slots";
import { rateLimit } from "@/lib/rateLimit";
import { sendAdminNewBookingEmail } from "@/lib/notify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  // --- Rate limiting: max 5 boekingspogingen per IP per minuut ---
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = rateLimit(`booking:${ip}`, { windowMs: 60_000, max: 5 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een minuut opnieuw." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const { modelId, date, timeSlot, customerName, email, phone, notes } = body || {};

  // Klant kan meerdere reparaties tegelijk boeken. We ondersteunen ook nog
  // het oude "serviceId" (enkelvoud) voor achterwaartse compatibiliteit.
  const rawServiceIds = Array.isArray(body?.serviceIds)
    ? body.serviceIds
    : body?.serviceId
    ? [body.serviceId]
    : [];
  const serviceIds = [...new Set(rawServiceIds)].filter(
    (id) => typeof id === "string" && id.length > 0
  );

  // --- Server-side validatie: nooit alleen op de client vertrouwen ---
  if (serviceIds.length === 0) {
    return NextResponse.json({ error: "Kies minstens één reparatie." }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Kies een geldige datum." }, { status: 400 });
  }
  const validSlots = await getSlotsForDate(date);
  if (!timeSlot || !validSlots.includes(timeSlot)) {
    return NextResponse.json({ error: "Kies een geldig tijdslot." }, { status: 400 });
  }
  if (!customerName || customerName.trim().length < 2) {
    return NextResponse.json({ error: "Vul je naam in." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }
  if (!phone || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Vul een geldig telefoonnummer in." }, { status: 400 });
  }

  const services = await db.service.findMany({
    where: { id: { in: serviceIds } },
    include: { category: true },
  });

  if (services.length !== serviceIds.length) {
    return NextResponse.json({ error: "Eén of meer reparaties bestaan niet (meer)." }, { status: 400 });
  }
  if (services.some((s) => !s.active || !s.category.active)) {
    return NextResponse.json({ error: "Eén of meer reparaties zijn niet meer beschikbaar." }, { status: 400 });
  }

  let validModelId = null;
  if (modelId && typeof modelId === "string") {
    const model = await db.model.findUnique({ where: { id: modelId } });
    const categoryId = services[0].categoryId;
    if (model && model.active && model.categoryId === categoryId) {
      validModelId = model.id;
    }
  }

  for (const service of services) {
    if (service.modelId && service.modelId !== validModelId) {
      return NextResponse.json({ error: "Kies eerst het juiste model voor deze reparatie." }, { status: 400 });
    }
  }

  // --- Voorkom overboeking: check nogmaals server-side, ook al is de client al gefilterd ---
  // Elke reparatie neemt één plek in het tijdslot in.
  const bookedCount = await db.appointment.count({
    where: { date, timeSlot, status: { not: "cancelled" } },
  });
  if (bookedCount + services.length > MAX_BOOKINGS_PER_SLOT) {
    return NextResponse.json(
      { error: "Dit tijdslot heeft niet genoeg vrije plekken meer voor al je reparaties. Kies een ander moment." },
      { status: 409 }
    );
  }

  const appointments = await db.$transaction(
    services.map((service) =>
      db.appointment.create({
        data: {
          serviceId: service.id,
          modelId: validModelId,
          date,
          timeSlot,
          customerName: customerName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          notes: notes?.trim()?.slice(0, 500) || null,
        },
        include: { service: true, model: true },
      })
    )
  );

  // Admin op de hoogte brengen van elke nieuwe boeking. Wordt awaited zodat
  // Vercel de function niet bevriest voordat de mail écht verstuurd is —
  // maar een fout hier mag de boeking zelf nooit laten mislukken voor de
  // klant, dus we vangen 'm hier af in plaats van door te gooien.
  for (const appointment of appointments) {
    try {
      await sendAdminNewBookingEmail(appointment);
    } catch (err) {
      console.error("[booking] Admin-melding versturen is mislukt:", err);
    }
  }

  return NextResponse.json(
    { id: appointments[0].id, ids: appointments.map((a) => a.id) },
    { status: 201 }
  );
}
