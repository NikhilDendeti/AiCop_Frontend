export const transcribeVoice = async (
  audioBlob: Blob,
  language: "en" | "hi" | "te" = "en"
) => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "te");
  formData.append("language", language);

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  //   const result = await response.json();
  const data = await response.json();
  //   if (!response.ok) {
  //     console.error("❌ Transcription API error:", data);
  //     throw new Error(data?.error?.message || "Transcription failed");
  //   }
  return { text: data.text, language: data.language };
};
