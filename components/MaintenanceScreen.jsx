"use client";

import { useEffect, useState } from "react";

function getRemaining(target) {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function MaintenanceScreen({ until, message }) {
  const target = until ? new Date(until).getTime() : null;
  const [remaining, setRemaining] = useState(() => (target ? getRemaining(target) : null));

  // Elke seconde de aftelklok bijwerken; zodra die op nul staat, herladen we
  // de pagina zodat de proxy opnieuw checkt of de site weer live mag zijn.
  useEffect(() => {
    if (!target) return;
    const tick = setInterval(() => {
      const r = getRemaining(target);
      setRemaining(r);
      if (!r) window.location.reload();
    }, 1000);
    return () => clearInterval(tick);
  }, [target]);

  // Ook zonder aftelklok (of terwijl die nog loopt) elke minuut herladen,
  // zodat bezoekers automatisch de live site zien zodra de eigenaar
  // onderhoudsmodus handmatig uitschakelt.
  useEffect(() => {
    const poll = setInterval(() => window.location.reload(), 60_000);
    return () => clearInterval(poll);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }}
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-base font-700 text-white">R</span>
          <span className="font-display text-xl font-700 text-white">
            Repair<span className="text-brand-400">Flow</span>
          </span>
        </div>

        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl backdrop-blur"
          style={{ animation: "rf-spin 3.5s linear infinite" }}
        >
          🛠️
        </div>

        <h1 className="font-display text-3xl font-800 tracking-tight text-white sm:text-4xl">
          We zijn even bezig met onderhoud
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
          {message || "De website is tijdelijk niet bereikbaar terwijl we verbeteringen doorvoeren. Bedankt voor je geduld — we zijn zo terug."}
        </p>

        {remaining && (
          <div className="mt-10 grid grid-cols-4 gap-3">
            <TimeBlock value={remaining.days} label="dagen" />
            <TimeBlock value={remaining.hours} label="uur" />
            <TimeBlock value={remaining.minutes} label="min" />
            <TimeBlock value={remaining.seconds} label="sec" />
          </div>
        )}

        {!remaining && until && (
          <p className="mt-8 text-sm font-medium text-brand-400">We zijn zo weer online…</p>
        )}

        <p className="mt-12 text-xs text-white/30">
          Dringende vraag? Bel ons gerust op +32 400 00 00 00.
        </p>
      </div>

      <style>{`
        @keyframes rf-spin {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-12deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

function TimeBlock({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur">
      <div className="font-display text-2xl font-700 tabular-nums text-white sm:text-3xl">{pad(value)}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</div>
    </div>
  );
}
