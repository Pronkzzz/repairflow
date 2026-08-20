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

const TRUST_ITEMS = [
  { label: "Klantenscore", value: "4,9 / 5" },
  { label: "Garantie", value: "tot 1 jaar" },
  { label: "Meestal klaar", value: "binnen het uur" },
  { label: "Reactietijd", value: "zelfde dag" },
];

export default async function HomePage() {
  const categories = await getCategoriesWithFromPrice();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="eyebrow">★ 4,9 op basis van klantreviews</span>
          <h1 className="mt-5 font-display text-4xl font-800 leading-[1.05] text-ink md:text-5xl">
            Toestel stuk?<br />
            <span className="text-brand-600">Boek in 2 minuten</span> hersteld.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/60">
            Kies je toestel, kies het probleem en boek meteen een tijdslot.
            Transparante prijzen, meestal klaar binnen het uur.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/boeken" className="btn-primary">
              Maak een afspraak
            </Link>
            <Link href="/prijzen" className="btn-secondary">
              Bekijk prijzen
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-8 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label}>
                <dt className="text-xs uppercase tracking-wide text-ink/40">{item.label}</dt>
                <dd className="mt-1 font-display text-base font-700 text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <DeviceStatusVisual />
      </section>

      {/* Categories */}
      <section id="diensten" className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Reparaties</p>
            <h2 className="mt-2 font-display text-2xl font-800 text-ink md:text-3xl">
              Welk merk moet er gerepareerd worden?
            </h2>
            <p className="mt-2 text-ink/60">Kies eerst je merk of toestel — daarna zie je alle reparaties en prijzen.</p>
          </div>
          <Link href="/diensten" className="text-sm font-semibold text-brand-600 hover:underline">
            Alle diensten bekijken →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} fromPriceCents={cat.fromPriceCents} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-het-werkt" className="bg-white py-20">
        <div className="container-page">
          <p className="section-kicker">Werkwijze</p>
          <h2 className="mt-2 font-display text-2xl font-700 text-ink md:text-3xl">Hoe het werkt</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { title: "Kies je reparatie", desc: "Selecteer je toestel en het probleem — je ziet meteen de prijs." },
              { title: "Kies een tijdslot", desc: "Boek een moment dat jou uitkomt, vandaag of later deze week." },
              { title: "Breng het toestel binnen", desc: "Wij herstellen het terwijl je wacht of later ophaalt." },
            ].map((step, i) => (
              <div key={step.title} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display font-700 text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-700 text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/hoe-het-werkt" className="mt-8 inline-block text-sm font-semibold text-brand-600 hover:underline">
            Meer over onze werkwijze →
          </Link>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="prijzen" className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Prijzen</p>
            <h2 className="mt-2 font-display text-2xl font-700 text-ink md:text-3xl">Populaire reparaties</h2>
          </div>
          <Link href="/prijzen" className="text-sm font-semibold text-brand-600 hover:underline">
            Volledige prijslijst →
          </Link>
        </div>
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
