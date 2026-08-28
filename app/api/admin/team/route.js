import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/apiAuth";
import { sanitizePermissions } from "@/lib/permissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const admins = await db.admin.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, role: true, permissions: true, createdAt: true },
  });
  return NextResponse.json({ admins, currentAdminId: gate.admin.id });
}

export async function POST(request) {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord moet minstens 8 tekens zijn." }, { status: 400 });
  }

  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Er bestaat al een account met dit e-mailadres." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const permissions = sanitizePermissions(body.permissions);

  // Bewust altijd "staff" — een nieuw account krijgt nooit automatisch
  // volledige eigenaarsrechten via deze route.
  const admin = await db.admin.create({
    data: { email, passwordHash, role: "staff", permissions },
    select: { id: true, email: true, role: true, permissions: true, createdAt: true },
  });

  return NextResponse.json({ admin }, { status: 201 });
}
