import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSlotsForDate, MAX_BOOKINGS_PER_SLOT } from "@/lib/slots";
import {
  sendConfirmationNotifications,
  sendCancellationNotifications,
  sendRescheduleNotifications,
} from "@/lib/notify";

const VALID_STATUSES = ["pending", "confirmed", "done", "cancelled"];
// Alleen afspraken die al achter de rug zijn (afgerond of geannuleerd)
// mogen verwijderd worden — actieve afspraken blijven staan.
const DELETABLE_STATUSES = ["done", "cancelled"];

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

    const before = await db.appointment.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Afspraak niet gevonden." }, { status: 404 });

    const appointment = await db.appointment.update({
      where: { id },
      data: { status: body.status },
      include: { service: true, model: true },
    });

    // Stuur bevestigingsmail + sms alleen bij de overgang náár "confirmed",
    // niet elke keer dat de status wordt opgeslagen.
    //
    // BELANGRIJK: dit moet AWAITED worden. Op Vercel (serverless) wordt de
    // function bevroren zodra de response is teruggestuurd — een "fire and
    // forget" call hierboven (zonder await) wordt dan vaak halverwege
    // afgebroken vóórdat de fetch naar Resend/Twilio klaar is, waardoor de
    // mail geruisloos verdwijnt zonder foutmelding.
    let notifyResult = null;
    try {
      if (body.status === "confirmed" && before.status !== "confirmed") {
        notifyResult = await sendConfirmationNotifications(appointment);
      } else if (body.status === "cancelled" && before.status !== "cancelled") {
        notifyResult = await sendCancellationNotifications(appointment);
      }
      const emailOutcome = notifyResult?.emailResult;
      if (emailOutcome?.status === "rejected") {
        console.error("[appointments] Mail versturen is mislukt:", emailOutcome.reason);
      } else if (emailOutcome?.value?.ok === false) {
        console.error("[appointments] Resend gaf aan dat de mail niet verzonden kon worden.");
      }
    } catch (err) {
      console.error("[appointments] Berichten versturen is mislukt:", err);
    }

    return NextResponse.json({ appointment, notify: notifyResult });
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
    const dateChanged = date !== current.date || timeSlot !== current.timeSlot;
    if (dateChanged) {
      const bookedCount = await db.appointment.count({
        where: { id: { not: id }, date, timeSlot, status: { not: "cancelled" } },
      });
      if (bookedCount >= MAX_BOOKINGS_PER_SLOT) {
        return NextResponse.json({ error: "Dit tijdslot is vol." }, { status: 409 });
      }
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { date, timeSlot },
      include: { service: true, model: true },
    });

    // Alleen een "je afspraak is verzet"-mail sturen als de afspraak al
    // bevestigd was en de datum/tijd ook echt gewijzigd is — anders krijgt
    // de klant een mail terwijl er in de praktijk niets veranderd is.
    let notifyResult = null;
    if (dateChanged && current.status === "confirmed") {
      try {
        notifyResult = await sendRescheduleNotifications(appointment, {
          oldDate: current.date,
          oldTimeSlot: current.timeSlot,
        });
        const emailOutcome = notifyResult?.emailResult;
        if (emailOutcome?.status === "rejected") {
          console.error("[appointments] Verzet-mail versturen is mislukt:", emailOutcome.reason);
        } else if (emailOutcome?.value?.ok === false) {
          console.error("[appointments] Resend gaf aan dat de verzet-mail niet verzonden kon worden.");
        }
      } catch (err) {
        console.error("[appointments] Verzet-berichten versturen is mislukt:", err);
      }
    }

    return NextResponse.json({ appointment, notify: notifyResult });
  }

  return NextResponse.json({ error: "Geen wijzigingen opgegeven." }, { status: 400 });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Afspraak niet gevonden." }, { status: 404 });
  }

  if (!DELETABLE_STATUSES.includes(appointment.status)) {
    return NextResponse.json(
      { error: "Alleen afgeronde of geannuleerde afspraken kunnen verwijderd worden." },
      { status: 400 }
    );
  }

  await db.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
