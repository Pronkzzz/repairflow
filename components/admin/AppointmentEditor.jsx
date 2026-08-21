"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentEditor({ appointment }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(appointment.date);
  const [timeSlot, setTimeSlot] = useState(appointment.timeSlot);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true); setError("");
    const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, timeSlot }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Kon afspraak niet aanpassen."); return; }
    setOpen(false); router.refresh();
  }

  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="text-xs font-semibold text-brand-600 hover:underline">
        {open ? "Annuleren" : "Datum/tijd aanpassen"}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-paper p-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="rounded-lg border border-line px-2 py-1.5 text-xs" />
          <input type="time" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
            className="rounded-lg border border-line px-2 py-1.5 text-xs" />
          <button type="button" onClick={save} disabled={saving}
            className="btn-primary !px-3 !py-1.5 text-xs">{saving ? "…" : "Opslaan"}</button>
          {error && <span className="w-full text-xs font-medium text-rose">{error}</span>}
        </div>
      )}
    </div>
  );
}
