import PosTerminal from "@/components/admin/PosTerminal";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminKassaPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "pos")) return <NoAccess />;

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Kassa</h1>
      <p className="mt-1 text-sm text-ink/50">
        Zoek een reparatie of product, reken af en print de bon op je eticket-printer.
      </p>

      <div className="mt-8">
        <PosTerminal />
      </div>
    </div>
  );
}
