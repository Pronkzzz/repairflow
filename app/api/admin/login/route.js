import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  // Streng: max 8 pogingen per 15 minuten per IP, tegen brute-force
  const { allowed } = rateLimit(`admin-login:${ip}`, { windowMs: 15 * 60_000, max: 8 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Te veel inlogpogingen. Probeer later opnieuw." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Vul e-mail en wachtwoord in." }, { status: 400 });
  }

  const admin = await verifyCredentials(email.trim().toLowerCase(), password);
  if (!admin) {
    // Bewust generieke foutmelding: niet verklappen of het e-mailadres wel/niet bestaat
    return NextResponse.json({ error: "Ongeldige inloggegevens." }, { status: 401 });
  }

  await createSession(admin);
  return NextResponse.json({ ok: true });
}
