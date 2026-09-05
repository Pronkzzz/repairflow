import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceImage from "@/components/DeviceImage";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  const title = `${category.name} reparatie`;
  const description = `${category.name} kapot? Bekijk alle mogelijke reparaties, kies je model en boek meteen online een afspraak bij RepairFlow.`;
  return {
    title,
    description,
    alternates: { canonical: `/diensten/${category.slug}` },
    openGraph: { title, description, url: `/diensten/${category.slug}` },
  };
}

function ModelCard({ category, model }) {
  return (
    <Link
      href={`/diensten/${category.slug}/${model.slug}`}
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
  );
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug, active: true },
    include: {
      services: {
        where: { active: true, modelId: null },
        orderBy: { priceCents: "asc" },
      },
      sections: { orderBy: { order: "asc" } },
      models: { where: { active: true }, orderBy: { order: "asc" } },
    },
  });

  if (!category) notFound();

  const hasModels = category.models.length > 0;
  const ungroupedModels = category.models.filter((model) => !model.sectionId);

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
              {hasModels
                ? "Kies eerst je model. Daarna zie je de beschikbare reparaties en prijzen."
                : "Kies hieronder het probleem — je ziet meteen de vaste prijs."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {hasModels ? (
          <div className="space-y-10">
            {category.sections.map((section) => {
              const sectionModels = category.models.filter((model) => model.sectionId === section.id);
              if (!sectionModels.length) return null;

              return (
                <section key={section.id}>
                  <h2 className="mb-4 font-display text-2xl font-800 text-ink">{section.name}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sectionModels.map((model) => (
                      <ModelCard key={model.id} category={category} model={model} />
                    ))}
                  </div>
                </section>
              );
            })}

            {ungroupedModels.length > 0 && (
              <section>
                {category.sections.length > 0 && (
                  <h2 className="mb-4 font-display text-2xl font-800 text-ink">Overige modellen</h2>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ungroupedModels.map((model) => (
                    <ModelCard key={model.id} category={category} model={model} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : category.services.length === 0 ? (
          <p className="text-sm text-ink/50">Binnenkort beschikbaar voor {category.name}.</p>
        ) : (
          <p className="text-sm text-ink/50">Er zijn voor dit merk nog geen modellen toegevoegd.</p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            Je model staat er niet tussen? Voeg het model toe via het beheer of neem contact met ons op.
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
