import { db } from "@/lib/db";
import PriceEditor from "@/components/admin/PriceEditor";

export const revalidate = 0;

export default async function AdminServicesPage() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { services: { orderBy: { name: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Diensten & prijzen</h1>
      <p className="mt-1 text-sm text-ink/50">
        Pas prijzen aan of schakel een reparatie tijdelijk uit — wijzigingen zijn meteen zichtbaar op de site.
      </p>

      <div className="mt-8 space-y-8">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h2 className="font-display text-lg font-700 text-ink">{cat.name}</h2>
            <div className="mt-3 overflow-hidden rounded-xl2 border border-line bg-white">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-line">
                  {cat.services.map((s) => (
                    <tr key={s.id}>
                      <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                      <td className="px-5 py-3 text-ink/50">{s.durationMin} min</td>
                      <td className="px-5 py-3">
                        <PriceEditor serviceId={s.id} priceCents={s.priceCents} active={s.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
