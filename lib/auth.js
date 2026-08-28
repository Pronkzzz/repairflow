import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE_NAME = "rf_session";
const SESSION_DURATION = "8h";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET ontbreekt. Zet een lange willekeurige string in je .env bestand."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function verifyCredentials(email, password) {
  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return { id: admin.id, email: admin.email };
}

export async function createSession(admin) {
  const token = await new SignJWT({ email: admin.email, sub: admin.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 uur
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

// Haalt de volledige admin op (incl. actuele role/permissions) rechtstreeks
// uit de database — niet uit het JWT — zodat wijzigingen in permissies
// (bv. door de owner in /admin/team) meteen gelden, zonder dat de collega
// opnieuw moet inloggen. Geeft null terug als de sessie ongeldig is of het
// account intussen verwijderd werd.
export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session) return null;
  const admin = await db.admin.findUnique({ where: { id: session.id } });
  if (!admin) return null;
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions || {},
  };
}

export { COOKIE_NAME };
