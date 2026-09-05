"use client";

import { useMemo, useState } from "react";

function ProductRow({ product, onChanged }) {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [sku, setSku] = useState(product.sku || "");
  const [price, setPrice] = useState((product.priceCents / 100).toString());
  const [stock, setStock] = useState(String(product.stock));
  const [active, setActive] = useState(product.active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(overrides = {}) {
    setSaving(true);
    setSaved(false);
    const payload = {
      name,
      category,
      sku: sku || null,
      priceCents: Math.round(Number(price) * 100),
      stock: Math.round(Number(stock)),
      active,
      ...overrides,
    };
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      onChanged();
      setTimeout(() => setSaved(false), 1500);
    }
  }

  async function remove() {
    if (!confirm(`"${product.name}" verwijderen?`)) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    onChanged();
  }

  const lowStock = product.stock <= 3;

  return (
    <tr>
      <td className="px-4 py-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => save()}
          className="w-full min-w-[160px] rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-ink hover:border-line focus:border-line focus:outline-none"
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onBlur={() => save()}
          className="w-full min-w-[120px] rounded-lg border border-transparent px-2 py-1.5 text-sm text-ink/70 hover:border-line focus:border-line focus:outline-none"
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onBlur={() => save()}
          placeholder="—"
          className="w-full min-w-[100px] rounded-lg border border-transparent px-2 py-1.5 text-sm text-ink/50 hover:border-line focus:border-line focus:outline-none"
        />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center rounded-lg border border-line px-2">
          <span className="text-ink/40">€</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => save()}
            className="w-20 border-0 px-1 py-1.5 focus:outline-none"
          />
        </div>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          onBlur={() => save()}
          className={`w-20 rounded-lg border px-2 py-1.5 text-sm focus:outline-none ${
            lowStock ? "border-amber/50 bg-amber/5 text-amber" : "border-line text-ink"
          }`}
        />
      </td>
      <td className="px-4 py-2.5">
        <label className="flex items-center gap-1.5 text-xs text-ink/60">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => {
              setActive(e.target.checked);
              save({ active: e.target.checked });
            }}
          />
          Actief
        </label>
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-3">
          {saving && <span className="text-xs text-ink/40">opslaan…</span>}
          {saved && <span className="text-xs text-mint">✓</span>}
          <button type="button" onClick={remove} className="text-xs font-medium text-rose hover:underline">
            Verwijderen
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddProductForm({ onAdded }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || price === "") return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category: category.trim() || "Overig",
        sku: sku.trim() || null,
        priceCents: Math.round(Number(price) * 100),
        stock: Math.round(Number(stock) || 0),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);

    if (!res.ok) {
      setError(data.error || "Kon product niet toevoegen.");
      return;
    }
    setName("");
    setCategory("");
    setSku("");
    setPrice("");
    setStock("0");
    onAdded();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-lg bg-paper p-4">
      <label className="min-w-[180px] flex-1">
        <span className="mb-1 block text-xs font-medium text-ink/50">Productnaam</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="bv. Screenprotector iPhone 13"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-40">
        <span className="mb-1 block text-xs font-medium text-ink/50">Categorie</span>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="bv. Hoesjes"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-32">
        <span className="mb-1 block text-xs font-medium text-ink/50">SKU (optioneel)</span>
        <input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Prijs (€)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="19.99"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <label className="w-24">
        <span className="mb-1 block text-xs font-medium text-ink/50">Voorraad</span>
        <input
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>

      <button type="submit" disabled={adding} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
        {adding ? "Bezig…" : "Toevoegen"}
      </button>
      {error && <p className="w-full text-sm font-medium text-rose">{error}</p>}
    </form>
  );
}

export default function ProductManager({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setProducts(data.products || []);
    setRefreshing(false);
  }

  const byCategory = useMemo(() => {
    const groups = {};
    for (const p of products) {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="mb-3 font-display text-lg font-700 text-ink">Nieuw product</h2>
        <AddProductForm onAdded={refresh} />
      </div>

      {byCategory.length === 0 && (
        <p className="text-sm text-ink/40">Nog geen producten toegevoegd.</p>
      )}

      {byCategory.map(([category, items]) => (
        <div key={category} className="card overflow-hidden">
          <div className="border-b border-line bg-paper px-5 py-3">
            <h3 className="font-display font-700 text-ink">{category}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                  <th className="px-4 py-2.5">Naam</th>
                  <th className="px-4 py-2.5">Categorie</th>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">Prijs</th>
                  <th className="px-4 py-2.5">Voorraad</th>
                  <th className="px-4 py-2.5"></th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-line ${refreshing ? "opacity-60" : ""}`}>
                {items.map((product) => (
                  <ProductRow key={product.id} product={product} onChanged={refresh} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
