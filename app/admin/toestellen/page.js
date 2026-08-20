import { db } from "@/lib/db";
import CategoryImageEditor from "@/components/admin/CategoryImageEditor";
import ModelManager from "@/components/admin/ModelManager";

export const revalidate = 0;

export default async function AdminDevicesPage() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { models: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Merken & modellen</h1>
      <p className="mt-1 text-sm text-ink/50">
        Voeg per merk modellen toe (bv. iPhone 13, iPhone SE) en stel een eigen afbeelding of icoon in.
        Prijzen pas je aan bij "Diensten & prijzen".
      </p>

      <div className="mt-8 space-y-10">
        {categories.map((cat) => (
          <div key={cat.id} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-lg font-700 text-ink">{cat.name}</h2>
            </div>

            <CategoryImageEditor category={cat} />

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="text-sm font-semibold text-ink/70">Modellen</h3>
              <ModelManager categoryId={cat.id} models={cat.models} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
