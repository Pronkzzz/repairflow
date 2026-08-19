import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDaySlots, isSunday, MAX_BOOKINGS_PER_SLOT } from "@/lib/slots";
import { rateLimit } from "@/lib/rateLimit";

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

  const { serviceId, date, timeSlot, customerName, email, phone, notes } = body || {};

  // --- Server-side validatie: nooit alleen op de client vertrouwen ---
  if (!serviceId || typeof serviceId !== "string") {
    return NextResponse.json({ error: "Kies een dienst." }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Kies een geldige datum." }, { status: 400 });
  }
  if (isSunday(date)) {
    return NextResponse.json({ error: "We zijn zondag gesloten." }, { status: 400 });
  }
  if (!timeSlot || !generateDaySlots().includes(timeSlot)) {
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

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Deze dienst bestaat niet (meer)." }, { status: 400 });
  }

  // --- Voorkom overboeking: check nogmaals server-side, ook al is de client al gefilterd ---
  const bookedCount = await db.appointment.count({
    where: { date, timeSlot, status: { not: "cancelled" } },
  });
  if (bookedCount >= MAX_BOOKINGS_PER_SLOT) {
    return NextResponse.json(
      { error: "Dit tijdslot is net volgeboekt. Kies een ander moment." },
      { status: 409 }
    );
  }

  const appointment = await db.appointment.create({
    data: {
      serviceId,
      date,
      timeSlot,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      notes: notes?.trim()?.slice(0, 500) || null,
    },
  });

  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
