import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";

/** Small language picker; the choice is remembered in this browser. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <div role="group" aria-label={t("common.language")} className={className ?? "flex gap-1"}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={i18n.language === l.code}
          onClick={() => void i18n.changeLanguage(l.code)}
          className={`px-2 py-1 text-xs rounded border ${
            i18n.language === l.code ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
