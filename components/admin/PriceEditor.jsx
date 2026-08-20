"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PriceEditor({ serviceId, priceCents, active, featured, featuredOrder, onDeleted }) {
  const router = useRouter();
  const [value, setValue] = useState((priceCents / 100).toString());
  const [isActive, setIsActive] = useState(active);
  const [isFeatured, setIsFeatured] = useState(featured || false);
  const [order, setOrder] = useState(featuredOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(overrides = {}) {
    setSaving(true);
    setSaved(false);
    const payload = {
      priceCents: Math.round(Number(value) * 100),
      active: isActive,
      featured: isFeatured,
      featuredOrder: order,
      ...overrides,
    };
    const res = await fetch(`/api/admin/services/${serviceId}`, {
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-line px-2">
        <span className="text-ink/40">€</span>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => save()}
          className="w-20 border-0 px-1 py-2 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-1.5 text-xs text-ink/60">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => {
            setIsActive(e.target.checked);
            save({ active: e.target.checked });
          }}
        />
        Actief
      </label>

      <label className="flex items-center gap-1.5 text-xs text-ink/60">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => {
            setIsFeatured(e.target.checked);
            save({ featured: e.target.checked });
          }}
        />
        Toon op homepage
      </label>

      {isFeatured && (
        <label className="flex items-center gap-1.5 text-xs text-ink/60">
          Volgorde
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            onBlur={() => save()}
            className="w-14 rounded-lg border border-line px-2 py-1"
          />
        </label>
      )}

      {saving && <span className="text-xs text-ink/40">opslaan…</span>}
      {saved && <span className="text-xs text-mint">✓ opgeslagen</span>}

      <button
        type="button"
        onClick={async () => {
          if (!confirm("Deze reparatie verwijderen?")) return;
          await fetch(`/api/admin/services/${serviceId}`, { method: "DELETE" });
          router.refresh();
        }}
        className="text-xs font-medium text-rose hover:underline"
      >
        Verwijderen
      </button>
    </div>
  );
}
