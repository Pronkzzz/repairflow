import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DEFAULT_HOURS, normalizeHours } from "@/lib/slots";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const setting = await db.businessHours.findUnique({ where: { id: "default" } });
  return NextResponse.json({ hours: normalizeHours(setting?.hours || DEFAULT_HOURS) });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const hours = normalizeHours(body.hours || {});
  for (const value of Object.values(hours)) {
    if (value.enabled && value.start >= value.end) {
      return NextResponse.json({ error: "De begintijd moet vóór de eindtijd liggen." }, { status: 400 });
    }
  }
  const setting = await db.businessHours.upsert({
    where: { id: "default" },
    update: { hours },
    create: { id: "default", hours },
  });
  return NextResponse.json({ hours: setting.hours });
}
