import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export const revalidate = 0;

export default async function OnderhoudPage() {
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
  const until = settings?.maintenanceUntil ? new Date(settings.maintenanceUntil) : null;
  const active = settings?.maintenanceMode && (!until || until.getTime() > Date.now());

  // Iemand die rechtstreeks naar /onderhoud surft terwijl de site gewoon
  // live is, sturen we door naar de homepage — dit is geen "geheime" pagina
  // die op zichzelf moet blijven bestaan.
  if (!active) {
    redirect("/");
  }

  return (
    <MaintenanceScreen
      until={until ? until.toISOString() : null}
      message={settings?.maintenanceMessage || null}
    />
  );
}
