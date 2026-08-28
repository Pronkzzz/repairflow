import { NextResponse } from "next/server";
import { getCurrentAdmin } from "./auth";
import { hasPermission } from "./permissions";

// Gebruik in API-routes: nooit alleen op de UI (verborgen tabs) vertrouwen
// om toegang te beperken — elke route checkt dit ook zelf server-side.
//
//   const gate = await requirePermission("pricing");
//   if (gate.error) return gate.error;
//   const admin = gate.admin;

export async function requirePermission(permissionKey) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }) };
  }
  if (!hasPermission(admin, permissionKey)) {
    return { error: NextResponse.json({ error: "Geen toegang tot dit onderdeel." }, { status: 403 }) };
  }
  return { admin };
}

export async function requireOwner() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }) };
  }
  if (admin.role !== "owner") {
    return { error: NextResponse.json({ error: "Alleen de eigenaar kan dit doen." }, { status: 403 }) };
  }
  return { admin };
}
