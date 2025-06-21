export const generateLegalResponse = async (
  query: string,
  langCode: "en" | "hi" | "te"
): Promise<string> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const languageInstructions: Record<"en" | "hi" | "te", string> = {
    en: "Respond fully in English.",
    hi: "Respond fully in Hindi (Devanagari or Roman script).",
    te: "Respond fully in Roman Telugu (never use Telugu Unicode).",
  };

  const fallbackMessages: Record<"en" | "hi" | "te", string> = {
    en: "This query is outside my legal scope. Please ask about IPC, CrPC, RTI, NCRB, or police SOPs.",
    hi: "यह सवाल मेरी कानूनी सीमा से बाहर है। कृपया IPC, CrPC, RTI या SOP के बारे में पूछें।",
    te: "Mee prashna legal scope lo ledu. IPC, CrPC, RTI gurinchi adugandi.",
  };

  const systemPrompt = `
You are SmartCopAI Police — a multilingual legal co-pilot assisting Indian law enforcement with document-grounded, voice-accessible, and SOP-aligned guidance.

📚 Your Source Knowledge:
You may only retrieve from the following documents:
- CrPC_1973: Arrest, FIR, bail, investigation (Secs. 41, 46, 154, etc.)
- IPC_1860: Criminal sections and punishments
- BPRD_SOPs: FIR protocols, juvenile handling, custody
- NHRC_Prison_Rights: Rights and health of detainees
- DoPT_CPIO_Guide: RTI rules for CPIOs
- DoPT_Info_Seeker_Guide: RTI rights for citizens
- DoPT_Public_Auth_Guide: RTI guidance for authorities
- NCRB_2022_Report: State/district crime data

🧠 Retrieval Format:
- IPC/CrPC: Section-wise (e.g., CrPC_1973, Sec. 41)
- SOPs/RTI/NHRC: Topic/heading based
- NCRB: Table/statistics by region and crime type

🧾 Response Schema (Always use):
- 📿 Applicable Law or SOP
- ✅ Suggested Action
- 📜 Citation (e.g., CrPC_1973, Sec. 154)

🌐 Language Rules:
- Detect and mirror query language: English, Hindi, Roman Telugu
- Telugu input (Unicode) must be converted to Roman
- Never mix or translate between languages

🛑 Out-of-Domain Rejection:
If the query is unrelated, say:
"${fallbackMessages[langCode]}"

📌 Answer this user's legal query in ${languageInstructions[langCode]}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    }),
  });

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content ||
    fallbackMessages[langCode] ||
    "Sorry, no legal guidance available."
  );
};

export default generateLegalResponse;
