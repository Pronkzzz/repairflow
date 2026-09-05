// Eén centrale plek voor de permissies die een "staff"-account (collega) kan
// krijgen. "owner" (de hoofdaccount) heeft altijd overal toegang, ongeacht
// wat er in `permissions` staat.
//
// Team-beheer (/admin/team) en Onderhoudsmodus (/admin/onderhoud) zijn
// bewust NIET toggle-baar: alleen "owner"-accounts zien en gebruiken die
// tabs. Dat voorkomt dat een collega zichzelf of anderen meer rechten geeft,
// of de hele site plat kan leggen.

export const PERMISSIONS = [
  {
    key: "appointments",
    label: "Afspraken",
    description: "Afspraken bekijken, bevestigen, verzetten en annuleren.",
  },
  {
    key: "pos",
    label: "Kassa",
    description: "De kassa gebruiken om reparaties en producten te verkopen en bonnetjes te printen.",
  },
  {
    key: "products",
    label: "Voorraad & producten",
    description: "Producten, prijzen en voorraad beheren.",
  },
  {
    key: "pricing",
    label: "Diensten & prijzen",
    description: "Reparaties, prijzen en duur beheren.",
  },
  {
    key: "models",
    label: "Merken & modellen",
    description: "Merken, secties en toestelmodellen beheren.",
  },
  {
    key: "settings",
    label: "Afspraakinstellingen",
    description: "Openingstijden en boekingsinstellingen aanpassen.",
  },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

// Bouwt een schoon permissions-object met alleen geldige keys (booleans),
// zodat er nooit rommel/onbekende velden in de database terechtkomen.
export function sanitizePermissions(input) {
  const clean = {};
  for (const { key } of PERMISSIONS) {
    clean[key] = !!input?.[key];
  }
  return clean;
}

export function hasPermission(admin, key) {
  if (!admin) return false;
  if (admin.role === "owner") return true;
  return !!admin.permissions?.[key];
}
