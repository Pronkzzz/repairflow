import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

// In Next.js 16 vervangt proxy.js het oude middleware.js. Belangrijk verschil:
// proxy draait op de Node.js-runtime (niet Edge), dus we kunnen hier gewoon
// Prisma gebruiken om de onderhoudsmodus te checken.

const COOKIE_NAME = "rf_session";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // --- Admin-gedeelte: altijd bereikbaar, ook tijdens onderhoud ---
  // (anders kan niemand meer inloggen om de site terug online te zetten).
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // De onderhoudspagina zelf moet altijd bereikbaar blijven, anders
  // ontstaat er een oneindige rewrite-lus.
  if (pathname === "/onderhoud") {
    return NextResponse.next();
  }

  // --- Onderhoudsmodus: publieke pagina's tonen dan het onderhoudsscherm ---
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
    const until = settings?.maintenanceUntil ? new Date(settings.maintenanceUntil) : null;
    const active = settings?.maintenanceMode && (!until || until.getTime() > Date.now());
    if (active) {
      return NextResponse.rewrite(new URL("/onderhoud", request.url));
    }
  } catch (err) {
    // Als de database even niet bereikbaar is, laten we de site gewoon door —
    // beter een werkende site dan dat iedereen een foutpagina ziet.
    console.error("[proxy] Kon onderhoudsstatus niet controleren:", err);
  }

  return NextResponse.next();
}

// Draait voor alle pagina's, behalve statische assets en API-routes (die
// controleren hun eigen auth al zelf, zie lib/apiAuth.js).
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)"],
};
