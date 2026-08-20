"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServiceManager({ categoryId, models = [] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [durationUnit, setDurationUnit] = useState("min");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function addService(e) {
    e.preventDefault();
    if (!name.trim() || price === "") return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        modelId: modelId || null,
        name: name.trim(),
        priceCents: Math.round(Number(price) * 100),
        durationValue: Number(duration),
        durationUnit,
      }),
    });
    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Kon reparatie niet toevoegen.");
      return;
    }
    setName("");
    setModelId("");
    setPrice("");
    setDuration("60");
    setDurationUnit("min");
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

      <label className="min-w-[180px]">
        <span className="mb-1 block text-xs font-medium text-ink/50">Voor model</span>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="">Alle modellen</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
      </label>

      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Prijs (€)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="79"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Duur</span>
        <input
          type="number"
          min="0"
          step={durationUnit === "uur" ? "0.5" : "1"}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Eenheid</span>
        <select
          value={durationUnit}
          onChange={(e) => setDurationUnit(e.target.value)}
          className="w-full rounded-lg border border-line px-2 py-2 text-sm"
        >
          <option value="min">min</option>
          <option value="uur">uur</option>
        </select>
      </label>

      <button type="submit" disabled={adding} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
        {adding ? "Bezig…" : "Toevoegen"}
      </button>
      {error && <p className="w-full text-sm font-medium text-rose">{error}</p>}
    </form>
  );
}
