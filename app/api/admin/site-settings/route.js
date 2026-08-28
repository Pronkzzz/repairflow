import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/apiAuth";

export async function GET() {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({
    settings: {
      maintenanceMode: settings?.maintenanceMode || false,
      maintenanceUntil: settings?.maintenanceUntil ? settings.maintenanceUntil.toISOString() : null,
      maintenanceMessage: settings?.maintenanceMessage || "",
    },
  });
}

export async function PUT(request) {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const maintenanceMode = Boolean(body.maintenanceMode);

  let maintenanceUntil = null;
  if (body.maintenanceUntil) {
    const parsed = new Date(body.maintenanceUntil);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Ongeldige datum/tijd." }, { status: 400 });
    }
    maintenanceUntil = parsed;
  }

  const maintenanceMessage = body.maintenanceMessage ? String(body.maintenanceMessage).trim().slice(0, 300) : null;

  const settings = await db.siteSettings.upsert({
    where: { id: "default" },
    update: { maintenanceMode, maintenanceUntil, maintenanceMessage },
    create: { id: "default", maintenanceMode, maintenanceUntil, maintenanceMessage },
  });

  return NextResponse.json({
    settings: {
      maintenanceMode: settings.maintenanceMode,
      maintenanceUntil: settings.maintenanceUntil ? settings.maintenanceUntil.toISOString() : null,
      maintenanceMessage: settings.maintenanceMessage || "",
    },
  });
}
