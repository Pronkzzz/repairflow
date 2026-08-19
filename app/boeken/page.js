import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingFlow from "@/components/BookingFlow";
import { getLang } from "@/lib/i18n";

export const metadata = { title: "Afspraak maken — RepairFlow" };

export default async function BoekenPage({ searchParams }) {
  const sp = await searchParams;
  const lang = getLang(sp);

  return (
    <>
      <SiteHeader searchParams={sp} />
      <section className="container-page py-14">
        <h1 className="mb-10 text-center font-display text-3xl font-800 text-ink">
          {lang === "en" ? "Book an appointment" : "Maak een afspraak"}
        </h1>
        <Suspense fallback={<p className="text-center text-ink/50">Laden…</p>}>
          <BookingFlow />
        </Suspense>
      </section>
      <SiteFooter lang={lang} />
    </>
  );
}
