import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceImage from "@/components/DeviceImage";

export const revalidate = 0;

function durationText(service) {
  if (service.durationUnit === "uur") {
    return `±${service.durationMin / 60} uur`;
  }
  return `±${service.durationMin} min`;
}

function ServiceCards({ category, model, services }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <Link
          key={s.id}
          href={`/boeken?categorie=${category.slug}${model ? `&model=${model.slug}` : ""}&dienst=${s.id}`}
          className="card flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-pop"
        >
          <div>
            <span className="font-display font-700 text-ink">{s.name}</span>
            <p className="mt-1 text-xs text-ink/50">{durationText(s)}</p>
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
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true, modelId: null }, orderBy: { priceCents: "asc" } },
      sections: { orderBy: { order: "asc" } },
      models: {
        orderBy: { order: "asc" },
        include: {
          services: {
            where: { active: true },
            orderBy: { priceCents: "asc" },
          },
        },
      },
    },
  });

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
              {hasModels
                ? "Per model zie je hieronder de beschikbare reparaties en prijzen."
                : "Kies hieronder het probleem — je ziet meteen de vaste prijs."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {hasModels ? (
          <div className="space-y-12">
            {category.sections.map((section) => {
              const sectionModels = category.models.filter((m) => m.sectionId === section.id);
              if (!sectionModels.length) return null;
              return (
                <div key={section.id}>
                  <h2 className="mb-5 font-display text-2xl font-800 text-ink">{section.name}</h2>
                  <div className="space-y-10">
                    {sectionModels.map((model) => {
                      const services = model.services.length ? model.services : category.services;
                      return (
                        <section key={model.id} id={model.slug} className="scroll-mt-24">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
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
                      <div>
                        <h2 className="font-display text-xl font-800 text-ink">{model.name}</h2>
                        <p className="text-sm text-ink/50">Reparaties voor dit model</p>
                      </div>
                    </div>
                    <Link
                      href={`/diensten/${category.slug}/${model.slug}`}
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Bekijk model →
                    </Link>
                  </div>

                  {services.length ? (
                    <ServiceCards category={category} model={model} services={services} />
                  ) : (
                    <p className="text-sm text-ink/50">Binnenkort beschikbaar voor dit model.</p>
                  )}
                        </section>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {category.models.filter((m) => !m.sectionId).map((model) => {
              const services = model.services.length ? model.services : category.services;
              return (
                <section key={model.id} id={model.slug} className="scroll-mt-24">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                        <DeviceImage slug={category.slug} icon={category.icon} imageUrl={model.imageUrl || category.imageUrl} name={model.name} className="h-full w-full" iconWrapClassName="p-2" />
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-800 text-ink">{model.name}</h2>
                        <p className="text-sm text-ink/50">Reparaties voor dit model</p>
                      </div>
                    </div>
                    <Link href={`/diensten/${category.slug}/${model.slug}`} className="text-sm font-semibold text-brand-600 hover:underline">Bekijk model →</Link>
                  </div>
                  {services.length ? <ServiceCards category={category} model={model} services={services} /> : <p className="text-sm text-ink/50">Binnenkort beschikbaar voor dit model.</p>}
                </section>
              );
            })}
          </div>
        ) : category.services.length === 0 ? (
          <p className="text-sm text-ink/50">Binnenkort beschikbaar voor {category.name}.</p>
        ) : (
          <ServiceCards category={category} services={category.services} />
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
