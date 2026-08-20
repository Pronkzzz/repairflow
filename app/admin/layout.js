import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-line bg-white md:block">
          <div className="flex h-16 items-center gap-2 border-b border-line px-6 font-display font-700 text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">R</span>
            Admin
          </div>
          <nav className="flex flex-col gap-1 p-4 text-sm font-medium text-ink/70">
            <Link href="/admin/dashboard" className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
              Afspraken
            </Link>
            <Link href="/admin/diensten" className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
              Diensten & prijzen
            </Link>
            <Link href="/admin/toestellen" className="rounded-lg px-3 py-2 hover:bg-paper hover:text-ink">
              Merken & modellen
            </Link>
          </nav>
          <div className="p-4">
            <LogoutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
