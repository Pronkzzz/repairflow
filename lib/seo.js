// Centrale plek voor je live domeinnaam, gebruikt voor metadata, sitemap.xml
// en robots.txt. Zet dit op Vercel als environment variable:
//   NEXT_PUBLIC_SITE_URL = https://jouwecht domein.be
// Zonder die variabele valt dit terug op onderstaande placeholder — pas die
// dan zeker aan naar je echte domein.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://repairflow.be").replace(/\/$/, "");

export const SITE_NAME = "RepairFlow";
