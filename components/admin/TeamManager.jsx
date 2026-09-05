"use client";

import { useEffect, useState } from "react";

const PERMISSIONS = [
  { key: "appointments", label: "Afspraken", description: "Bekijken, bevestigen, verzetten, annuleren." },
  { key: "pos", label: "Kassa", description: "Kassa gebruiken en bonnetjes printen." },
  { key: "products", label: "Voorraad & producten", description: "Producten en voorraad beheren." },
  { key: "pricing", label: "Diensten & prijzen", description: "Reparaties en prijzen beheren." },
  { key: "models", label: "Merken & modellen", description: "Merken en toestelmodellen beheren." },
  { key: "settings", label: "Afspraakinstellingen", description: "Openingstijden aanpassen." },
];

function emptyPermissions() {
  return Object.fromEntries(PERMISSIONS.map((p) => [p.key, false]));
}

export default function TeamManager() {
  const [admins, setAdmins] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [loadError, setLoadError] = useState("");

  // Nieuw-account-formulier
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermissions, setNewPermissions] = useState(emptyPermissions());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function load() {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((data) => {
        if (data.admins) {
          setAdmins(data.admins);
          setCurrentAdminId(data.currentAdminId);
        } else {
          setLoadError(data.error || "Kon team niet laden.");
        }
      })
      .catch(() => setLoadError("Kon team niet laden."));
  }

  useEffect(load, []);

  async function createAccount(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword, permissions: newPermissions }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error || "Kon account niet aanmaken.");
      return;
    }
    setNewEmail("");
    setNewPassword("");
    setNewPermissions(emptyPermissions());
    load();
  }

  async function removeAccount(id) {
    const sure = window.confirm("Dit account definitief verwijderen? De collega kan dan niet meer inloggen.");
    if (!sure) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Verwijderen is mislukt.");
    }
  }

  if (loadError) return <p className="text-sm font-medium text-rose">{loadError}</p>;
  if (!admins) return <p className="text-sm text-ink/50">Team laden…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-700 text-ink">Team</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/50">
        Maak accounts aan voor collega's en bepaal precies welke onderdelen van het admin-paneel ze te zien
        krijgen. "Team" en "Onderhoudsmodus" zijn altijd alleen voor jou als eigenaar zichtbaar.
      </p>

      <div className="mt-8 space-y-4">
        {admins.map((admin) => (
          <TeamRow
            key={admin.id}
            admin={admin}
            isSelf={admin.id === currentAdminId}
            onRemove={() => removeAccount(admin.id)}
            onSaved={load}
          />
        ))}
      </div>

      <div className="card mt-10 p-6">
        <h2 className="font-display text-lg font-700 text-ink">Nieuwe collega toevoegen</h2>
        <p className="mt-1 text-sm text-ink/50">Kies meteen welke onderdelen dit account mag gebruiken.</p>

        <form onSubmit={createAccount} className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="min-w-[220px] flex-1">
              <span className="mb-1 block text-xs font-medium text-ink/50">E-mailadres</span>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="collega@repairflow.be"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
            <label className="min-w-[220px] flex-1">
              <span className="mb-1 block text-xs font-medium text-ink/50">Wachtwoord</span>
              <input
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minstens 8 tekens"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div>
            <span className="mb-2 block text-xs font-medium text-ink/50">Toegang</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {PERMISSIONS.map((p) => (
                <label key={p.key} className="flex items-start gap-2 rounded-lg border border-line p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={!!newPermissions[p.key]}
                    onChange={(e) => setNewPermissions((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                  />
                  <span>
                    <span className="block font-medium text-ink">{p.label}</span>
                    <span className="block text-xs text-ink/50">{p.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={creating} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
            {creating ? "Bezig…" : "Account aanmaken"}
          </button>
          {createError && <p className="text-sm font-medium text-rose">{createError}</p>}
        </form>
      </div>
    </div>
  );
}

function TeamRow({ admin, isSelf, onRemove, onSaved }) {
  const [permissions, setPermissions] = useState(admin.permissions || emptyPermissions());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const isOwner = admin.role === "owner";

  async function savePermissions() {
    setSaving(true);
    setSaved(false);
    setError("");
    const res = await fetch(`/api/admin/team/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Opslaan is mislukt.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function savePassword() {
    if (newPassword.length < 8) {
      setError("Wachtwoord moet minstens 8 tekens zijn.");
      return;
    }
    setPasswordSaving(true);
    setError("");
    const res = await fetch(`/api/admin/team/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setPasswordSaving(false);
    if (!res.ok) {
      setError(data.error || "Wachtwoord aanpassen is mislukt.");
      return;
    }
    setNewPassword("");
    setResetting(false);
    onSaved();
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{admin.email}</span>
            {isSelf && <span className="text-xs text-ink/40">(jij)</span>}
          </div>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              isOwner ? "bg-brand-50 text-brand-700" : "bg-paper text-ink/60"
            }`}
          >
            {isOwner ? "Eigenaar — volledige toegang" : "Collega"}
          </span>
        </div>

        {!isOwner && (
          <div className="flex items-center gap-3">
            <button onClick={() => setResetting((v) => !v)} className="text-xs font-semibold text-ink/50 hover:text-ink">
              Wachtwoord resetten
            </button>
            <button onClick={onRemove} className="text-xs font-semibold text-ink/40 hover:text-rose">
              Verwijderen
            </button>
          </div>
        )}
      </div>

      {resetting && !isOwner && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-paper p-3">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nieuw wachtwoord (min. 8 tekens)"
            className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
          />
          <button
            onClick={savePassword}
            disabled={passwordSaving}
            className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-60"
          >
            {passwordSaving ? "Bezig…" : "Opslaan"}
          </button>
        </div>
      )}

      {!isOwner && (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PERMISSIONS.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={!!permissions[p.key]}
                  onChange={(e) => setPermissions((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                />
                {p.label}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={savePermissions}
              disabled={saving}
              className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-60"
            >
              {saving ? "Opslaan…" : "Toegang opslaan"}
            </button>
            {saved && <span className="text-sm font-medium text-mint">✓ Opgeslagen</span>}
          </div>
        </>
      )}

      {error && <p className="mt-2 text-sm font-medium text-rose">{error}</p>}
    </div>
  );
}
