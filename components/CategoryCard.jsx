import Link from "next/link";
import DeviceIcon from "./DeviceIcon";

export default function CategoryCard({ category, fromPriceCents }) {
  const price = (fromPriceCents / 100).toFixed(0);
  return (
    <Link
      href={`/diensten/${category.slug}`}
      className="card group flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 p-3">
        <DeviceIcon slug={category.slug} />
      </span>
      <span className="font-display text-base font-700 text-ink">{category.name}</span>
      <span className="text-sm text-ink/60">vanaf €{price}</span>
      <span className="mt-1 text-sm font-semibold text-brand-600 group-hover:underline">
        Bekijk reparaties →
      </span>
    </Link>
  );
}
