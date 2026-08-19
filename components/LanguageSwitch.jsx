"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function LanguageSwitch({ lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function switchTo(target) {
    const params = new URLSearchParams(searchParams?.toString());
    if (target === "nl") {
      params.delete("lang");
    } else {
      params.set("lang", target);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-line text-xs font-semibold">
      <button
        type="button"
        onClick={() => switchTo("nl")}
        className={`px-2.5 py-1.5 transition ${
          lang === "nl" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
        }`}
        aria-pressed={lang === "nl"}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`px-2.5 py-1.5 transition ${
          lang === "en" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
