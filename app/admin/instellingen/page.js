import BusinessHoursManager from "@/components/admin/BusinessHoursManager";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "settings")) return <NoAccess />;
  return <BusinessHoursManager />;
}
