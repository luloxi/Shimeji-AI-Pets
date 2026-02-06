"use client";

import { useLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage, browserLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-xl border border-foreground/20 bg-white/70 p-1">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
          language === "en"
            ? "bg-[#1159CC] text-white"
            : "text-foreground hover:bg-foreground/10"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("es")}
        className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
          language === "es"
            ? "bg-[#1159CC] text-white"
            : "text-foreground hover:bg-foreground/10"
        }`}
        title={browserLanguage === "es" ? "Detected browser language: Spanish" : "Detected browser language: English"}
      >
        ES
      </button>
    </div>
  );
}
