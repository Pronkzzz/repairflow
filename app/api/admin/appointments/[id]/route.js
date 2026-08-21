import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSlotsForDate, MAX_BOOKINGS_PER_SLOT } from "@/lib/slots";

const VALID_STATUSES = ["pending", "confirmed", "done", "cancelled"];

export async function PATCH(request, { params }) {
  // Extra check bovenop de middleware: nooit alleen op middleware vertrouwen voor API routes
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Ongeldige status." }, { status: 400 });
    }
    const appointment = await db.appointment.update({ where: { id }, data: { status: body.status } });
    return NextResponse.json({ appointment });
  }

  if (body.date !== undefined || body.timeSlot !== undefined) {
    const current = await db.appointment.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Afspraak niet gevonden." }, { status: 404 });
    const date = String(body.date || current.date);
    const timeSlot = String(body.timeSlot || current.timeSlot);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
    }
    const validSlots = await getSlotsForDate(date);
    if (!validSlots.includes(timeSlot)) {
      return NextResponse.json({ error: "Dit tijdstip valt buiten de ingestelde openingstijden." }, { status: 400 });
    }
    if (date !== current.date || timeSlot !== current.timeSlot) {
      const bookedCount = await db.appointment.count({
        where: { id: { not: id }, date, timeSlot, status: { not: "cancelled" } },
      });
      if (bookedCount >= MAX_BOOKINGS_PER_SLOT) {
        return NextResponse.json({ error: "Dit tijdslot is vol." }, { status: 409 });
      }
    }
    const appointment = await db.appointment.update({ where: { id }, data: { date, timeSlot } });
    return NextResponse.json({ appointment });
  }

  return NextResponse.json({ error: "Geen wijzigingen opgegeven." }, { status: 400 });
}
