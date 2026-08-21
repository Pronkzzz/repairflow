import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSlotsForDate, MAX_BOOKINGS_PER_SLOT } from "@/lib/slots";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ongeldige datum" }, { status: 400 });
  }

  const allSlots = await getSlotsForDate(date);
  if (!allSlots.length) return NextResponse.json({ slots: [] });

  const existing = await db.appointment.groupBy({
    by: ["timeSlot"],
    where: { date, status: { not: "cancelled" } },
    _count: { timeSlot: true },
  });

  const bookedCounts = Object.fromEntries(existing.map((e) => [e.timeSlot, e._count.timeSlot]));
  const available = allSlots.filter((slot) => (bookedCounts[slot] || 0) < MAX_BOOKINGS_PER_SLOT);
  return NextResponse.json({ slots: available });
}
