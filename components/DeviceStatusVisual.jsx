export default function DeviceStatusVisual() {
  return (
    <div className="group relative mx-auto aspect-[4/5] w-full max-w-sm">
      <div className="absolute inset-0 rounded-xl2 bg-gradient-to-br from-brand-100 via-white to-brand-50" />

      <svg
        viewBox="0 0 280 340"
        className="relative h-full w-full"
        role="img"
        aria-label="Telefoon met scherm dat herstelt van gebarsten naar gerepareerd"
      >
        {/* Phone body */}
        <rect x="60" y="20" width="160" height="300" rx="28" fill="#0F172A" />
        <rect x="70" y="34" width="140" height="272" rx="18" fill="#F8FAFC" />

        {/* Screen content: status bar */}
        <rect x="86" y="52" width="108" height="8" rx="4" fill="#93C5FD" className="transition-all duration-700 group-hover:fill-mint" />

        {/* Crack lines: fade out on hover */}
        <g className="opacity-100 transition-opacity duration-700 group-hover:opacity-0" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round">
          <path d="M140 90 L110 150 L150 190 L120 250" fill="none" />
          <path d="M140 90 L175 130 L155 170" fill="none" />
          <path d="M110 150 L80 170" fill="none" />
          <path d="M150 190 L190 220" fill="none" />
        </g>

        {/* Repaired checkmark: fades in on hover */}
        <g className="opacity-0 transition-opacity delay-200 duration-700 group-hover:opacity-100">
          <circle cx="140" cy="175" r="40" fill="#ECFDF5" />
          <path d="M122 176 L136 190 L162 160" stroke="#10B981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>

      <div className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-card">
        Beweeg over het toestel →
      </div>
    </div>
  );
}
