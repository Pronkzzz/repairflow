import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const NAV_ITEMS = [
  { href: "/admin/kassa", label: "Kassa", permission: "pos" },
  { href: "/admin/dashboard", label: "Afspraken", permission: "appointments" },
  { href: "/admin/producten", label: "Voorraad & producten", permission: "products" },
  { href: "/admin/diensten", label: "Diensten & prijzen", permission: "pricing" },
  { href: "/admin/toestellen", label: "Merken & modellen", permission: "models" },
  { href: "/admin/instellingen", label: "Afspraakinstellingen", permission: "settings" },
];

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-line bg-white md:block">
          <div className="flex h-16 items-center gap-2 border-b border-line px-6 font-display font-700 text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">R</span>
            Admin
          </div>
          <nav className="flex flex-col gap-1 p-4 text-sm font-medium text-ink/70">
            {NAV_ITEMS.filter((item) => hasPermission(admin, item.permission)).map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
                {item.label}
              </Link>
            ))}

            {admin?.role === "owner" && (
              <>
                <div className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink/30">
                  Eigenaar
                </div>
                <Link href="/admin/team" className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
                  Team
                </Link>
                <Link href="/admin/onderhoud" className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
                  Onderhoudsmodus
                </Link>
              </>
            )}
          </nav>
          <div className="p-4">
            {admin && <div className="mb-3 truncate text-xs text-ink/40">{admin.email}</div>}
            <LogoutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
