import { api } from "@/api/client";
import { isApiError } from "@/api/errors";
import { config } from "@/config";

export type VoiceLang = "en" | "hi" | "te";

/** True when the server-side voice assistant (planned B2) is switched on for this build. */
export const voiceAssistantEnabled = () => config.enableVoiceAssistant;

export interface LegalAnswer {
  answer: string;
  in_scope: boolean;
  disclaimer: string;
  sources: string[];
  ai_available: boolean;
}

const SPEECH_LOCALE: Record<VoiceLang, string> = { en: "en-IN", hi: "hi-IN", te: "te-IN" };

const extFor = (type: string) => (type.includes("ogg") ? "ogg" : type.includes("mp4") ? "m4a" : "webm");

/** Speech to text through the backend (POST /voice/transcribe/). */
export async function transcribeVoice(audio: Blob, language: VoiceLang = "en") {
  const form = new FormData();
  form.append("audio", audio, `recording.${extFor(audio.type)}`);
  form.append("language", language);
  return api.post<{ text: string; language: string }>("/voice/transcribe/", form);
}

/** General legal/procedure help through the backend (POST /legal-assistant/ask/). */
export const askLegalAssistant = (question: string, language: VoiceLang = "en") =>
  api.post<LegalAnswer>("/legal-assistant/ask/", { question, language });

let currentAudio: HTMLAudioElement | null = null;

/** Browser speech as the fallback voice. */
export function speakWithBrowser(text: string, lang: VoiceLang): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SPEECH_LOCALE[lang];
  window.speechSynthesis.speak(u);
  return true;
}

/** Read text aloud: backend voice when available, otherwise the browser's own voice. */
export async function speakText(text: string, lang: VoiceLang): Promise<boolean> {
  stopSpeaking();
  if (voiceAssistantEnabled()) {
    try {
      const res = await api.post<Response>("/voice/speak/", { text: text.slice(0, 1000), language: lang }, { raw: true });
      const url = URL.createObjectURL(await res.blob());
      currentAudio = new Audio(url);
      await currentAudio.play();
      return true;
    } catch (e) {
      if (!isApiError(e) || (e.status !== 503 && e.status !== 404)) throw e;
    }
  }
  return speakWithBrowser(text, lang);
}

export function stopSpeaking() {
  currentAudio?.pause();
  currentAudio = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
