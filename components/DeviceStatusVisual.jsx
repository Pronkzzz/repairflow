"use client";

import { useEffect, useState } from "react";

function SignalGlyph() {
  return (
    <svg viewBox="0 0 18 14" className="h-[10px] w-[13px]" fill="currentColor">
      <rect x="0" y="9" width="3" height="5" rx="0.6" />
      <rect x="5" y="6" width="3" height="8" rx="0.6" />
      <rect x="10" y="3" width="3" height="11" rx="0.6" />
      <rect x="15" y="0" width="3" height="14" rx="0.6" />
    </svg>
  );
}

function WifiGlyph() {
  return (
    <svg viewBox="0 0 20 16" className="h-[11px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 6c4.4-4 11.6-4 16 0" />
      <path d="M5 9.6c2.9-2.6 7.1-2.6 10 0" />
      <path d="M8.2 13c1.1-0.9 2.5-0.9 3.6 0" />
    </svg>
  );
}

function BatteryGlyph() {
  return (
    <svg viewBox="0 0 26 14" className="h-[11px] w-[22px]" fill="none">
      <rect x="0.5" y="0.5" width="21" height="13" rx="3.5" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
      <rect x="2" y="2" width="18" height="10" rx="2.2" fill="currentColor" />
      <rect x="22.5" y="4.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

function LockGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2.4" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

function FlashlightGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M8 2h8l-1.4 6H16v2l-4 12-4-12v-2H9.4L8 2z" />
    </svg>
  );
}

function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5H8l1-2h6l1 2h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function AppIcon({ gradient, label, children }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-[42px] w-[42px] items-center justify-center rounded-[11px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${gradient}`}
      >
        {children}
      </div>
      <span className="text-[8.5px] font-medium text-white drop-shadow-sm">{label}</span>
    </div>
  );
}

const APP_ICONS = [
  {
    label: "Reparaties",
    gradient: "bg-gradient-to-b from-slate-500 to-slate-700",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 0 0 4.9-5.4l-2.6 2.6-2-2z" />
      </svg>
    ),
  },
  {
    label: "Boeken",
    gradient: "bg-gradient-to-b from-rose-400 to-rose-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 9.5h16M8 3v3M16 3v3" />
      </svg>
    ),
  },
  {
    label: "Contact",
    gradient: "bg-gradient-to-b from-emerald-400 to-emerald-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M4 4h16v12H8l-4 4V4z" />
      </svg>
    ),
  },
  {
    label: "Reviews",
    gradient: "bg-gradient-to-b from-amber-400 to-amber-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 3l2.6 5.7 6.2.6-4.6 4.2 1.3 6.1L12 16.9 6.5 19.6l1.3-6.1L3.2 9.3l6.2-.6L12 3z" />
      </svg>
    ),
  },
  {
    label: "Vestiging",
    gradient: "bg-gradient-to-b from-sky-400 to-brand-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.4" />
      </svg>
    ),
  },
  {
    label: "Garantie",
    gradient: "bg-gradient-to-b from-mint to-emerald-700",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Voor/Na",
    gradient: "bg-gradient-to-b from-slate-300 to-slate-500",
    icon: <CameraGlyph />,
  },
  {
    label: "Prijzen",
    gradient: "bg-gradient-to-b from-brand-400 to-brand-700",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12l-8 8-9-9V4h7l9 9z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const DOCK_ICONS = [
  {
    label: "bel",
    gradient: "bg-gradient-to-b from-emerald-400 to-emerald-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.2 2.2z" />
      </svg>
    ),
  },
  {
    label: "chat",
    gradient: "bg-gradient-to-b from-brand-400 to-brand-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M4 4h16v12H8l-4 4V4z" />
      </svg>
    ),
  },
  {
    label: "boeken",
    gradient: "bg-gradient-to-b from-rose-400 to-rose-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 9.5h16M8 3v3M16 3v3" />
      </svg>
    ),
  },
  {
    label: "tools",
    gradient: "bg-gradient-to-b from-slate-500 to-slate-700",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 0 0 4.9-5.4l-2.6 2.6-2-2z" />
      </svg>
    ),
  },
];

function capitalize(str) {
  return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export default function DeviceStatusVisual() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  const timeLabel = now
    ? now.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";
  const dateLabel = now
    ? capitalize(
        now.toLocaleDateString("nl-BE", { weekday: "long", day: "numeric", month: "long" })
      )
    : "";

  return (
    <div
      tabIndex={0}
      className="group relative mx-auto w-full max-w-[260px] select-none outline-none"
      aria-label="Interactieve iPhone: beweeg eroverheen om te ontgrendelen"
    >
      {/* Ambient glow behind the phone */}
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-100 via-white to-brand-50 blur-2xl" />

      {/* Phone frame (titanium) */}
      <div
        className="relative aspect-[9/19.5] w-full rounded-[2.6rem] p-[3px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)] transition-transform duration-700 ease-out group-hover:-translate-y-1"
        style={{
          background: "linear-gradient(155deg, #E5E4E0 0%, #9C9B98 30%, #4B4B4D 55%, #8C8B88 80%, #E7E6E2 100%)",
        }}
      >
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[86px] h-8 w-[3px] rounded-l bg-[#4B4B4D]" />
        <div className="absolute -left-[3px] top-[124px] h-14 w-[3px] rounded-l bg-[#4B4B4D]" />
        <div className="absolute -right-[3px] top-[110px] h-16 w-[3px] rounded-r bg-[#4B4B4D]" />

        {/* Bezel */}
        <div className="h-full w-full rounded-[2.4rem] bg-black p-[9px]">
          {/* Screen */}
          <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-[#0B1120]">
            {/* Wallpaper */}
            <div
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 0%, #3B82F6 0%, #1D4ED8 45%, #0F172A 100%)",
              }}
            />
            <div className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-20" style={{
              background: "radial-gradient(60% 40% at 50% 100%, rgba(16,185,129,0.45), transparent 70%)",
            }} />

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[9px] z-30 h-[20px] w-[74px] -translate-x-1/2 rounded-full bg-black" />

            {/* Status bar */}
            <div className="absolute inset-x-0 top-[13px] z-20 flex items-center justify-between px-6 text-white">
              <span className="text-[11px] font-semibold tabular-nums">{timeLabel}</span>
              <div className="flex items-center gap-1">
                <SignalGlyph />
                <WifiGlyph />
                <BatteryGlyph />
              </div>
            </div>

            {/* ---- LOCK SCREEN ---- */}
            <div className="absolute inset-0 z-10 flex flex-col items-center pt-[52px] opacity-100 transition-opacity duration-500 group-hover:pointer-events-none group-hover:opacity-0">
              <LockGlyph className="h-3.5 w-3.5 text-white/90" />
              <div className="mt-3 font-display text-[46px] font-700 leading-none tabular-nums text-white drop-shadow-sm">
                {timeLabel}
              </div>
              <div className="mt-1.5 text-[12px] font-medium text-white/90">{dateLabel}</div>

              {/* Notification: repair status */}
              <div className="mx-5 mt-8 flex w-[85%] items-center gap-2.5 rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur-md">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-[10.5px] font-semibold text-white">RepairFlow</p>
                  <p className="truncate text-[9.5px] text-white/80">Je toestel is klaar &middot; nu</p>
                </div>
              </div>

              <div className="flex-1" />
              <div className="mb-6 flex items-center gap-2 text-[10px] font-medium text-white/70">
                <span>Beweeg over het toestel om te ontgrendelen</span>
              </div>

              {/* Bottom shortcuts */}
              <div className="mb-8 flex w-[80%] items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
                  <FlashlightGlyph />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
                  <CameraGlyph />
                </div>
              </div>
            </div>

            {/* ---- HOME SCREEN ---- */}
            <div className="absolute inset-0 z-10 flex flex-col px-4 pt-[46px] opacity-0 transition-opacity delay-150 duration-500 group-hover:opacity-100">
              <div className="grid grid-cols-4 gap-x-3 gap-y-3.5 pt-3">
                {APP_ICONS.map((app) => (
                  <AppIcon key={app.label} gradient={app.gradient} label={app.label}>
                    {app.icon}
                  </AppIcon>
                ))}
              </div>

              <div className="flex-1" />

              {/* Dock */}
              <div className="mb-2 flex items-center justify-around rounded-[1.4rem] bg-white/15 px-3 py-2.5 backdrop-blur-xl">
                {DOCK_ICONS.map((app) => (
                  <div
                    key={app.label}
                    className={`flex h-[42px] w-[42px] items-center justify-center rounded-[11px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] ${app.gradient}`}
                  >
                    {app.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[6px] left-1/2 z-20 h-[4px] w-[92px] -translate-x-1/2 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex h-8 items-center justify-center">
        <span className="absolute rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-card transition-opacity duration-300 group-hover:opacity-0">
          Beweeg over het toestel →
        </span>
        <span className="absolute rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink opacity-0 shadow-card transition-opacity delay-150 duration-300 group-hover:opacity-100">
          Ontgrendeld ✓
        </span>
      </div>
    </div>
  );
}
