"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DeviceImage from "@/components/DeviceImage";
import ImageUploadButton from "./ImageUploadButton";

export default function ModelManager({ categoryId, models, sections }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [error, setError] = useState(null);
  const [draggedId, setDraggedId] = useState(null);

  const grouped = useMemo(() => {
    const bySection = new Map(sections.map((s) => [s.id, []]));
    const ungrouped = [];
    models.forEach((m) => {
      if (m.sectionId && bySection.has(m.sectionId)) bySection.get(m.sectionId).push(m);
      else ungrouped.push(m);
    });
    return { bySection, ungrouped };
  }, [models, sections]);

  async function addModel(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true); setError(null);
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name: newName.trim(), imageUrl: newImage.trim() || null }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setError(data.error || "Kon model niet toevoegen."); return; }
    setNewName(""); setNewImage(""); router.refresh();
  }

  async function addSection(e) {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setAddingSection(true); setError(null);
    const res = await fetch("/api/admin/model-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name: newSectionName.trim() }),
    });
    const data = await res.json();
    setAddingSection(false);
    if (!res.ok) { setError(data.error || "Kon sectie niet toevoegen."); return; }
    setNewSectionName(""); router.refresh();
  }

  async function deleteModel(id) {
    if (!confirm("Dit model verwijderen?")) return;
    await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function moveModel(modelId, sectionId) {
    const target = models.find((m) => m.id === modelId);
    if (!target || (target.sectionId || null) === (sectionId || null)) return;
    await fetch(`/api/admin/models/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: sectionId || null }),
    });
    router.refresh();
  }

  async function deleteSection(id) {
    if (!confirm("Deze sectie verwijderen? De modellen blijven bestaan en worden ongegroepeerd.")) return;
    await fetch(`/api/admin/model-sections/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink/70">Modelsecties</h3>
        <p className="mt-1 text-xs text-ink/40">
          Maak bijvoorbeeld Galaxy A, Galaxy S en Galaxy Z. Sleep daarna een model op de juiste sectie.
        </p>
        <form onSubmit={addSection} className="mt-3 flex flex-wrap gap-2">
          <input
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Nieuwe sectie, bv. Galaxy A"
            className="min-w-[220px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
          />
          <button type="submit" disabled={addingSection} className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-60">
            {addingSection ? "Bezig…" : "Sectie toevoegen"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section
            key={section.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => draggedId && moveModel(draggedId, section.id)}
            className="rounded-xl border border-line bg-paper p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-700 text-ink">{section.name}</h4>
                <p className="text-xs text-ink/40">Sleep modellen hierheen</p>
              </div>
              <button onClick={() => deleteSection(section.id)} className="text-xs font-medium text-rose hover:underline">
                Sectie verwijderen
              </button>
            </div>
            <div className="space-y-2">
              {grouped.bySection.get(section.id)?.map((m) => (
                <ModelRow
                  key={m.id}
                  model={m}
                  sections={sections}
                  draggable
                  onDragStart={() => setDraggedId(m.id)}
                  onDelete={() => deleteModel(m.id)}
                  onSaved={() => router.refresh()}
                />
              ))}
              {!grouped.bySection.get(section.id)?.length && (
                <div className="rounded-lg border border-dashed border-line px-4 py-5 text-center text-xs text-ink/40">
                  Sleep hier een model heen
                </div>
              )}
            </div>
          </section>
        ))}

        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => draggedId && moveModel(draggedId, null)}
          className="rounded-xl border border-dashed border-line p-4"
        >
          <h4 className="font-display font-700 text-ink">Niet ingedeeld</h4>
          <p className="mb-3 text-xs text-ink/40">Modellen zonder sectie.</p>
          <div className="space-y-2">
            {grouped.ungrouped.map((m) => (
              <ModelRow
                key={m.id}
                model={m}
                sections={sections}
                draggable
                onDragStart={() => setDraggedId(m.id)}
                onDelete={() => deleteModel(m.id)}
                onSaved={() => router.refresh()}
              />
            ))}
            {!grouped.ungrouped.length && (
              <p className="text-sm text-ink/40">Alle modellen zijn ingedeeld.</p>
            )}
          </div>
        </section>
      </div>

      <form onSubmit={addModel} className="flex flex-wrap items-end gap-3 rounded-lg bg-paper p-3">
        <label className="min-w-[160px] flex-1">
          <span className="mb-1 block text-xs font-medium text-ink/50">Nieuw model</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="bv. Galaxy A56"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="min-w-[220px] flex-1">
          <span className="mb-1 block text-xs font-medium text-ink/50">Afbeelding-URL (optioneel)</span>
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        <ImageUploadButton onUploaded={(url) => setNewImage(url)} />
        <button type="submit" disabled={adding} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
          {adding ? "Bezig…" : "Model toevoegen"}
        </button>
      </form>

      {error && <p className="text-sm font-medium text-rose">{error}</p>}
    </div>
  );
}

function ModelRow({ model, sections, onDelete, onSaved, draggable, onDragStart }) {
  const [imageUrl, setImageUrl] = useState(model.imageUrl || "");
  const [name, setName] = useState(model.name || "");
  const [savingImage, setSavingImage] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [sectionId, setSectionId] = useState(model.sectionId || "");

  async function saveImage(overrideUrl) {
    const url = overrideUrl !== undefined ? overrideUrl : imageUrl;
    setSavingImage(true);
    await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    setSavingImage(false); onSaved();
  }

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed) { setNameError("Naam mag niet leeg zijn."); setName(model.name || ""); return; }
    if (trimmed === model.name) return;
    setSavingName(true); setNameError(null);
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingName(false);
    if (!res.ok) { setNameError(data.error || "Kon naam niet opslaan."); setName(model.name || ""); return; }
    setJustSaved(true); setTimeout(() => setJustSaved(false), 1500); onSaved();
  }

  async function changeSection(e) {
    const value = e.target.value;
    setSectionId(value);
    const res = await fetch(`/api/admin/models/${model.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: value || null }),
    });
    if (!res.ok) setSectionId(model.sectionId || "");
    onSaved();
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="flex flex-wrap items-start gap-3 rounded-lg border border-line bg-white p-3"
      title="Sleep dit model naar een sectie"
    >
      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper">
        <DeviceImage imageUrl={imageUrl} name={name} className="h-full w-full" iconWrapClassName="p-1.5" />
      </span>
      <div className="min-w-[140px]">
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(null); }}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") { setName(model.name || ""); setNameError(null); e.currentTarget.blur(); }
          }}
          placeholder="Modelnaam"
          className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-ink ${nameError ? "border-rose" : "border-line"}`}
        />
        {nameError && <p className="mt-1 text-xs font-medium text-rose">{nameError}</p>}
        {savingName && <p className="mt-1 text-xs text-ink/40">opslaan…</p>}
        {justSaved && !savingName && <p className="mt-1 text-xs font-medium text-mint">Opgeslagen ✓</p>}
      </div>
      <select value={sectionId} onChange={changeSection} className="rounded-lg border border-line px-3 py-2 text-sm">
        <option value="">Niet ingedeeld</option>
        {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
      </select>
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        onBlur={() => saveImage()}
        placeholder="Afbeelding-URL (optioneel)"
        className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
      />
      <ImageUploadButton onUploaded={(url) => { setImageUrl(url); saveImage(url); }} />
      {savingImage && <span className="text-xs text-ink/40">opslaan…</span>}
      <button onClick={onDelete} className="text-sm font-medium text-rose hover:underline">Verwijderen</button>
    </div>
  );
}
