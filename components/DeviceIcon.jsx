const COMMON = "h-full w-full";

function Phone(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="18" y="6" width="28" height="52" rx="7" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="23" y="13" width="18" height="34" rx="2" fill="currentColor" opacity="0.12" />
      <circle cx="32" cy="52" r="2.4" fill="currentColor" />
    </svg>
  );
}

function Tablet(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="10" y="8" width="44" height="48" rx="6" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="15" y="14" width="34" height="32" rx="2" fill="currentColor" opacity="0.12" />
      <circle cx="32" cy="51" r="2" fill="currentColor" />
    </svg>
  );
}

function Laptop(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="14" y="10" width="36" height="26" rx="3" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="18" y="14" width="28" height="18" rx="1.5" fill="currentColor" opacity="0.12" />
      <path d="M8 46h48l-4 8H12l-4-8Z" fill="#fff" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Watch(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <path d="M24 12h16l2 10H22l2-10Z" fill="#fff" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 52h16l2-10H22l2 10Z" fill="#fff" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="17" y="20" width="30" height="24" rx="8" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="23" y="26" width="18" height="12" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="46" y="28" width="4" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function Desktop(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="10" y="8" width="44" height="30" rx="4" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="15" y="13" width="34" height="20" rx="1.5" fill="currentColor" opacity="0.12" />
      <path d="M26 38h12v8H26v-8Z" fill="#fff" stroke="currentColor" strokeWidth="2.2" />
      <path d="M18 54h28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function GalaxyTab(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="12" y="6" width="40" height="52" rx="5" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="17" y="12" width="30" height="36" rx="2" fill="currentColor" opacity="0.12" />
      <circle cx="32" cy="53" r="2" fill="currentColor" />
    </svg>
  );
}

function Console(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <path
        d="M18 22h28c7 0 11 6 10 14l-1 8c-1 6-6 8-10 4l-4-4H27l-4 4c-4 4-9 2-10-4l-1-8c-1-8 3-14 6-14Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M23 30v8M19 34h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="43" cy="30" r="2" fill="currentColor" />
      <circle cx="48" cy="35" r="2" fill="currentColor" />
    </svg>
  );
}

function Handheld(props) {
  return (
    <svg viewBox="0 0 64 64" className={COMMON} {...props}>
      <rect x="14" y="10" width="36" height="44" rx="8" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <rect x="20" y="16" width="24" height="18" rx="2" fill="currentColor" opacity="0.12" />
      <circle cx="24" cy="42" r="2.3" fill="currentColor" />
      <circle cx="40" cy="42" r="2.3" fill="currentColor" />
      <circle cx="32" cy="46" r="2.3" fill="currentColor" />
    </svg>
  );
}

const REGISTRY = {
  iphone: Phone,
  samsung: Phone,
  googlepixel: Phone,
  oneplus: Phone,
  ipad: Tablet,
  samsunggalaxytab: GalaxyTab,
  macbook: Laptop,
  imac: Desktop,
  applewatch: Watch,
  playstation: Console,
  xbox: Console,
  nintendoswitch: Handheld,
};

export default function DeviceIcon({ slug, className = "" }) {
  const Cmp = REGISTRY[slug] || Phone;
  return (
    <span className={`text-brand-500 ${className}`}>
      <Cmp />
    </span>
  );
}
