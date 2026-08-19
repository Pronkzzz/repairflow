import Link from "next/link";
import { db } from "@/lib/db";
import HeaderNav from "@/components/HeaderNav";
import { getLang } from "@/lib/i18n";

export default async function SiteHeader({ searchParams } = {}) {
  const lang = getLang(searchParams);
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="container-page relative flex h-16 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-800 text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            R
          </span>
          RepairFlow
        </Link>

        <HeaderNav categories={categories} lang={lang} />
      </div>
    </header>
  );
}
