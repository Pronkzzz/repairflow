"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeviceImage from "@/components/DeviceImage";
import { ICON_OPTIONS } from "@/components/DeviceIcon";

export default function CategoryImageEditor({ category }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(category.imageUrl || "");
  const [icon, setIcon] = useState(category.icon || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(overrides = {}) {
    setSaving(true);
    setSaved(false);
    const payload = { imageUrl, icon: icon || null, ...overrides };
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper">
        <DeviceImage
          slug={category.slug}
          icon={icon}
          imageUrl={imageUrl}
          name={category.name}
          className="h-full w-full"
          iconWrapClassName="p-2"
        />
      </span>

      <div className="flex flex-1 flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block text-xs font-medium text-ink/50">Afbeelding-URL (optioneel)</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onBlur={() => save()}
            placeholder="https://..."
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <label className="min-w-[180px]">
          <span className="mb-1 block text-xs font-medium text-ink/50">Icoon (als er geen afbeelding is)</span>
          <select
            value={icon}
            onChange={(e) => {
              setIcon(e.target.value);
              save({ icon: e.target.value || null });
            }}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          >
            <option value="">Standaard (op basis van merk)</option>
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {saving && <span className="text-xs text-ink/40">opslaan…</span>}
        {saved && <span className="text-xs text-mint">✓ opgeslagen</span>}
      </div>
    </div>
  );
}
