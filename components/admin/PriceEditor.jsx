"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PriceEditor({ serviceId, priceCents, active }) {
  const router = useRouter();
  const [value, setValue] = useState((priceCents / 100).toString());
  const [isActive, setIsActive] = useState(active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(overrides = {}) {
    setSaving(true);
    setSaved(false);
    const payload = {
      priceCents: Math.round(Number(value) * 100),
      active: isActive,
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
    <div className="flex items-center gap-3">
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

      {saving && <span className="text-xs text-ink/40">opslaan…</span>}
      {saved && <span className="text-xs text-mint">✓ opgeslagen</span>}
    </div>
  );
}
