import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/apiAuth";
import { sanitizePermissions } from "@/lib/permissions";

export async function PATCH(request, { params }) {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const { id } = await params;
  const target = await db.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Account niet gevonden." }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "De eigenaarsrechten van dit account kunnen niet aangepast worden." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const data = {};

  if (body.permissions !== undefined) {
    data.permissions = sanitizePermissions(body.permissions);
  }

  if (body.password !== undefined && body.password !== "") {
    const password = String(body.password);
    if (password.length < 8) {
      return NextResponse.json({ error: "Wachtwoord moet minstens 8 tekens zijn." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const admin = await db.admin.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, permissions: true, createdAt: true },
  });
  return NextResponse.json({ admin });
}

export async function DELETE(request, { params }) {
  const gate = await requireOwner();
  if (gate.error) return gate.error;

  const { id } = await params;
  if (id === gate.admin.id) {
    return NextResponse.json({ error: "Je kan je eigen account niet verwijderen." }, { status: 400 });
  }

  const target = await db.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Account niet gevonden." }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Een eigenaar-account kan niet verwijderd worden." }, { status: 400 });
  }

  await db.admin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
