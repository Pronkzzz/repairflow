import Link from "next/link";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";
import DeviceStatusVisual from "@/components/DeviceStatusVisual";

export const revalidate = 0;

async function getCategoriesWithFromPrice() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { services: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 } },
  });
  return categories.map((c) => ({
    ...c,
    fromPriceCents: c.services[0]?.priceCents ?? 0,
  }));
}

export default async function HomePage() {
  const categories = await getCategoriesWithFromPrice();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            ★ 4,9 op basis van klantreviews
          </span>
          <h1 className="mt-5 font-display text-4xl font-800 leading-tight text-ink md:text-5xl">
            Toestel stuk?<br />
            <span className="text-brand-500">Boek in 2 minuten</span> hersteld.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/60">
            Kies je toestel, kies het probleem en boek meteen een tijdslot.
            Transparante prijzen, meestal klaar binnen het uur.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/boeken" className="btn-primary">
              Maak een afspraak
            </Link>
            <Link href="#prijzen" className="btn-secondary">
              Bekijk prijzen
            </Link>
          </div>
        </div>
        <DeviceStatusVisual />
      </section>

      {/* Categories */}
      <section id="diensten" className="container-page py-16">
        <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">
          Wat moet er gerepareerd worden?
        </h2>
        <p className="mt-2 text-ink/60">Kies je toestel om alle reparaties en prijzen te zien.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} fromPriceCents={cat.fromPriceCents} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-het-werkt" className="bg-white py-20">
        <div className="container-page">
          <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">Hoe het werkt</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { title: "Kies je reparatie", desc: "Selecteer je toestel en het probleem — je ziet meteen de prijs." },
              { title: "Kies een tijdslot", desc: "Boek een moment dat jou uitkomt, vandaag of later deze week." },
              { title: "Breng het toestel binnen", desc: "Wij herstellen het terwijl je wacht of later ophaalt." },
            ].map((step, i) => (
              <div key={step.title} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-display font-700 text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-700 text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="prijzen" className="container-page py-20">
        <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">Populaire reparaties</h2>
        <div className="mt-8 overflow-hidden rounded-xl2 border border-line">
          <PricingTable />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

async function PricingTable() {
  const allServices = await db.service.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { priceCents: "asc" },
    take: 8,
  });

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-paper text-ink/50">
        <tr>
          <th className="px-6 py-3 font-medium">Toestel</th>
          <th className="px-6 py-3 font-medium">Reparatie</th>
          <th className="px-6 py-3 font-medium">Prijs</th>
          <th className="px-6 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-line bg-white">
        {allServices.map((s) => (
          <tr key={s.id}>
            <td className="px-6 py-4 font-medium text-ink">{s.category.name}</td>
            <td className="px-6 py-4 text-ink/70">{s.name}</td>
            <td className="px-6 py-4 font-semibold text-brand-600">
              €{(s.priceCents / 100).toFixed(0)}
            </td>
            <td className="px-6 py-4 text-right">
              <Link
                href={`/boeken?categorie=${s.category.slug}&dienst=${s.id}`}
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                Boek →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
