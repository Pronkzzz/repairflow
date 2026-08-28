import TeamManager from "@/components/admin/TeamManager";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";

export const revalidate = 0;

export default async function AdminTeamPage() {
  const admin = await getCurrentAdmin();
  if (admin?.role !== "owner") return <NoAccess />;
  return <TeamManager />;
}
