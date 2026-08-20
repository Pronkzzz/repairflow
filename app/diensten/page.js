import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";

export const revalidate = 0;
export const metadata = { title: "Reparaties — RepairFlow" };

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

export default async function DienstenPage() {
  const categories = await getCategoriesWithFromPrice();

  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Reparaties</p>
        <h1 className="mt-2 font-display text-3xl font-800 text-ink md:text-4xl">
          Kies je toestel
        </h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Selecteer eerst je merk of toestel — daarna zie je alle mogelijke reparaties en prijzen.
        </p>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} fromPriceCents={cat.fromPriceCents} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
