import Link from "next/link";

const NAV = [
  { href: "/diensten", label: "Diensten" },
  { href: "/hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/prijzen", label: "Prijzen" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-800 text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            R
          </span>
          RepairFlow
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/boeken" className="btn-primary !px-5 !py-2.5 text-sm">
          Maak een afspraak
        </Link>
      </div>
    </header>
  );
}
