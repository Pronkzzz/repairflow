import { db } from "@/lib/db";
import ProductManager from "@/components/admin/ProductManager";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "products")) return <NoAccess />;

  const products = await db.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Voorraad & producten</h1>
      <p className="mt-1 text-sm text-ink/50">
        Beheer losse producten (schermen, hoesjes, kabels, ...) die je aan de balie verkoopt, met
        prijs en actuele voorraad.
      </p>

      <div className="mt-8">
        <ProductManager initialProducts={products} />
      </div>
    </div>
  );
}
