import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingFlow from "@/components/BookingFlow";

export const metadata = { title: "Afspraak maken — RepairFlow" };

export default function BoekenPage() {
  return (
    <>
      <SiteHeader />
      <section className="container-page py-14">
        <h1 className="mb-10 text-center font-display text-3xl font-800 text-ink">
          Maak een afspraak
        </h1>
        <Suspense fallback={<p className="text-center text-ink/50">Laden…</p>}>
          <BookingFlow />
        </Suspense>
      </section>
      <SiteFooter />
    </>
  );
}
