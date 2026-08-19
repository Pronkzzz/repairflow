import Link from "next/link";

const ICONS = {
  iphone: "📱",
  samsung: "📱",
  macbook: "💻",
  ipad: "🔲",
};

export default function CategoryCard({ category, fromPriceCents }) {
  const price = (fromPriceCents / 100).toFixed(0);
  return (
    <Link
      href={`/boeken?categorie=${category.slug}`}
      className="card group flex flex-col gap-3 p-6 transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper text-2xl">
        {ICONS[category.slug] || "🔧"}
      </span>
      <span className="font-display text-lg font-700 text-ink">{category.name}</span>
      <span className="text-sm text-ink/60">vanaf €{price}</span>
      <span className="mt-2 text-sm font-semibold text-brand-600 group-hover:underline">
        Bekijk reparaties →
      </span>
    </Link>
  );
}
