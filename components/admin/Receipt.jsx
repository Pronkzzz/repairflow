import { SITE_NAME } from "@/lib/seo";

function formatEuro(cents) {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAYMENT_LABELS = { cash: "Cash", online: "Online" };

// Wordt altijd gerenderd (off-screen via CSS in globals.css) zodra er een
// bon is om te printen, zodat window.print() in PosTerminal/OrderHistory
// meteen de juiste inhoud vindt.
export default function Receipt({ order }) {
  if (!order) return null;

  return (
    <div className="receipt-print-area font-mono text-[11px] leading-tight text-black">
      <div className="text-center">
        <div className="text-sm font-bold">{SITE_NAME}</div>
        <div>Kassabon</div>
      </div>

      <div className="my-2 border-t border-dashed border-black" />

      <div>Bon nr: {String(order.orderNumber).padStart(5, "0")}</div>
      <div>Datum: {formatDateTime(order.createdAt)}</div>
      {order.customerName && <div>Klant: {order.customerName}</div>}
      {order.cashierEmail && <div>Medewerker: {order.cashierEmail}</div>}

      <div className="my-2 border-t border-dashed border-black" />

      {order.items.map((item) => (
        <div key={item.id} className="mb-1">
          <div className="flex justify-between gap-2">
            <span>{item.name}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>
              {item.quantity} x {formatEuro(item.unitPriceCents)}
            </span>
            <span>{formatEuro(item.lineTotalCents)}</span>
          </div>
        </div>
      ))}

      <div className="my-2 border-t border-dashed border-black" />

      <div className="flex justify-between text-sm font-bold">
        <span>Totaal</span>
        <span>{formatEuro(order.totalCents)}</span>
      </div>
      <div className="flex justify-between">
        <span>Betaalmethode</span>
        <span>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
      </div>

      {order.notes && (
        <>
          <div className="my-2 border-t border-dashed border-black" />
          <div>{order.notes}</div>
        </>
      )}

      <div className="my-2 border-t border-dashed border-black" />
      <div className="text-center">Bedankt!</div>
    </div>
  );
}
