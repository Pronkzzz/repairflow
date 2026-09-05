import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

// Genereert automatisch /sitemap.xml, inclusief elk merk en elk model dat
// actief staat — nieuwe merken/modellen die je via het admin panel toevoegt
// verschijnen hier vanzelf bij, zonder dat je iets moet aanpassen.
export default async function sitemap() {
  const categories = await db.category.findMany({
    where: { active: true },
    include: { models: { where: { active: true } } },
  });

  const staticRoutes = ["", "/diensten", "/prijzen", "/boeken", "/contact", "/hoe-het-werkt"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.7,
    })
  );

  const categoryRoutes = categories.flatMap((cat) => [
    {
      url: `${SITE_URL}/diensten/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/prijzen/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...cat.models.map((model) => ({
      url: `${SITE_URL}/prijzen/${cat.slug}/${model.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ]);

  return [...staticRoutes, ...categoryRoutes];
}
