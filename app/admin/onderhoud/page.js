import MaintenanceManager from "@/components/admin/MaintenanceManager";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";

export const revalidate = 0;

export default async function AdminMaintenancePage() {
  const admin = await getCurrentAdmin();
  if (admin?.role !== "owner") return <NoAccess />;
  return <MaintenanceManager />;
}
