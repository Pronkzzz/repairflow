import Link from "next/link";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 0;
export const metadata = { title: "Diensten — RepairFlow" };

const ICONS = {
  iphone: "📱",
  samsung: "📱",
  macbook: "💻",
  ipad: "🔲",
};

async function getCategories() {
  return db.category.findMany({
    orderBy: { order: "asc" },
    include: { services: { where: { active: true }, orderBy: { priceCents: "asc" } } },
  });
}

export default async function DienstenPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Diensten</p>
        <h1 className="mt-2 font-display text-3xl font-700 text-ink md:text-4xl">
          Alle reparaties op een rij
        </h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Kies je toestel hieronder en zie meteen alle mogelijke reparaties met prijs.
        </p>
      </section>

      <section className="container-page space-y-14 pb-24">
        {categories.map((cat) => (
          <div key={cat.id} id={cat.slug}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-card">
                {ICONS[cat.slug] || "🔧"}
              </span>
              <h2 className="font-display text-2xl font-700 text-ink">{cat.name}</h2>
            </div>

            {cat.services.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">Binnenkort beschikbaar.</p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-xl2 border border-line bg-white">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-line">
                    {cat.services.map((s) => (
                      <tr key={s.id}>
                        <td className="px-6 py-4 font-medium text-ink">{s.name}</td>
                        <td className="px-6 py-4 text-ink/50">±{s.durationMin} min</td>
                        <td className="px-6 py-4 text-right font-semibold text-brand-600">
                          €{(s.priceCents / 100).toFixed(0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/boeken?categorie=${cat.slug}&dienst=${s.id}`}
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
            )}
          </div>
        ))}
      </section>

      <SiteFooter />
    </>
  );
}
