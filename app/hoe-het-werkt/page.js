import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Hoe het werkt — RepairFlow" };

const STEPS = [
  {
    title: "1. Kies je toestel en probleem",
    desc: "Selecteer je toestel (iPhone, Samsung, MacBook, iPad, ...) en het probleem dat je hebt. Je ziet meteen de vaste prijs, geen verrassingen achteraf.",
  },
  {
    title: "2. Kies een tijdslot dat jou past",
    desc: "Boek zelf een moment dat uitkomt — vandaag nog of later deze week. Je krijgt direct een bevestiging per e-mail.",
  },
  {
    title: "3. Breng je toestel binnen",
    desc: "Kom langs op het afgesproken tijdstip. De meeste reparaties, zoals een schermwissel, ronden we binnen het uur af terwijl je wacht.",
  },
  {
    title: "4. Haal je toestel gerepareerd op",
    desc: "We testen alles voor je het toestel terugkrijgt, en je krijgt garantie op de uitgevoerde reparatie.",
  },
];

const FAQ = [
  {
    q: "Hoe lang duurt een reparatie gemiddeld?",
    a: "De meeste schermreparaties en batterijvervangingen ronden we binnen het uur af. Bij complexere problemen, zoals waterschade, laten we vooraf weten hoeveel tijd we nodig hebben.",
  },
  {
    q: "Krijg ik garantie op de reparatie?",
    a: "Ja, op de meeste reparaties krijg je garantie. Je vindt de exacte garantietermijn terug in de bevestiging van je afspraak.",
  },
  {
    q: "Kan ik ook zonder afspraak langskomen?",
    a: "Dat kan, maar met een online afspraak ben je zeker van een tijdslot en hoef je niet te wachten. Boeken duurt maar 2 minuten.",
  },
  {
    q: "Wat als mijn probleem er niet tussen staat?",
    a: "Boek gewoon een afspraak en omschrijf je probleem in de opmerkingen. We bekijken het toestel ter plaatse en stellen een passende oplossing voor.",
  },
];

export default function HoeHetWerktPage() {
  return (
    <>
      <SiteHeader />

      <section className="container-page py-16">
        <p className="section-kicker">Werkwijze</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-700 text-ink md:text-4xl">
          Van kapot toestel tot afspraak, in vier simpele stappen
        </h1>
      </section>

      <section className="container-page grid gap-6 pb-20 md:grid-cols-2">
        {STEPS.map((step) => (
          <div key={step.title} className="card p-6">
            <h2 className="font-display text-lg font-700 text-ink">{step.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{step.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-white py-20">
        <div className="container-page max-w-3xl">
          <p className="section-kicker">Veelgestelde vragen</p>
          <h2 className="mt-2 font-display text-2xl font-700 text-ink md:text-3xl">
            Nog vragen?
          </h2>

          <div className="mt-8 divide-y divide-line rounded-xl2 border border-line bg-paper">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-6">
                <summary className="cursor-pointer list-none font-display text-base font-700 text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-brand-600 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink/60">{item.a}</p>
              </details>
            ))}
          </div>

          <Link href="/boeken" className="btn-primary mt-10">
            Maak nu een afspraak
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
