import Link from "next/link";
import DeviceImage from "./DeviceImage";

export default function CategoryCard({ category, fromPriceCents }) {
  const price = (fromPriceCents / 100).toFixed(0);
  return (
    <Link
      href={`/diensten/${category.slug}`}
      className="card group flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop"
    >
      <span className="h-16 w-16 overflow-hidden rounded-2xl bg-brand-50">
        <DeviceImage
          slug={category.slug}
          icon={category.icon}
          imageUrl={category.imageUrl}
          name={category.name}
          className="h-full w-full"
        />
      </span>
      <span className="font-display text-base font-700 text-ink">{category.name}</span>
      <span className="text-sm text-ink/60">vanaf €{price}</span>
      <span className="mt-1 text-sm font-semibold text-brand-600 group-hover:underline">
        Bekijk reparaties →
      </span>
    </Link>
  );
}
