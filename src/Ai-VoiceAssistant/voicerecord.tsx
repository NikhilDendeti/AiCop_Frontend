import React, { useState } from "react";
import { transcribeVoice } from "./transcribevoice";
import { speakText } from "./speaktext";
import { generateLegalResponse } from "./generateresponse";
import { detectLanguageCode } from "./speechtotext";

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });

      if (blob.size < 1000) {
        alert("Recording too short. Try again.");
        return;
      }

      const { text, language } = await transcribeVoice(blob);
      const langCode = "te";
      //   language && language.startsWith("te")
      //     ? "te"
      //     : language && language.startsWith("hi")
      //     ? "hi"
      //     : "en";
      //   const langCode = detectLanguageCode(language);
      console.log(langCode);

      setLanguage(langCode);
      setTranscript(text);

      const legalReply = await generateLegalResponse(text, langCode);
      setAiResponse(legalReply);
      speakText(legalReply, langCode);
    };

    recorder.start();
    setRecording(true);
    setMediaRecorder(recorder);
  };

  const handleStopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  return (
    <div className="p-4 space-y-4">
      <button
        // variant="contained"
        onClick={handleStartRecording}
        disabled={recording}
      >
        🎙️ Start Recording
      </button>
      <button
        // variant="outlined"
        onClick={handleStopRecording}
        disabled={!recording}
      >
        ⏹️ Stop & Transcribe
      </button>

      {transcript && (
        <div className="bg-blue-100 p-3 rounded">
          <h4>📝 You said:</h4>
          <p>{transcript}</p>
        </div>
      )}

      {aiResponse && (
        <div className="bg-green-100 p-3 rounded">
          <h4>🤖 Legal Assistant:</h4>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
