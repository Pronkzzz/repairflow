"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LABELS = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  done: "Afgerond",
  cancelled: "Geannuleerd",
};

const COLORS = {
  pending: "bg-amber/10 text-amber",
  confirmed: "bg-brand-50 text-brand-600",
  done: "bg-mint/10 text-mint",
  cancelled: "bg-rose/10 text-rose",
};

export default function StatusSelect({ appointmentId, status }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const newStatus = e.target.value;
    setSaving(true);
    setCurrent(newStatus);

    const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={saving}
      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${COLORS[current]} disabled:opacity-60`}
    >
      {Object.entries(LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
