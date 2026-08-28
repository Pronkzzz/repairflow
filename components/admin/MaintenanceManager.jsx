"use client";

import { useEffect, useState } from "react";

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MaintenanceManager() {
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [until, setUntil] = useState(""); // datetime-local waarde
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setMaintenanceMode(data.settings.maintenanceMode);
          setUntil(toLocalInputValue(data.settings.maintenanceUntil));
          setMessage(data.settings.maintenanceMessage || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(nextMode) {
    setSaving(true);
    setSaved(false);
    setError("");

    // until (datetime-local, lokale tijd) omzetten naar een geldige ISO-datum
    // vóór we 'm naar de server sturen.
    let maintenanceUntil = null;
    if (until) {
      const parsed = new Date(until);
      if (Number.isNaN(parsed.getTime())) {
        setSaving(false);
        setError("Ongeldige datum/tijd.");
        return;
      }
      maintenanceUntil = parsed.toISOString();
    }

    const res = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maintenanceMode: nextMode,
        maintenanceUntil,
        maintenanceMessage: message,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Opslaan is mislukt.");
      return;
    }
    setMaintenanceMode(data.settings.maintenanceMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sm text-ink/50">Onderhoudsinstellingen laden…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Onderhoudsmodus</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/50">
        Zet de hele website tijdelijk offline voor bezoekers. Zij zien dan een onderhoudsscherm met — als je
        een tijdstip instelt — een aftelklok tot de site weer online komt. Het admin-paneel blijft altijd
        gewoon bereikbaar, ook tijdens onderhoud.
      </p>

      <div className={`card mt-8 p-6 ${maintenanceMode ? "border-rose/40" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-700 text-ink">
              Status: {maintenanceMode ? (
                <span className="text-rose">Onderhoudsmodus AAN — site is offline</span>
              ) : (
                <span className="text-mint">Site is live</span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink/50">
              {maintenanceMode
                ? "Bezoekers zien nu het onderhoudsscherm in plaats van de website."
                : "Bezoekers zien de normale website."}
            </p>
          </div>

          <button
            onClick={() => save(!maintenanceMode)}
            disabled={saving}
            className={maintenanceMode ? "btn-secondary !px-5 !py-2.5 text-sm disabled:opacity-60" : "btn-primary !px-5 !py-2.5 text-sm disabled:opacity-60"}
          >
            {saving ? "Bezig…" : maintenanceMode ? "Site weer online zetten" : "Onderhoudsmodus inschakelen"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-medium text-ink/50">
              Site is terug online op (optioneel — laat leeg voor geen aftelklok)
            </span>
            <input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink/50">Eigen boodschap (optioneel)</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="bv. We voeren een grote update door."
              maxLength={300}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-ink/40">
          Zodra de aftelklok afloopt, komt de site automatisch weer online — je hoeft de knop hierboven dan
          niet handmatig om te zetten. Laat je het tijdstip leeg, dan blijft de site offline tot je zelf op
          "Site weer online zetten" klikt.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => save(maintenanceMode)} disabled={saving} className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-60">
            {saving ? "Opslaan…" : "Tijdstip & boodschap opslaan"}
          </button>
          {saved && <span className="text-sm font-medium text-mint">✓ Opgeslagen</span>}
          {error && <span className="text-sm font-medium text-rose">{error}</span>}
        </div>
      </div>
    </div>
  );
}
