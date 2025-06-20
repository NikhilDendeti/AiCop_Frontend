// 📁 utils/detectLanguage.ts

export const detectLanguageCode = (rawLang: string): "en" | "hi" | "te" => {
  if (!rawLang) return "en";

  if (rawLang.startsWith("te")) return "te";
  if (rawLang.startsWith("hi")) return "hi";
  return "en"; // default fallback
};
