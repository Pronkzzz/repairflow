import Link from "next/link";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CategoryCard from "@/components/CategoryCard";

export const revalidate = 0;
export const metadata = { title: "Prijzen — RepairFlow" };

async function getCategories() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      services: {
        where: { active: true },
        orderBy: { priceCents: "asc" },
        take: 1,
      },
    },
  });

  return categories.map((category) => ({
    ...category,
    fromPriceCents: category.services[0]?.priceCents ?? 0,
  }));
}

export default async function PrijzenPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Prijzen</p>
        <h1 className="mt-2 font-display text-3xl font-700 text-ink md:text-4xl">
          Kies eerst je merk
        </h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Kies daarna je model. Je krijgt vervolgens alleen de reparaties en prijzen voor dat specifieke toestel te zien.
        </p>
      </section>

      <section className="container-page pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              fromPriceCents={cat.fromPriceCents}
              hrefBase="/prijzen"
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl2 border border-line bg-white p-6">
          <p className="text-sm text-ink/60">
            Je toestel of probleem staat er niet tussen? Boek een afspraak, we bekijken het samen.
          </p>
          <Link href="/boeken" className="btn-primary shrink-0">
            Maak een afspraak
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
