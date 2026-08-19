import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Contact — RepairFlow" };

const CONTACT_CARDS = [
  {
    title: "Bel of app ons",
    value: "+32 400 00 00 00",
    href: "tel:+32400000000",
    cta: "Bellen",
  },
  {
    title: "Mail ons",
    value: "info@repairflow.be",
    href: "mailto:info@repairflow.be",
    cta: "E-mail sturen",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Contact</p>
        <h1 className="mt-2 max-w-xl font-display text-3xl font-700 text-ink md:text-4xl">
          Vraag over je toestel? We helpen je graag.
        </h1>
        <p className="mt-3 max-w-xl text-ink/60">
          Liever meteen een tijdslot boeken? Dat kan sneller via onze afsprakenpagina.
        </p>
      </section>

      <section className="container-page grid gap-6 pb-20 md:grid-cols-2">
        {CONTACT_CARDS.map((c) => (
          <div key={c.title} className="card p-6">
            <h2 className="font-display text-lg font-700 text-ink">{c.title}</h2>
            <p className="mt-2 text-ink/60">{c.value}</p>
            <a href={c.href} className="btn-secondary mt-5 !px-5 !py-2.5 text-sm">
              {c.cta}
            </a>
          </div>
        ))}

        <div className="card p-6 md:col-span-2">
          <h2 className="font-display text-lg font-700 text-ink">Liever meteen boeken?</h2>
          <p className="mt-2 text-ink/60">
            Kies je toestel, het probleem en een tijdstip — klaar in 2 minuten.
          </p>
          <Link href="/boeken" className="btn-primary mt-5">
            Maak een afspraak
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
