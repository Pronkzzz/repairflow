import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DeviceImage from "@/components/DeviceImage";

export const revalidate = 0;

function durationText(service) {
  return service.durationUnit === "uur"
    ? `±${service.durationMin / 60} uur`
    : `±${service.durationMin} min`;
}

export default async function PriceModelPage({ params }) {
  const { slug, model: modelSlug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      services: {
        where: { active: true, modelId: null },
        orderBy: { priceCents: "asc" },
      },
    },
  });
  if (!category) notFound();

  const model = await db.model.findUnique({
    where: { categoryId_slug: { categoryId: category.id, slug: modelSlug }, active: true },
    include: {
      services: {
        where: { active: true },
        orderBy: { priceCents: "asc" },
      },
    },
  });
  if (!model) notFound();

  const services = model.services.length ? model.services : category.services;

  return (
    <>
      <SiteHeader />

      <section className="container-page py-14">
        <Link href={`/prijzen/${category.slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
          ← Alle {category.name} modellen
        </Link>

        <div className="mt-4 flex items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
            <DeviceImage
              slug={category.slug}
              icon={category.icon}
              imageUrl={model.imageUrl || category.imageUrl}
              name={model.name}
              className="h-full w-full"
              iconWrapClassName="p-4"
            />
          </span>
          <div>
            <p className="section-kicker">Prijzen</p>
            <h1 className="mt-1 font-display text-3xl font-800 text-ink">{model.name}</h1>
            <p className="mt-1 text-ink/60">Alle reparaties en prijzen voor dit model.</p>
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="overflow-hidden rounded-xl2 border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink/50">
              <tr>
                <th className="px-6 py-3 font-medium">Reparatie</th>
                <th className="px-6 py-3 font-medium">Duur</th>
                <th className="px-6 py-3 font-medium">Prijs</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                  <td className="px-6 py-4 text-ink/50">{durationText(s)}</td>
                  <td className="px-6 py-4 font-semibold text-brand-600">
                    €{(s.priceCents / 100).toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/boeken?categorie=${category.slug}&model=${model.slug}&dienst=${s.id}`}
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Boek →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!services.length && (
          <p className="mt-6 text-sm text-ink/50">Nog geen reparaties voor dit model.</p>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
