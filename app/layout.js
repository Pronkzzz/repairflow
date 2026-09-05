import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

// LET OP: pas telefoon en adres hieronder aan naar je echte gegevens —
// dit wordt getoond aan Google (structured data) en moet kloppen.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: SITE_NAME,
  url: SITE_URL,
  telephone: "+32-400-00-00-00", // TODO: echt telefoonnummer
  address: {
    "@type": "PostalAddress",
    streetAddress: "Straat + huisnummer", // TODO
    addressLocality: "Gemeente", // TODO
    postalCode: "0000", // TODO
    addressCountry: "BE",
  },
  areaServed: "BE",
  priceRange: "€€",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RepairFlow — Toestelherstelling, snel geboekt",
    template: "%s — RepairFlow",
  },
  description:
    "Boek online een reparatie-afspraak voor je smartphone, tablet, spelconsole of pc. Transparante prijzen, snelle service.",
  keywords: [
    "toestelherstelling",
    "smartphone reparatie",
    "iPhone scherm herstellen",
    "Samsung reparatie",
    "PlayStation reparatie",
    "Xbox reparatie",
    "pc reparatie",
    "RepairFlow",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: SITE_NAME,
    title: "RepairFlow — Toestelherstelling, snel geboekt",
    description:
      "Boek online een reparatie-afspraak voor je smartphone, tablet, spelconsole of pc. Transparante prijzen, snelle service.",
    url: SITE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RepairFlow — Toestelherstelling, snel geboekt",
    description: "Boek online een reparatie-afspraak voor je smartphone, tablet, spelconsole of pc.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className="bg-paper font-sans text-ink antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
