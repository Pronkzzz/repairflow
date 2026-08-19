import "./globals.css";

export const metadata = {
  title: "RepairFlow — Toestelherstelling, snel geboekt",
  description:
    "Boek online een reparatie-afspraak voor je smartphone, tablet of laptop. Transparante prijzen, snelle service.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
