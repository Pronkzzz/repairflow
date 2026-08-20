import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceIcon from "@/components/DeviceIcon";

export const revalidate = 0;

async function getData(slug, modelSlug) {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { priceCents: "asc" } },
    },
  });
  if (!category) return null;

  const model = await db.model.findUnique({
    where: { categoryId_slug: { categoryId: category.id, slug: modelSlug } },
  });
  if (!model) return null;

  return { category, model };
}

export default async function ModelPage({ params }) {
  const { slug, model: modelSlug } = await params;
  const data = await getData(slug, modelSlug);
  if (!data) notFound();
  const { category, model } = data;

  return (
    <>
      <SiteHeader />

      <section className="container-page py-14">
        <Link href={`/diensten/${category.slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
          ← Alle {category.name} modellen
        </Link>

        <div className="mt-4 flex items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-50 p-4">
            <DeviceIcon slug={category.slug} />
          </span>
          <div>
            <h1 className="font-display text-3xl font-800 text-ink">{model.name}</h1>
            <p className="mt-1 text-ink/60">Kies hieronder het probleem — je ziet meteen de vaste prijs.</p>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {category.services.length === 0 ? (
          <p className="text-sm text-ink/50">Binnenkort beschikbaar.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {category.services.map((s) => (
              <Link
                key={s.id}
                href={`/boeken?categorie=${category.slug}&model=${model.slug}&dienst=${s.id}`}
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
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            Je probleem staat er niet tussen? Boek een afspraak, we bekijken het samen.
          </p>
          <Link href={`/boeken?categorie=${category.slug}&model=${model.slug}`} className="btn-primary shrink-0">
            Maak een afspraak
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
