export const formatLegalPrompt = (
  rawLanguage: string,
  userQuery: string
): {
  langCode: "en" | "hi" | "te";
  prompt: string;
} => {
  let langCode: "en" | "hi" | "te" = "en";

  if (rawLanguage.startsWith("te")) langCode = "te";
  else if (rawLanguage.startsWith("hi")) langCode = "hi";

  const prompt = `Language: ${langCode}\nQuery: ${userQuery}`;

  return {
    langCode,
    prompt,
  };
};
