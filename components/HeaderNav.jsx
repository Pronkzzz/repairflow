"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import { getDict } from "@/lib/i18n";

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function DeviceGlyph({ slug }) {
  // simpele, consistente vector-icoontjes als fallback voor toestellen zonder foto
  const common = "h-6 w-6";
  switch (slug) {
    case "macbook":
    case "imac":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M2 19h20" strokeLinecap="round" /></svg>
      );
    case "ipad":
    case "samsung-tablet":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2.2" /><circle cx="12" cy="18.3" r="0.6" fill="currentColor" /></svg>
      );
    case "apple-watch":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7.5" y="6" width="9" height="12" rx="3" /><path d="M9.5 6V3.5h5V6M9.5 18v2.5h5V18" strokeLinecap="round" /></svg>
      );
    case "playstation":
    case "xbox":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="7" width="19" height="10" rx="4" /><circle cx="16.5" cy="10.5" r="0.8" fill="currentColor" /><circle cx="18.5" cy="12.5" r="0.8" fill="currentColor" /></svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M10.5 19h3" strokeLinecap="round" /></svg>
      );
  }
}

function DeviceThumb({ category }) {
  const [failed, setFailed] = useState(!category.imageUrl);
  if (failed) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <DeviceGlyph slug={category.slug} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={category.imageUrl}
      alt={category.name}
      className="h-11 w-11 shrink-0 rounded-lg bg-paper object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

export default function HeaderNav({ categories, lang }) {
  const dict = getDict(lang);
  const [repairsOpen, setRepairsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openMenu() {
    clearTimeout(closeTimer.current);
    setRepairsOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setRepairsOpen(false), 150);
  }

  const langQS = lang === "en" ? "?lang=en" : "";

  return (
    <div className="flex flex-1 items-center justify-between">
      <nav className="hidden items-center gap-1 text-sm font-medium text-ink/70 md:flex">
        <div
          className="relative"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-3 py-2 hover:text-ink"
            onClick={() => setRepairsOpen((v) => !v)}
            aria-expanded={repairsOpen}
          >
            {dict.nav.reparaties}
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {repairsOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(90vw,720px)] -translate-x-1/2 rounded-xl2 border border-line bg-white p-4 shadow-pop">
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/boeken?categorie=${c.slug}${lang === "en" ? "&lang=en" : ""}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-paper"
                    onClick={() => setRepairsOpen(false)}
                  >
                    <DeviceThumb category={c} />
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-line pt-3 text-right">
                <Link href={`/boeken${langQS}`} className="text-sm font-semibold text-brand-600 hover:underline">
                  {dict.nav.alleModellen}
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href={`/#prijzen${langQS ? langQS : ""}`} className="rounded-md px-3 py-2 hover:text-ink">
          {dict.nav.prijzen}
        </Link>
        <Link href={`/contact${langQS}`} className="rounded-md px-3 py-2 hover:text-ink">
          {dict.nav.contact}
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <LanguageSwitch lang={lang} />
        </div>

        <Link
          href={`/contact${langQS}`}
          aria-label={dict.nav.bel}
          title={dict.nav.bel}
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-ink/70 transition hover:border-brand-400 hover:text-brand-600 sm:flex"
        >
          <PhoneIcon className="h-4 w-4" />
        </Link>

        <Link href={`/boeken${langQS}`} className="btn-primary !px-5 !py-2.5 text-sm">
          {dict.nav.afspraak}
        </Link>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-line bg-white p-4 shadow-card md:hidden">
          <div className="mb-3">
            <LanguageSwitch lang={lang} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.nav.reparaties}</p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/boeken?categorie=${c.slug}${lang === "en" ? "&lang=en" : ""}`}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-paper"
                onClick={() => setMobileOpen(false)}
              >
                <DeviceThumb category={c} />
                <span className="text-sm font-medium text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1 border-t border-line pt-3 text-sm font-medium text-ink/70">
            <Link href={`/#prijzen`} onClick={() => setMobileOpen(false)}>{dict.nav.prijzen}</Link>
            <Link href={`/contact${langQS}`} onClick={() => setMobileOpen(false)}>{dict.nav.contact}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
