import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceImage from "@/components/DeviceImage";

export const revalidate = 0;

export default async function PriceBrandPage({ params }) {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug },
    include: { models: { orderBy: { order: "asc" } } },
  });

  if (!category) notFound();

  return (
    <>
      <SiteHeader />

      <section className="container-page py-14">
        <Link href="/prijzen" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Alle merken
        </Link>
        <div className="mt-4">
          <p className="section-kicker">Prijzen</p>
          <h1 className="mt-2 font-display text-3xl font-800 text-ink">
            Kies je {category.name} model
          </h1>
          <p className="mt-2 text-ink/60">
            Selecteer een model om de juiste prijzen te bekijken.
          </p>
        </div>
      </section>

      <section className="container-page pb-24">
        {category.models.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.models.map((model) => (
              <Link
                key={model.id}
                href={`/prijzen/${category.slug}/${model.slug}`}
                className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-pop"
              >
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  <DeviceImage
                    slug={category.slug}
                    icon={category.icon}
                    imageUrl={model.imageUrl || category.imageUrl}
                    name={model.name}
                    className="h-full w-full"
                    iconWrapClassName="p-2"
                  />
                </span>
                <span className="flex-1 font-display font-700 text-ink">{model.name}</span>
                <span className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/50">Er zijn nog geen modellen toegevoegd.</p>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
