"use client";

import { useEffect, useState } from "react";

const DAYS = [
  [1, "Maandag"], [2, "Dinsdag"], [3, "Woensdag"], [4, "Donderdag"],
  [5, "Vrijdag"], [6, "Zaterdag"], [0, "Zondag"],
];

const defaults = {
  0: { enabled: false, start: "09:00", end: "18:00" },
  1: { enabled: true, start: "09:00", end: "18:00" },
  2: { enabled: true, start: "09:00", end: "18:00" },
  3: { enabled: true, start: "09:00", end: "18:00" },
  4: { enabled: true, start: "09:00", end: "18:00" },
  5: { enabled: true, start: "09:00", end: "18:00" },
  6: { enabled: true, start: "09:00", end: "18:00" },
};

export default function BusinessHoursManager() {
  const [hours, setHours] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/business-hours").then(r => r.json()).then(data => {
      if (data.hours) setHours(data.hours);
    }).finally(() => setLoading(false));
  }, []);

  function update(day, key, value) {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [key]: value } }));
  }

  async function save() {
    setSaving(true); setSaved(false); setError("");
    const res = await fetch("/api/admin/business-hours", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Kon openingstijden niet opslaan."); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-ink/50">Openingstijden laden…</p>;

  return (
    <div className="card p-6">
      <h1 className="font-display text-2xl font-700 text-ink">Afspraakinstellingen</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/50">
        Bepaal per dag wanneer klanten een afspraak kunnen boeken. Deze tijden worden direct gebruikt op de boekingspagina.
        De tijdsloten zijn elk uur.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <div className="divide-y divide-line">
          {DAYS.map(([day, label]) => (
            <div key={day} className="flex flex-wrap items-center gap-4 bg-white p-4">
              <label className="flex w-32 items-center gap-2 font-medium text-ink">
                <input type="checkbox" checked={!!hours[day]?.enabled}
                  onChange={e => update(day, "enabled", e.target.checked)} />
                {label}
              </label>
              <label className="text-xs text-ink/50">Vanaf
                <input type="time" value={hours[day]?.start || "09:00"}
                  onChange={e => update(day, "start", e.target.value)}
                  disabled={!hours[day]?.enabled}
                  className="ml-2 rounded-lg border border-line px-3 py-2 text-sm text-ink disabled:opacity-50" />
              </label>
              <label className="text-xs text-ink/50">Tot
                <input type="time" value={hours[day]?.end || "18:00"}
                  onChange={e => update(day, "end", e.target.value)}
                  disabled={!hours[day]?.enabled}
                  className="ml-2 rounded-lg border border-line px-3 py-2 text-sm text-ink disabled:opacity-50" />
              </label>
              {!hours[day]?.enabled && <span className="text-xs text-ink/40">Gesloten</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Opslaan…" : "Openingstijden opslaan"}</button>
        {saved && <span className="text-sm font-medium text-mint">✓ Opgeslagen</span>}
        {error && <span className="text-sm font-medium text-rose">{error}</span>}
      </div>
    </div>
  );
}
