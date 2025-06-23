export const speakText = async (text: string, lang: "en" | "hi" | "te") => {
  // Map detected language to OpenAI voice
  const voiceMap: Record<"en" | "hi" | "te", "nova" | "onyx" | "alloy"> = {
    en: "onyx", // Natural English voice
    hi: "alloy", // Works well for Hindi in Roman script
    te: "nova", // Best match for Roman Telugu
  };

  const voice = voiceMap[lang];
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    // const response = await fetch("https://api.openai.com/v1/audio/speech", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${OPENAI_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     model: "tts-1",
    //     voice,
    //     input: text,
    //   }),
    // });

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TTS API error:", errorText);
      throw new Error("TTS failed: " + errorText);
    }

    const audioBlob = await response.blob();

    if (!audioBlob.type.startsWith("audio/")) {
      console.error("❌ Invalid blob type:", audioBlob.type);
      throw new Error("Invalid audio format received from OpenAI.");
    }

    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play();
  } catch (err) {
    console.error("TTS error:", err);
    alert("Failed to play response. Check console for details.");
  }
};

declare global {
  interface Window {
    currentAudio?: HTMLAudioElement;
  }
}

export const stopSpeaking = () => {
  if (window.currentAudio && typeof window.currentAudio.pause === "function") {
    window.currentAudio.pause();
    window.currentAudio = null;
  }
};
