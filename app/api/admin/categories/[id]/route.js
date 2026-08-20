import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data = {};

  if (body.imageUrl !== undefined) {
    data.imageUrl = body.imageUrl ? String(body.imageUrl).trim().slice(0, 1000) : null;
  }
  if (body.icon !== undefined) {
    data.icon = body.icon ? String(body.icon).trim().slice(0, 60) : null;
  }

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
}
