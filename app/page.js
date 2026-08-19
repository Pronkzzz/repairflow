import Link from "next/link";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";
import HeroDeviceCollage from "@/components/HeroDeviceCollage";
import { getLang, getDict } from "@/lib/i18n";

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

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const lang = getLang(sp);
  const dict = getDict(lang);
  const langQS = lang === "en" ? "?lang=en" : "";
  const categories = await getCategoriesWithFromPrice();

  return (
    <>
      <SiteHeader searchParams={sp} />

      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
            {dict.hero.badge}
          </span>
          <h1 className="mt-5 font-display text-4xl font-800 leading-tight text-ink md:text-5xl">
            {dict.hero.title1}<br />
            <span className="text-brand-500">{dict.hero.title2}</span> {dict.hero.title3}
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/60">{dict.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={`/boeken${langQS}`} className="btn-primary">
              {dict.hero.cta1}
            </Link>
            <Link href="#prijzen" className="btn-secondary">
              {dict.hero.cta2}
            </Link>
          </div>
        </div>
        <HeroDeviceCollage categories={categories} />
      </section>

      {/* Categories */}
      <section id="diensten" className="container-page py-16">
        <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">{dict.sections.watTitle}</h2>
        <p className="mt-2 text-ink/60">{dict.sections.watSub}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} fromPriceCents={cat.fromPriceCents} langQS={langQS} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-het-werkt" className="bg-white py-20">
        <div className="container-page">
          <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">{dict.sections.hoeTitle}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {(lang === "en"
              ? [
                  { title: "Pick your repair", desc: "Select your device and the issue — you'll see the price right away." },
                  { title: "Pick a time slot", desc: "Book a moment that suits you, today or later this week." },
                  { title: "Bring in your device", desc: "We fix it while you wait, or you pick it up later." },
                ]
              : [
                  { title: "Kies je reparatie", desc: "Selecteer je toestel en het probleem — je ziet meteen de prijs." },
                  { title: "Kies een tijdslot", desc: "Boek een moment dat jou uitkomt, vandaag of later deze week." },
                  { title: "Breng het toestel binnen", desc: "Wij herstellen het terwijl je wacht of later ophaalt." },
                ]
            ).map((step, i) => (
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
        <h2 className="font-display text-2xl font-700 text-ink md:text-3xl">{dict.sections.prijzenTitle}</h2>
        <div className="mt-8 overflow-hidden rounded-xl2 border border-line">
          <PricingTable />
        </div>
      </section>

      <SiteFooter lang={lang} />
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
