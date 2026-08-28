import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requirePermission } from "@/lib/apiAuth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/webp", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml"];

export async function POST(request) {
  const gate = await requirePermission("models");
  if (gate.error) return gate.error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Bestandsopslag is nog niet ingesteld. Koppel een Vercel Blob store aan dit project." },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Geen bestand ontvangen." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Alleen afbeeldingen (webp, png, jpg, gif, svg) zijn toegestaan." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Bestand is te groot (max 5MB)." }, { status: 400 });
  }

  const ext = file.name?.split(".").pop() || "webp";
  const filename = `devices/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
