"use client";

import { useEffect, useMemo, useState } from "react";
import Receipt from "./Receipt";

function formatEuro(cents) {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function buildRepairOptions(categories) {
  const options = [];
  for (const cat of categories) {
    const modelsById = Object.fromEntries((cat.models || []).map((m) => [m.id, m]));
    for (const service of cat.services || []) {
      const model = service.modelId ? modelsById[service.modelId] : null;
      const label = model ? `${cat.name} — ${model.name} — ${service.name}` : `${cat.name} — ${service.name}`;
      options.push({
        kind: "repair",
        id: service.id,
        label,
        priceCents: service.priceCents,
        searchText: label.toLowerCase(),
      });
    }
  }
  return options;
}

function buildProductOptions(products) {
  return products
    .filter((p) => p.active)
    .map((p) => ({
      kind: "product",
      id: p.id,
      label: `${p.name} (${p.category})`,
      priceCents: p.priceCents,
      stock: p.stock,
      searchText: `${p.name} ${p.category} ${p.sku || ""}`.toLowerCase(),
    }));
}

export default function PosTerminal() {
  const [repairOptions, setRepairOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); // { kind, id, label, unitPriceCents, quantity, stock? }

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const [printOrder, setPrintOrder] = useState(null);

  const [recentOrders, setRecentOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  async function loadCatalog() {
    setLoading(true);
    setLoadError(null);
    try {
      const [servicesRes, productsRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/admin/products"),
      ]);
      const servicesData = await servicesRes.json();
      const productsData = await productsRes.json();
      if (!servicesRes.ok || !productsRes.ok) throw new Error("Kon de catalogus niet laden.");
      setRepairOptions(buildRepairOptions(servicesData.categories || []));
      setProductOptions(buildProductOptions(productsData.products || []));
    } catch (err) {
      setLoadError(err.message || "Kon de catalogus niet laden.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRecentOrders() {
    const res = await fetch("/api/admin/orders?take=15");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setRecentOrders(data.orders || []);
  }

  useEffect(() => {
    loadCatalog();
    loadRecentOrders();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = [...repairOptions, ...productOptions];
    return all.filter((o) => o.searchText.includes(q)).slice(0, 8);
  }, [query, repairOptions, productOptions]);

  function addToCart(option) {
    setCheckoutError(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.kind === option.kind && i.id === option.id);
      if (existing) {
        if (option.kind === "product" && existing.quantity + 1 > option.stock) {
          return prev; // niet meer toevoegen dan er op voorraad is
        }
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (option.kind === "product" && option.stock < 1) return prev;
      return [
        ...prev,
        {
          kind: option.kind,
          id: option.id,
          label: option.label,
          unitPriceCents: option.priceCents,
          quantity: 1,
          stock: option.stock,
        },
      ];
    });
    setQuery("");
  }

  function changeQuantity(index, delta) {
    setCart((prev) => {
      const item = prev[index];
      const nextQty = item.quantity + delta;
      if (nextQty < 1) return prev.filter((_, i) => i !== index);
      if (item.kind === "product" && item.stock !== undefined && nextQty > item.stock) return prev;
      return prev.map((i, idx) => (idx === index ? { ...i, quantity: nextQty } : i));
    });
  }

  function removeItem(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const totalCents = cart.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

  function resetForNextSale() {
    setCart([]);
    setCustomerName("");
    setPaymentMethod(null);
    setCheckoutError(null);
  }

  async function checkout() {
    if (cart.length === 0 || !paymentMethod || checkingOut) return;
    setCheckingOut(true);
    setCheckoutError(null);

    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        customerName: customerName.trim() || null,
        items: cart.map((i) => ({
          kind: i.kind,
          serviceId: i.kind === "repair" ? i.id : undefined,
          productId: i.kind === "product" ? i.id : undefined,
          quantity: i.quantity,
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setCheckingOut(false);

    if (!res.ok) {
      setCheckoutError(data.error || "Kon de verkoop niet afronden.");
      return;
    }

    setPrintOrder(data.order);
    resetForNextSale();
    loadCatalog(); // voorraad is bijgewerkt
    loadRecentOrders();

    setTimeout(() => window.print(), 150);
  }

  async function reprint(orderId) {
    const res = await fetch(`/api/admin/orders/${orderId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    setPrintOrder(data.order);
    setTimeout(() => window.print(), 150);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <Receipt order={printOrder} />

      <div className="space-y-4">
        <div className="card p-5">
          <label className="mb-1 block text-xs font-medium text-ink/50">
            Zoek reparatie of product
          </label>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="bv. PlayStation 5 scherm, of screenprotector..."
            className="w-full rounded-lg border border-line px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
          />

          {loading && <p className="mt-2 text-sm text-ink/40">Catalogus laden…</p>}
          {loadError && <p className="mt-2 text-sm font-medium text-rose">{loadError}</p>}

          {results.length > 0 && (
            <div className="mt-3 divide-y divide-line rounded-lg border border-line">
              {results.map((option) => {
                const outOfStock = option.kind === "product" && option.stock < 1;
                return (
                  <button
                    key={`${option.kind}-${option.id}`}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => addToCart(option)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>
                      <span
                        className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          option.kind === "repair" ? "bg-brand-50 text-brand-600" : "bg-mint/10 text-mint"
                        }`}
                      >
                        {option.kind === "repair" ? "Reparatie" : "Product"}
                      </span>
                      {option.label}
                      {option.kind === "product" && (
                        <span className="ml-2 text-xs text-ink/40">
                          ({outOfStock ? "geen voorraad" : `${option.stock} op voorraad`})
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold text-ink">{formatEuro(option.priceCents)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-700 text-ink">Recente bonnen</h2>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              {showHistory ? "Verbergen" : "Tonen"}
            </button>
          </div>
          {showHistory && (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {recentOrders.length === 0 && <p className="text-sm text-ink/40">Nog geen bonnen.</p>}
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-paper"
                >
                  <span className="text-ink/70">
                    #{String(order.orderNumber).padStart(5, "0")} — {formatEuro(order.totalCents)}
                    <span className="ml-2 text-xs text-ink/40">
                      ({order.paymentMethod === "cash" ? "cash" : "online"})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => reprint(order.id)}
                    className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
                  >
                    Herprint
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card flex flex-col p-5 lg:sticky lg:top-6 lg:h-fit">
        <h2 className="mb-3 font-display text-lg font-700 text-ink">Winkelmandje</h2>

        {cart.length === 0 && <p className="text-sm text-ink/40">Nog niets toegevoegd.</p>}

        <div className="space-y-3">
          {cart.map((item, index) => (
            <div key={`${item.kind}-${item.id}`} className="flex items-start justify-between gap-2 border-b border-line pb-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.label}</p>
                <p className="text-xs text-ink/40">{formatEuro(item.unitPriceCents)} / stuk</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQuantity(index, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink/60 hover:border-ink/30"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(index, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink/60 hover:border-ink/30"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-1 shrink-0 text-xs font-medium text-rose hover:underline"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-lg font-bold text-ink">
          <span>Totaal</span>
          <span>{formatEuro(totalCents)}</span>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-ink/50">Klantnaam (optioneel)</span>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-medium text-ink/50">Betaalmethode</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                paymentMethod === "cash"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line text-ink/60 hover:border-ink/30"
              }`}
            >
              💶 Cash
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                paymentMethod === "online"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line text-ink/60 hover:border-ink/30"
              }`}
            >
              💳 Online
            </button>
          </div>
        </div>

        {checkoutError && <p className="mt-3 text-sm font-medium text-rose">{checkoutError}</p>}

        <button
          type="button"
          onClick={checkout}
          disabled={cart.length === 0 || !paymentMethod || checkingOut}
          className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkingOut ? "Bezig…" : "Afrekenen & bon printen"}
        </button>
      </div>
    </div>
  );
}
