export const generateLegalResponse = async (
  query: string,
  langCode: "en" | "hi" | "te"
): Promise<string> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const languageInstructions: Record<"en" | "hi" | "te", string> = {
    en: "Respond in English.",
    hi: "Respond in Hindi using Devanagari or Roman script.",
    te: "Respond in **Roman Telugu**. Never use Telugu Unicode.",
  };

  const fallbackMessages = {
    en: "This query is outside my legal scope. Please ask about IPC, CrPC, RTI, NCRB, or police procedures.",
    hi: "यह सवाल मेरी कानूनी सीमा से बाहर है। कृपया IPC, CrPC, RTI या पुलिस प्रक्रिया के बारे में पूछें।",
    te: "Mee prashna legal scope lo ledu. Criminal laws, FIR, RTI gurinchi adugandi.",
  };

  const systemPrompt = `
  You are SmartCopAI Voice — a multilingual legal voice assistant trained on Indian criminal laws (IPC, CrPC, RTI, NCRB, BPRD SOPs).
  
  🌐 Instructions:
  - ${languageInstructions[langCode]}
  - Never mix languages.
  - Do not translate between languages.
  - If out-of-scope, say:
    "${fallbackMessages[langCode]}"
  
  📋 Response format:
  - 📿 Applicable Law (e.g., IPC section 379)
  - ✅ Suggested Action
  - 📜 Citation (e.g., IPC, p.64)
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content || "Not available in legal documents."
  );
};

export default generateLegalResponse;
