import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getLang } from "@/lib/i18n";

export const metadata = { title: "Contact — RepairFlow" };

export default async function ContactPage({ searchParams }) {
  const sp = await searchParams;
  const lang = getLang(sp);
  const isEn = lang === "en";

  return (
    <>
      <SiteHeader searchParams={sp} />

      <section className="container-page py-14">
        <h1 className="font-display text-3xl font-800 text-ink md:text-4xl">
          {isEn ? "Contact" : "Contact"}
        </h1>
        <p className="mt-3 max-w-lg text-ink/60">
          {isEn
            ? "Question about a repair, a price, or an existing appointment? Reach us any of these ways."
            : "Vraag over een reparatie, een prijs, of een bestaande afspraak? Bereik ons op één van deze manieren."}
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-lg font-700 text-ink">
                {isEn ? "Call or email" : "Bel of mail"}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">📞</span>
                  <a href="tel:+32400000000" className="font-semibold text-ink hover:text-brand-600">
                    +32 400 00 00 00
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">✉️</span>
                  <a href="mailto:info@repairflow.be" className="font-semibold text-ink hover:text-brand-600">
                    info@repairflow.be
                  </a>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-700 text-ink">
                {isEn ? "Our shop" : "Onze winkel"}
              </h2>
              <p className="mt-3 text-sm text-ink/70">
                RepairFlow<br />
                Herstelstraat 1<br />
                2000 Antwerpen
              </p>
              <p className="mt-3 text-sm text-ink/70">
                {isEn ? "Today" : "Vandaag"}: 10:00–18:00
              </p>
            </div>
          </div>

          {/* Simple contact form (mailto) */}
          <form
            className="card space-y-4 p-6"
            action="mailto:info@repairflow.be"
            method="POST"
            encType="text/plain"
          >
            <h2 className="font-display text-lg font-700 text-ink">
              {isEn ? "Send a message" : "Stuur een bericht"}
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">
                {isEn ? "Name" : "Naam"}
              </label>
              <input name="naam" required className="w-full rounded-lg border border-line px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">E-mail</label>
              <input type="email" name="email" required className="w-full rounded-lg border border-line px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">
                {isEn ? "Message" : "Bericht"}
              </label>
              <textarea name="bericht" rows={4} required className="w-full rounded-lg border border-line px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500" />
            </div>
            <button type="submit" className="btn-primary w-full">
              {isEn ? "Send" : "Versturen"}
            </button>
          </form>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </>
  );
}
