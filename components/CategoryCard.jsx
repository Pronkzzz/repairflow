"use client";

import { useState } from "react";
import Link from "next/link";

const ICONS = {
  iphone: "📱",
  samsung: "📱",
  "samsung-tablet": "🔲",
  macbook: "💻",
  imac: "🖥️",
  ipad: "🔲",
  "apple-watch": "⌚",
  "google-pixel": "📱",
  oneplus: "📱",
  playstation: "🎮",
  xbox: "🎮",
};

export default function CategoryCard({ category, fromPriceCents, langQS = "" }) {
  const [imgFailed, setImgFailed] = useState(!category.imageUrl);
  const price = (fromPriceCents / 100).toFixed(0);

  return (
    <Link
      href={`/boeken?categorie=${category.slug}${langQS ? `&${langQS.slice(1)}` : ""}`}
      className="card group flex flex-col gap-3 p-6 transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop"
    >
      {imgFailed ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-3xl">
          {ICONS[category.slug] || "🔧"}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.imageUrl}
          alt={category.name}
          className="h-14 w-14 rounded-xl bg-paper object-contain p-1.5"
          onError={() => setImgFailed(true)}
        />
      )}
      <span className="font-display text-lg font-700 text-ink">{category.name}</span>
      <span className="text-sm text-ink/60">vanaf €{price}</span>
      <span className="mt-2 text-sm font-semibold text-brand-600 group-hover:underline">
        Bekijk reparaties →
      </span>
    </Link>
  );
}
