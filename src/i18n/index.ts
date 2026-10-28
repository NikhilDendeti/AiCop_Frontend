import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import hi from "./locales/hi";
import te from "./locales/te";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "smartcop.lang";

const isLang = (v: unknown): v is LangCode => LANGUAGES.some((l) => l.code === v);

function initialLanguage(): LangCode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  const fromBrowser = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : "";
  return isLang(fromBrowser) ? fromBrowser : "en";
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, te: { translation: te } },
  lng: initialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

const applyLang = (lng: string) => {
  if (typeof document !== "undefined") document.documentElement.lang = lng;
};
applyLang(i18n.language);
i18n.on("languageChanged", (lng) => {
  applyLang(lng);
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
