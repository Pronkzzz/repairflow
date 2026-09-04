"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServiceManager({ categoryId, models = [] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [allModels, setAllModels] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [durationUnit, setDurationUnit] = useState("min");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  function toggleAllModels() {
    setAllModels(true);
    setSelectedIds([]);
  }

  function toggleModel(id) {
    setAllModels(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function addService(e) {
    e.preventDefault();
    if (!name.trim() || price === "") return;
    if (!allModels && selectedIds.length === 0) {
      setError("Kies 'Alle modellen' of vink minstens één model aan.");
      return;
    }
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        modelId: null,
        modelIds: allModels ? [] : selectedIds,
        name: name.trim(),
        priceCents: Math.round(Number(price) * 100),
        durationValue: Number(duration),
        durationUnit,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Kon reparatie niet toevoegen.");
      return;
    }
    setName("");
    setAllModels(true);
    setSelectedIds([]);
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

      <div className="min-w-[220px]">
        <span className="mb-1 block text-xs font-medium text-ink/50">Voor model(len)</span>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-line bg-white p-2">
          <label className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-paper">
            <input
              type="checkbox"
              checked={allModels}
              onChange={toggleAllModels}
            />
            <span className="font-medium">Alle modellen (algemeen)</span>
          </label>
          {models.length > 0 && <div className="my-1 border-t border-line" />}
          {models.map((model) => (
            <label key={model.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-paper">
              <input
                type="checkbox"
                checked={!allModels && selectedIds.includes(model.id)}
                onChange={() => toggleModel(model.id)}
              />
              <span>{model.name}</span>
            </label>
          ))}
        </div>
        {!allModels && selectedIds.length > 0 && (
          <p className="mt-1 text-xs text-ink/40">{selectedIds.length} model(len) geselecteerd</p>
        )}
      </div>

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
