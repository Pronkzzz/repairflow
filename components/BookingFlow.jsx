"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DeviceImage from "./DeviceImage";

const STEPS = ["Toestel", "Model", "Reparatie", "Tijdstip", "Gegevens"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [categoryId, setCategoryId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [serviceId, setServiceId] = useState(searchParams.get("dienst") || null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeSlot, setTimeSlot] = useState(null);

  const [form, setForm] = useState({ customerName: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationId, setConfirmationId] = useState(null);

  // Laad diensten
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        const cats = data.categories || [];
        setCategories(cats);

        const preselectSlug = searchParams.get("categorie");
        const preselect = cats.find((c) => c.slug === preselectSlug);
        if (preselect) {
          setCategoryId(preselect.id);

          const modelSlug = searchParams.get("model");
          const preselectModel = preselect.models?.find((m) => m.slug === modelSlug);
          if (preselectModel) setModelId(preselectModel.id);

          if (serviceId) {
            setStep(3);
          } else if (preselectModel || !preselect.models || preselect.models.length === 0) {
            setStep(2);
          } else {
            setStep(1);
          }
        }
      })
      .finally(() => setLoadingCategories(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Laad tijdslots wanneer datum verandert (stap 4)
  useEffect(() => {
    if (step !== 3) return;
    setLoadingSlots(true);
    setTimeSlot(null);
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [date, step]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const hasModels = (selectedCategory?.models?.length || 0) > 0;
  const selectedModel = useMemo(
    () => selectedCategory?.models?.find((m) => m.id === modelId),
    [selectedCategory, modelId]
  );
  const availableServices = useMemo(() => {
    if (!selectedCategory) return [];
    if (!selectedModel) return selectedCategory.services.filter((s) => !s.modelId);
    const specific = selectedCategory.services.filter((s) => s.modelId === selectedModel.id);
    return specific.length ? specific : selectedCategory.services.filter((s) => !s.modelId);
  }, [selectedCategory, selectedModel]);

  const selectedService = useMemo(
    () => availableServices.find((s) => s.id === serviceId),
    [availableServices, serviceId]
  );

  function durationText(service) {
    return service?.durationUnit === "uur"
      ? `±${service.durationMin / 60} uur`
      : `±${service?.durationMin} min`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, modelId, date, timeSlot, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er ging iets mis. Probeer opnieuw.");
        return;
      }
      setConfirmationId(data.id);
    } catch {
      setError("Kon geen verbinding maken. Controleer je internet en probeer opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationId) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint/10 text-2xl">✅</div>
        <h2 className="mt-4 font-display text-2xl font-700 text-ink">Afspraak bevestigd!</h2>
        <p className="mt-2 text-ink/60">
          {selectedModel ? `${selectedModel.name} — ` : ""}
          {selectedService?.name} — {date} om {timeSlot}. We sturen een bevestiging naar je e-mail.
        </p>
        <p className="mt-1 text-xs text-ink/40">Referentie: {confirmationId}</p>
        <button onClick={() => router.push("/")} className="btn-primary mt-6">
          Terug naar home
        </button>
      </div>
    );
  }

return (
  <div className="mx-auto max-w-2xl">
    {/* Stap-indicator */}
    <ol className="mb-8 flex items-center justify-between text-xs font-semibold text-ink/40">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 items-center">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              i <= step ? "bg-brand-500 text-white" : "bg-line text-ink/40"
            }`}
          >
            {i + 1}
          </span>

          <span
            className={`ml-2 hidden sm:inline ${
              i <= step ? "text-ink" : ""
            }`}
          >
            {label}
          </span>

          {i < STEPS.length - 1 && (
            <span className="mx-3 h-px flex-1 bg-line" />
          )}
        </li>
      ))}
    </ol>

    {/* Stap 1: Toestel */}
    {step === 0 && (
      <div>
        <h2 className="font-display text-xl font-700 text-ink">
          Welk toestel?
        </h2>

        <p className="mt-1 text-sm text-ink/50">
          Kies eerst het merk van je toestel.
        </p>

        {loadingCategories ? (
          <p className="mt-4 text-sm text-ink/50">
            Laden…
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id);
                  setModelId(null);
                  setServiceId(null);
                  setStep(cat.models?.length > 0 ? 1 : 2);
                }}
                className={`group rounded-2xl border p-5 text-center transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop ${
                  categoryId === cat.id
                    ? "border-brand-500 bg-brand-50 shadow-sm"
                    : "border-line bg-white"
                }`}
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                  <DeviceImage
                    slug={cat.slug}
                    icon={cat.icon}
                    imageUrl={cat.imageUrl}
                    name={cat.name}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4">
                  <span className="font-display text-base font-700 text-ink">
                    {cat.name}
                  </span>
                </div>

                <div className="mt-1 text-xs text-ink/40">
                  {cat.models?.length || 0} modellen
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Stap 2: Model */}
    {step === 1 && selectedCategory && (
      <div>
        <h2 className="font-display text-xl font-700 text-ink">
          Welk model {selectedCategory.name}?
        </h2>

        <p className="mt-1 text-sm text-ink/50">
          Kies het model van je {selectedCategory.name}.
        </p>

        <div className="mt-6 space-y-8">
          {/* Modellen per sectie */}
          {selectedCategory.sections?.map((section) => {
            const sectionModels = selectedCategory.models.filter(
              (m) => m.sectionId === section.id
            );

            if (!sectionModels.length) return null;

            return (
              <div key={section.id}>
                <h3 className="mb-3 font-display text-lg font-700 text-ink">
                  {section.name}
                </h3>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {sectionModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setModelId(m.id);
                        setServiceId(null);
                        setStep(2);
                      }}
                      className={`group rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop ${
                        modelId === m.id
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-line bg-white"
                      }`}
                    >
                      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                        <DeviceImage
                          slug={m.slug}
                          icon={m.icon}
                          imageUrl={m.imageUrl}
                          name={m.name}
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-3 font-display text-sm font-700 text-ink">
                        {m.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Modellen zonder sectie */}
          {selectedCategory.models.filter((m) => !m.sectionId).length > 0 && (
            <div>
              {selectedCategory.sections?.length > 0 && (
                <h3 className="mb-3 font-display text-lg font-700 text-ink">
                  Overige modellen
                </h3>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedCategory.models
                  .filter((m) => !m.sectionId)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setModelId(m.id);
                        setServiceId(null);
                        setStep(2);
                      }}
                      className={`group rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-pop ${
                        modelId === m.id
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-line bg-white"
                      }`}
                    >
                      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                        <DeviceImage
                          slug={m.slug}
                          icon={m.icon}
                          imageUrl={m.imageUrl}
                          name={m.name}
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-3 font-display text-sm font-700 text-ink">
                        {m.name}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <StepNav onBack={() => setStep(0)} />
      </div>
    )}

    {/* Stap 3: Reparatie */}
    {step === 2 && selectedModel && (
      <div>
        <h2 className="font-display text-xl font-700 text-ink">
          Welke reparatie?
        </h2>

        <p className="mt-1 text-sm text-ink/50">
          Kies de reparatie voor je {selectedModel.name}.
        </p>

        <div className="mt-5 space-y-3">
          {selectedModel.services?.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setStep(3);
              }}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:border-brand-400 ${
                serviceId === s.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-line bg-white"
              }`}
            >
              <div>
                <div className="font-semibold text-ink">
                  {s.name}
                </div>

                {s.durationMinutes && (
                  <div className="mt-1 text-xs text-ink/50">
                    ±{s.durationMinutes} min
                  </div>
                )}
              </div>

              <span className="font-semibold text-brand-600">
                €{(s.priceCents / 100).toFixed(0)}
              </span>
            </button>
          ))}
        </div>

        <StepNav
          onBack={() => setStep(selectedCategory?.models?.length ? 1 : 0)}
        />
      </div>
    )}

    {/* Stap 4: Datum + tijd */}
    {step === 3 && (
      <div>
        <h2 className="font-display text-xl font-700 text-ink">
          Kies datum en tijdstip
        </h2>

        <input
          type="date"
          min={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-4 w-full rounded-lg border border-line px-4 py-2.5"
        />

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {loadingSlots ? (
            <p className="col-span-full text-sm text-ink/50">
              Tijdslots laden…
            </p>
          ) : slots.length === 0 ? (
            <p className="col-span-full text-sm text-ink/50">
              Geen vrije slots op deze dag. Kies een andere datum.
            </p>
          ) : (
            slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`rounded-lg border py-2 text-sm font-medium transition hover:border-brand-400 ${
                  timeSlot === slot
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-line text-ink"
                }`}
              >
                {slot}
              </button>
            ))
          )}
        </div>

        <StepNav
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          nextDisabled={!timeSlot}
        />
      </div>
    )}

    {/* Stap 5: Gegevens */}
    {step === 4 && (
      <form onSubmit={handleSubmit}>
        <h2 className="font-display text-xl font-700 text-ink">
          Jouw gegevens
        </h2>

        <div className="mt-5 space-y-4">
          <Field label="Naam">
            <input
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName: e.target.value,
                })
              }
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </Field>

          <Field label="Telefoon">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </Field>

          <Field label="Opmerkingen (optioneel)">
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              rows={3}
              className="w-full rounded-lg border border-line px-4 py-2.5"
            />
          </Field>
        </div>

        {selectedService && (
          <div className="mt-5 rounded-lg bg-paper p-4 text-sm text-ink/70">
            <strong className="text-ink">
              {selectedModel ? `${selectedModel.name} — ` : ""}
              {selectedService.name}
            </strong>{" "}
            — {date} om {timeSlot} — €
            {(selectedService.priceCents / 100).toFixed(0)}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm font-medium text-rose">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="btn-secondary"
          >
            Terug
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-60"
          >
            {submitting ? "Bezig…" : "Afspraak bevestigen"}
          </button>
        </div>
      </form>
    )}
  </div>
);

function ModelButton({ model, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition hover:border-brand-400 ${
        selected ? "border-brand-500 bg-brand-50" : "border-line"
      }`}
    >
      <span className="font-medium text-ink">{model.name}</span>
    </button>
  );
}

function StepNav({ onBack, onNext, nextDisabled }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button onClick={onBack} className="btn-secondary">
        Terug
      </button>
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="btn-primary disabled:opacity-60">
          Verder
        </button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}
