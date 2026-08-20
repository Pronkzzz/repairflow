import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceImage from "@/components/DeviceImage";

export const revalidate = 0;

async function getCategory(slug) {
  return db.category.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { priceCents: "asc" } },
      models: { orderBy: { order: "asc" } },
    },
  });
}

function ServiceList({ category, modelSlug }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {category.services.map((s) => (
        <Link
          key={s.id}
          href={`/boeken?categorie=${category.slug}${modelSlug ? `&model=${modelSlug}` : ""}&dienst=${s.id}`}
          className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-pop"
        >
          <div>
            <span className="font-display font-700 text-ink">{s.name}</span>
            <p className="mt-1 text-xs text-ink/50">±{s.durationMin} min</p>
          </div>
          <span className="shrink-0 font-display text-lg font-800 text-brand-600">
            €{(s.priceCents / 100).toFixed(0)}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const hasModels = category.models.length > 0;

  return (
    <>
      <SiteHeader />

      <section className="container-page py-14">
        <Link href="/diensten" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Alle merken
        </Link>

        <div className="mt-4 flex items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
            <DeviceImage
              slug={category.slug}
              icon={category.icon}
              imageUrl={category.imageUrl}
              name={category.name}
              className="h-full w-full"
              iconWrapClassName="p-4"
            />
          </span>
          <div>
            <h1 className="font-display text-3xl font-800 text-ink">{category.name} reparaties</h1>
            <p className="mt-1 text-ink/60">
              {hasModels ? "Kies eerst je model." : "Kies hieronder het probleem — je ziet meteen de vaste prijs."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {hasModels ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.models.map((m) => (
              <Link
                key={m.id}
                href={`/diensten/${category.slug}/${m.slug}`}
                className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-pop"
              >
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  <DeviceImage
                    slug={category.slug}
                    icon={category.icon}
                    imageUrl={m.imageUrl || category.imageUrl}
                    name={m.name}
                    className="h-full w-full"
                    iconWrapClassName="p-2"
                  />
                </span>
                <span className="flex-1 font-display font-700 text-ink">{m.name}</span>
                <span className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        ) : category.services.length === 0 ? (
          <p className="text-sm text-ink/50">Binnenkort beschikbaar voor {category.name}.</p>
        ) : (
          <ServiceList category={category} />
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            Je model of probleem staat er niet tussen? Boek een afspraak, we bekijken het samen.
          </p>
          <Link href={`/boeken?categorie=${category.slug}`} className="btn-primary shrink-0">
            Maak een afspraak
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
