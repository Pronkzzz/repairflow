"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Alleen tonen voor afspraken die al afgerond of geannuleerd zijn —
// zie DELETABLE_STATUSES in de API-route.
export default function DeleteAppointmentButton({ appointmentId }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const sure = window.confirm(
      "Deze afspraak definitief verwijderen? Dit kan niet ongedaan gemaakt worden."
    );
    if (!sure) return;

    setDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Verwijderen is mislukt.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs font-semibold text-ink/40 hover:text-rose disabled:opacity-50"
      >
        {deleting ? "Verwijderen…" : "Verwijderen"}
      </button>
      {error && <div className="mt-1 text-xs font-medium text-rose">{error}</div>}
    </div>
  );
}
