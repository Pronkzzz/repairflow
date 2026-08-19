import Link from "next/link";
import { db } from "@/lib/db";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 0;
export const metadata = { title: "Prijzen — RepairFlow" };

async function getAllServices() {
  return db.service.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ category: { order: "asc" } }, { priceCents: "asc" }],
  });
}

export default async function PrijzenPage() {
  const services = await getAllServices();

  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Prijzen</p>
        <h1 className="mt-2 font-display text-3xl font-700 text-ink md:text-4xl">
          Duidelijke prijzen, geen verrassingen
        </h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Onderstaande prijzen zijn inclusief onderdelen en arbeid. Twijfel je over het
          probleem? Boek gewoon een tijdslot, wij stellen de juiste diagnose.
        </p>
      </section>

      <section className="container-page pb-24">
        <div className="overflow-hidden rounded-xl2 border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink/50">
              <tr>
                <th className="px-6 py-3 font-medium">Toestel</th>
                <th className="px-6 py-3 font-medium">Reparatie</th>
                <th className="px-6 py-3 font-medium">Duur</th>
                <th className="px-6 py-3 font-medium">Prijs</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium text-ink">{s.category.name}</td>
                  <td className="px-6 py-4 text-ink/70">{s.name}</td>
                  <td className="px-6 py-4 text-ink/50">±{s.durationMin} min</td>
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
