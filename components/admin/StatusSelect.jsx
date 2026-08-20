"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { value: "confirmed", label: "Bevestigen", activeClass: "bg-brand-600 text-white border-brand-600" },
  { value: "done", label: "Afgerond", activeClass: "bg-mint text-white border-mint" },
  { value: "cancelled", label: "Annuleren", activeClass: "bg-rose text-white border-rose" },
];

const CURRENT_LABELS = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  done: "Afgerond",
  cancelled: "Geannuleerd",
};

const CURRENT_COLORS = {
  pending: "bg-amber/10 text-amber",
  confirmed: "bg-brand-50 text-brand-600",
  done: "bg-mint/10 text-mint",
  cancelled: "bg-rose/10 text-rose",
};

export default function StatusSelect({ appointmentId, status }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function setStatus(newStatus) {
    if (newStatus === current || saving) return;
    const previous = current;
    setSaving(true);
    setCurrent(newStatus);

    const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setSaving(false);
    if (res.ok) {
      router.refresh();
    } else {
      setCurrent(previous);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${CURRENT_COLORS[current]} ${
          saving ? "opacity-60" : ""
        }`}
      >
        {CURRENT_LABELS[current]}
      </span>

      <div className="flex flex-wrap gap-1.5">
        {STEPS.filter((s) => s.value !== current).map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={saving}
            onClick={() => setStatus(s.value)}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-ink/30 hover:text-ink disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
        {current !== "pending" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => setStatus("pending")}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-ink/30 hover:text-ink disabled:opacity-50"
          >
            Terugzetten
          </button>
        )}
      </div>
    </div>
  );
}
