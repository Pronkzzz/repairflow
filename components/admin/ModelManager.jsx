"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeviceImage from "@/components/DeviceImage";

export default function ModelManager({ categoryId, models }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function addModel(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name: newName.trim(), imageUrl: newImage.trim() || null }),
    });
    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Kon model niet toevoegen.");
      return;
    }
    setNewName("");
    setNewImage("");
    router.refresh();
  }

  async function deleteModel(id) {
    if (!confirm("Dit model verwijderen?")) return;
    await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-3">
      {models.length === 0 && <p className="text-sm text-ink/40">Nog geen modellen toegevoegd.</p>}

      {models.map((m) => (
        <ModelRow key={m.id} model={m} onDelete={() => deleteModel(m.id)} onSaved={() => router.refresh()} />
      ))}

      <form onSubmit={addModel} className="flex flex-wrap items-end gap-3 rounded-lg bg-paper p-3">
        <label className="flex-1 min-w-[160px]">
          <span className="mb-1 block text-xs font-medium text-ink/50">Nieuw model</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="bv. iPhone 16"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block text-xs font-medium text-ink/50">Afbeelding-URL (optioneel)</span>
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" disabled={adding} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
          {adding ? "Bezig…" : "Toevoegen"}
        </button>
      </form>
      {error && <p className="text-sm font-medium text-rose">{error}</p>}
    </div>
  );
}

function ModelRow({ model, onDelete, onSaved }) {
  const [imageUrl, setImageUrl] = useState(model.imageUrl || "");
  const [saving, setSaving] = useState(false);

  async function saveImage() {
    setSaving(true);
    await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper">
        <DeviceImage imageUrl={imageUrl} name={model.name} className="h-full w-full" iconWrapClassName="p-1.5" />
      </span>
      <span className="min-w-[120px] font-medium text-ink">{model.name}</span>
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        onBlur={saveImage}
        placeholder="Afbeelding-URL (optioneel)"
        className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
      />
      {saving && <span className="text-xs text-ink/40">opslaan…</span>}
      <button onClick={onDelete} className="text-sm font-medium text-rose hover:underline">
        Verwijderen
      </button>
    </div>
  );
}
