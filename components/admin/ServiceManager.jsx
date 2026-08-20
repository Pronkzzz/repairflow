"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServiceManager({ categoryId }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function addService(e) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        name: name.trim(),
        priceCents: Math.round(Number(price) * 100),
        durationMin: Number(duration) || 60,
      }),
    });
    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Kon reparatie niet toevoegen.");
      return;
    }
    setName("");
    setPrice("");
    setDuration("60");
    router.refresh();
  }

  return (
    <form onSubmit={addService} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-paper p-3">
      <label className="flex-1 min-w-[180px]">
        <span className="mb-1 block text-xs font-medium text-ink/50">Nieuwe reparatie</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="bv. Camera vervangen"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Prijs (€)</span>
        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="79"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="w-28">
        <span className="mb-1 block text-xs font-medium text-ink/50">Duur (min)</span>
        <input
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <button type="submit" disabled={adding} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
        {adding ? "Bezig…" : "Toevoegen"}
      </button>
      {error && <p className="w-full text-sm font-medium text-rose">{error}</p>}
    </form>
  );
}
