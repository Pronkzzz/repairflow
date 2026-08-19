import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="contact" className="mt-24 border-t border-line bg-ink text-white">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">R</span>
            RepairFlow
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Snelle, transparante reparaties voor je smartphone, tablet en laptop.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Diensten</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><Link href="/boeken" className="hover:text-white">Scherm herstellen</Link></li>
            <li><Link href="/boeken" className="hover:text-white">Batterij vervangen</Link></li>
            <li><Link href="/boeken" className="hover:text-white">Waterschade</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Bedrijf</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><Link href="/#prijzen" className="hover:text-white">Prijzen</Link></li>
            <li><Link href="/admin/login" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>info@repairflow.be</li>
            <li>+32 400 00 00 00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} RepairFlow
      </div>
    </footer>
  );
}
