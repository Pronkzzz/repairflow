import Link from "next/link";
import { db } from "@/lib/db";
import StatusSelect from "@/components/admin/StatusSelect";
import AppointmentEditor from "@/components/admin/AppointmentEditor";
import DeleteAppointmentButton from "@/components/admin/DeleteAppointmentButton";
import NoAccess from "@/components/admin/NoAccess";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const revalidate = 0;

const STATUS_TABS = [
  { value: "", label: "Alle" },
  { value: "pending", label: "In afwachting" },
  { value: "confirmed", label: "Bevestigd" },
  { value: "done", label: "Afgerond" },
  { value: "cancelled", label: "Geannuleerd" },
];

export default async function AdminDashboard({ searchParams }) {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "appointments")) return <NoAccess />;

  // In Next.js 16 is searchParams een Promise en moet die eerst awaited worden,
  // anders is statusFilter altijd leeg en lijkt de filter niet te werken.
  const params = await searchParams;
  const statusFilter = params?.status || "";

  const appointments = await db.appointment.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    include: { service: { include: { category: true } }, model: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  const todayCount = appointments.filter(
    (a) => a.date === new Date().toISOString().slice(0, 10)
  ).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-700 text-ink">Afspraken</h1>
        <div className="flex gap-3 text-sm">
          <StatCard label="Vandaag" value={todayCount} />
          <StatCard label="In afwachting" value={pendingCount} />
          <StatCard label="Totaal" value={appointments.length} />
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/dashboard?status=${tab.value}` : "/admin/dashboard"}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              statusFilter === tab.value
                ? "bg-ink text-white"
                : "bg-white text-ink/60 hover:bg-line/60"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Klant</th>
              <th className="px-5 py-3 font-medium">Model</th>
              <th className="px-5 py-3 font-medium">Reparatie</th>
              <th className="px-5 py-3 font-medium">Datum & tijd</th>
              <th className="px-5 py-3 font-medium">Prijs</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink/40">
                  Geen afspraken gevonden.
                </td>
              </tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-4">
                  <div className="font-medium text-ink">{a.customerName}</div>
                  <div className="text-xs text-ink/50">{a.email} · {a.phone}</div>
                </td>
                <td className="px-5 py-4 text-ink/70">{a.model?.name || "—"}</td>
                <td className="px-5 py-4 text-ink/70">
                  {a.service.category.name} — {a.service.name}
                </td>
                <td className="px-5 py-4 text-ink/70">{a.date} · {a.timeSlot}
                  <AppointmentEditor appointment={a} />
                </td>
                <td className="px-5 py-4 font-medium text-ink">
                  €{(a.service.priceCents / 100).toFixed(0)}
                </td>
                <td className="px-5 py-4">
                  <StatusSelect appointmentId={a.id} status={a.status} />
                  {(a.status === "done" || a.status === "cancelled") && (
                    <DeleteAppointmentButton appointmentId={a.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-2">
      <div className="text-xs text-ink/50">{label}</div>
      <div className="font-display text-lg font-700 text-ink">{value}</div>
    </div>
  );
}
