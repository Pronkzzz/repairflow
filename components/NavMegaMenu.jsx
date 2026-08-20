"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DeviceImage from "./DeviceImage";

export default function NavMegaMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSlug, setActiveSlug] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    setLoading(true);
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        const cats = data.categories || [];
        setCategories(cats);
        setActiveSlug(cats[0]?.slug || null);
      })
      .finally(() => setLoading(false));
  }, [open, categories.length]);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const active = categories.find((c) => c.slug === activeSlug);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 transition hover:text-ink ${open ? "text-ink" : ""}`}
      >
        Reparaties
        <span className={`text-xs transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[min(90vw,720px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
          {loading ? (
            <div className="p-8 text-center text-sm text-ink/40">Laden…</div>
          ) : (
            <div className="flex max-h-[70vh] flex-col sm:flex-row">
              <div className="shrink-0 border-b border-line bg-paper/60 sm:w-56 sm:border-b-0 sm:border-r">
                <ul className="flex gap-1 overflow-x-auto p-2 sm:block sm:overflow-visible">
                  {categories.map((cat) => (
                    <li key={cat.id} className="shrink-0 sm:shrink">
                      <button
                        onMouseEnter={() => setActiveSlug(cat.slug)}
                        onClick={() => setActiveSlug(cat.slug)}
                        className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                          activeSlug === cat.slug ? "bg-brand-50 text-brand-700" : "text-ink/70 hover:bg-white"
                        }`}
                      >
                        <span className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
                          <DeviceImage
                            slug={cat.slug}
                            icon={cat.icon}
                            imageUrl={cat.imageUrl}
                            name={cat.name}
                            className="h-full w-full"
                            iconWrapClassName="p-0.5"
                          />
                        </span>
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 flex-1 overflow-y-auto p-5">
                {active && (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-sm font-700 text-ink/60">Kies uw model</h3>
                      <Link
                        href={`/diensten/${active.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-semibold text-brand-600 hover:underline"
                      >
                        Alle {active.name}-modellen →
                      </Link>
                    </div>

                    {active.models?.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {active.models.map((m) => (
                          <Link
                            key={m.id}
                            href={`/diensten/${active.slug}/${m.slug}`}
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-line px-3 py-1.5 text-sm text-ink/80 transition hover:border-brand-400 hover:text-brand-700"
                          >
                            {m.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-ink/50">Nog geen modellen toegevoegd voor {active.name}.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-paper/60 px-5 py-3">
            <Link href="/boeken" onClick={() => setOpen(false)} className="btn-primary !px-5 !py-2 text-sm">
              Diagnose plannen →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
