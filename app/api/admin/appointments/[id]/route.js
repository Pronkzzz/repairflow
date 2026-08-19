import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_STATUSES = ["pending", "confirmed", "done", "cancelled"];

export async function PATCH(request, { params }) {
  // Extra check bovenop de middleware: nooit alleen op middleware vertrouwen voor API routes
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Ongeldige status." }, { status: 400 });
  }

  const appointment = await db.appointment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ appointment });
}
