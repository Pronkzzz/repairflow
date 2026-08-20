"use client";

import { useState } from "react";

function Thumb({ category, className }) {
  const [failed, setFailed] = useState(!category?.imageUrl);
  if (!category || failed) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-white ${className}`}>
        <span className="text-3xl">📱</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={category.imageUrl}
      alt={category.name}
      onError={() => setFailed(true)}
      className={`rounded-2xl border border-line bg-white object-contain p-4 shadow-card ${className}`}
    />
  );
}

export default function HeroDeviceCollage({ categories }) {
  const bySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
  const primary = bySlug["iphone"] || categories?.[0];
  const secondary = bySlug["samsung"] || categories?.[1];
  const tertiary = bySlug["playstation"] || categories?.[2];

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
      <div className="absolute inset-0 rounded-xl2 bg-gradient-to-br from-brand-100 via-white to-brand-50" />

      <Thumb category={primary} className="absolute left-1/2 top-6 h-64 w-40 -translate-x-1/2" />
      <Thumb category={secondary} className="absolute -left-2 bottom-24 h-36 w-28 rotate-[-8deg]" />
      <Thumb category={tertiary} className="absolute -right-2 bottom-10 h-28 w-36 rotate-[6deg]" />

      <div className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-card">
        Meestal klaar binnen het uur ⚡
      </div>
    </div>
  );
}
