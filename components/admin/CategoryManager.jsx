"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryManager() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true); setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) { setError(data.error || "Kon merk niet toevoegen."); return; }
    setName("");
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-display font-700 text-ink">Nieuw merk toevoegen</h2>
      <p className="mt-1 text-sm text-ink/50">Voeg zelf bijvoorbeeld Apple, Xiaomi of een ander merk toe.</p>
      <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Merknaam, bv. Google Pixel"
          className="min-w-[240px] flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
        <button disabled={adding} className="btn-primary !px-4 !py-2 text-sm">
          {adding ? "Bezig…" : "Merk toevoegen"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-medium text-rose">{error}</p>}
    </div>
  );
}
