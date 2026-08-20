import { db } from "@/lib/db";
import PriceEditor from "@/components/admin/PriceEditor";
import ServiceManager from "@/components/admin/ServiceManager";

export const revalidate = 0;

function DurationText({ service }) {
  return service.durationUnit === "uur"
    ? `${service.durationMin / 60} uur`
    : `${service.durationMin} min`;
}

function ServiceTable({ services }) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-white">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-line">
          {services.map((s) => (
            <tr key={s.id}>
              <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
              <td className="px-5 py-3 text-ink/50">{DurationText({ service: s })}</td>
              <td className="px-5 py-3">
                <PriceEditor
                  serviceId={s.id}
                  priceCents={s.priceCents}
                  durationMin={s.durationMin}
                  durationUnit={s.durationUnit}
                  active={s.active}
                  featured={s.featured}
                  featuredOrder={s.featuredOrder}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminServicesPage() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: {
      models: { orderBy: { order: "asc" } },
      services: { orderBy: { name: "asc" } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Diensten & prijzen</h1>
      <p className="mt-1 text-sm text-ink/50">
        Maak algemene reparaties of reparaties voor één specifiek model. Je kunt hier ook de prijs,
        duur en eenheid (min/uur) aanpassen.
      </p>

      <div className="mt-8 space-y-10">
        {categories.map((cat) => {
          const general = cat.services.filter((s) => !s.modelId);

          return (
            <div key={cat.id} className="card p-6">
              <h2 className="font-display text-lg font-700 text-ink">{cat.name}</h2>

              <div className="mt-5 space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ink/70">Algemeen — alle modellen</h3>
                  {general.length ? (
                    <ServiceTable services={general} />
                  ) : (
                    <p className="text-sm text-ink/40">Geen algemene reparaties.</p>
                  )}
                </div>

                {cat.models.map((model) => {
                  const modelServices = cat.services.filter((s) => s.modelId === model.id);
                  return (
                    <div key={model.id}>
                      <h3 className="mb-2 text-sm font-semibold text-ink/70">{model.name}</h3>
                      {modelServices.length ? (
                        <ServiceTable services={modelServices} />
                      ) : (
                        <p className="text-sm text-ink/40">Nog geen model-specifieke reparaties.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <ServiceManager categoryId={cat.id} models={cat.models} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
