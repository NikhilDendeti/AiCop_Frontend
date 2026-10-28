/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mic, MicOff, FileText, Send, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { createComplaint, referenceApi } from "@/api/filing";
import { newIdempotencyKey } from "@/api/client";
import { uploadEvidence } from "@/api/evidence";
import { notify } from "@/lib/notify";
import { isApiError } from "@/api/errors";
import { IntakeChat } from "@/features/citizen/IntakeChat";
import { SectionsPreview } from "@/features/citizen/SectionsPreview";

interface VoiceComplaintFormProps {
  onBack: () => void;
}

const VoiceComplaintForm = ({ onBack }: VoiceComplaintFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [caseType, setCaseType] = useState("theft");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [stationId, setStationId] = useState("");
  const [stationError, setStationError] = useState<string | null>(null);
  // One key per filing attempt: a retry after a network error reuses it, so the server cannot create a duplicate.
  const idempotencyKey = useRef(newIdempotencyKey());
  const caseTypes = useQuery({ queryKey: ["case-types"], queryFn: referenceApi.caseTypes, staleTime: Infinity });
  const stations = useQuery({ queryKey: ["stations"], queryFn: referenceApi.stations, staleTime: Infinity });
  const today = new Date().toISOString().slice(0, 10);

  interface Response {
    text?: string;
    videoBlob?: Blob;
    toString(): string;
  }

  // Implement toString for Response interface
  class ResponseImpl implements Response {
    text?: string;
    videoBlob?: Blob;

    constructor(text?: string, videoBlob?: Blob) {
      this.text = text;
      this.videoBlob = videoBlob;
    }

    toString(): string {
      return this.text || "";
    }
  }

  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const questions = [
    {
      id: "incident",
      question: "What happened? Please describe the incident in detail.",
      telugu: "ఏమి జరిగింది? దయచేసి సంఘటనను వివరంగా వర్ణించండి.",
      hindi: "क्या हुआ? कृपया घटना का विस्तार से वर्णन करें।",
    },
    {
      id: "when_where",
      question: "When and where did this incident occur?",
      telugu: "ఈ సంఘటన ఎప్పుడు మరియు ఎక్కడ జరిగింది?",
      hindi: "यह घटना कब और कहाँ घटी?",
    },
    {
      id: "involved",
      question:
        "Who was involved? Can you provide any details about the person(s)?",
      telugu: "ఎవరు పాల్గొన్నారు? వ్యక్తుల గురించి ఏవైనా వివరాలు అందించగలరా?",
      hindi:
        "कौन शामिल था? क्या आप व्यक्ति(यों) के बारे में कोई विवरण दे सकते हैं?",
    },
    {
      id: "property",
      question: "Did you lose any property or money? If yes, please specify.",
      telugu:
        "మీరు ఏదైనా ఆస్తి లేదా డబ్బు కోల్పోయారా? అవును అయితే, దయచేసి పేర్కొనండి.",
      hindi: "क्या आपकी कोई संपत्ति या पैसा चोरी हुआ? यदि हाँ, तो कृपया बताएं।",
    },
    {
      id: "witnesses",
      question:
        "Were there any witnesses? Can you provide their contact details?",
      telugu: "ఏవైనా సాక్షులు ఉన్నారా? వారి సంప్రదింపు వివరాలను అందించగలరా?",
      hindi: "क्या कोई गवाह थे? क्या आप उनके संपर्क विवरण दे सकते हैं?",
    },
  ];

  const currentQuestion = questions[currentStep - 1];
  const progress = (currentStep / questions.length) * 100;

  const getQuestionText = () => {
    switch (selectedLanguage) {
      case "te":
        return currentQuestion.telugu;
      case "hi":
        return currentQuestion.hindi;
      default:
        return currentQuestion.question;
    }
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      mediaRecorder?.stop();
      toast({ title: "Recording stopped" });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
          const url = URL.createObjectURL(blob);
          setVideoURL(url);

          handleVideoResponse(currentQuestion.id, blob);
          toast({
            title: "Recording complete",
            description: "Your response video has been saved.",
          });
        };

        recorder.start();
        setIsRecording(true);

        toast({
          title: "Recording started",
          description: "Recording video and audio now...",
        });
      } catch (err) {
        toast({ title: "Recording failed", description: String(err) });
      }
    }
  };

  const handleVideoResponse = (questionId: string, videoBlob: Blob) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: new ResponseImpl(prev[questionId]?.toString(), videoBlob),
    }));
  };

  const handleTextResponse = (questionId: string, response: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: new ResponseImpl(response.trim()),
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      generateComplaint();
    }
  };

  const stationList = stations.data ?? [];
  const effectiveStation = stationId || (stationList.length === 1 ? stationList[0].station_id : "");
  // A complaint with no station is invisible to every officer, so a station is required.
  const missingDetails =
    !incidentDate || !incidentTime || !responses.incident?.toString().trim() || (stations.isSuccess && !effectiveStation);

  const generateComplaint = async () => {
    if (missingDetails) {
      notify.error("Details missing", "Please describe the incident, enter when it happened and choose a police station.");
      return;
    }
    setIsGenerating(true);
    setStationError(null);
    try {
      const answer = (id: string) => responses[id]?.toString() || "";
      const { complaint_id } = await createComplaint(
        {
          case_type: caseType,
          incident_summary: answer("incident"),
          location: answer("when_where") || "Not stated",
          incident_date: incidentDate,
          incident_time: incidentTime.length === 5 ? `${incidentTime}:00` : incidentTime,
          ...(effectiveStation ? { station_id: effectiveStation } : {}),
          is_cognizable: true,
          accused: answer("involved")
            ? [{ name: "Unknown", description: answer("involved"), contact_info: "", statement: answer("involved") }]
            : [],
          witnesses: answer("witnesses")
            ? [{ name: "Witness", contact_info: "", statement: answer("witnesses") }]
            : [],
        },
        idempotencyKey.current,
      );
      idempotencyKey.current = newIdempotencyKey();

      // Video answers are evidence files, never part of the JSON body.
      const videos = Object.entries(responses).filter(([, r]) => r?.videoBlob);
      let failed = 0;
      for (const [id, r] of videos) {
        try {
          await uploadEvidence(complaint_id, r.videoBlob!, `answer-${id}.webm`);
        } catch {
          failed += 1;
        }
      }
      if (failed) {
        notify.error(
          "Complaint filed, but some recordings were not uploaded",
          "You can add them again from the complaint page."
        );
      } else {
        notify.success("Complaint submitted", "Your complaint has been filed.");
      }
      navigate(`/complaint/${complaint_id}`);
    } catch (e) {
      // The same Idempotency-Key is kept, so the retry with a station is safe.
      if (isApiError(e) && e.fieldErrors.station_id) {
        setStationError(e.fieldErrors.station_id);
        setCurrentStep(1);
      } else {
        notify.apiError(e);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(getQuestionText());

    // Get available voices
    const voices = speechSynthesis.getVoices();

    // Choose voice based on language preference
    const selectedVoice =
      selectedLanguage === "hi"
        ? voices.find((v) => v.lang === "hi-IN") ||
          voices.find((v) => v.name.includes("Google हिन्दी"))
        : selectedLanguage === "te"
        ? voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) // Best for Roman Telugu
        : voices.find((v) => v.lang === "en-US");

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Tone adjustments
    utterance.pitch = 1.2; // Slightly higher
    utterance.rate = 0.9; // Calm pace

    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  File New Complaint
                </h1>
                <p className="text-sm text-gray-600">
                  Voice-guided complaint filing
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedLanguage === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage("en")}
              >
                English
              </Button>
              <Button
                variant={selectedLanguage === "hi" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage("hi")}
              >
                हिंदी
              </Button>
              <Button
                variant={selectedLanguage === "te" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage("te")}
              >
                తెలుగు
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <IntakeChat
          language={selectedLanguage}
          onReport={(r) => {
            setCaseType(r.case_type);
            setIncidentDate(r.incident_date);
            setIncidentTime(r.incident_time.slice(0, 5));
            setResponses((prev) => ({
              ...prev,
              incident: new ResponseImpl(r.incident_summary, prev.incident?.videoBlob),
              when_where: new ResponseImpl(r.location, prev.when_where?.videoBlob),
            }));
          }}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Case Type
          </label>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(caseTypes.data ?? [{ case_type_id: "theft", name: "theft", label: "Theft" }]).map((t) => (
              <option key={t.name} value={t.name}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="incident-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date of incident
            </label>
            <input
              id="incident-date"
              type="date"
              max={today}
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="incident-time" className="block text-sm font-medium text-gray-700 mb-1">
              Time of incident
            </label>
            <input
              id="incident-time"
              type="time"
              value={incidentTime}
              onChange={(e) => setIncidentTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
              Police station
            </label>
            <select
              id="station"
              value={effectiveStation}
              required
              onChange={(e) => setStationId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm"
            >
              <option value="" disabled>Select a station</option>
              {(stations.data ?? []).map((st) => (
                <option key={st.station_id} value={st.station_id}>
                  {st.name}
                </option>
              ))}
            </select>
            {stationError && (
              <p role="alert" className="text-sm text-red-600 mt-1">
                {stationError}
              </p>
            )}
          </div>
        </div>

        {isGenerating ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Submitting Your Complaint
              </h3>
              <p className="text-gray-600">
                Please wait while we file your complaint and upload your recordings...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Question {currentStep}
                <Volume2
                  onClick={handleSpeak}
                  className="h-5 w-5 ml-2 text-blue-600"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-blue-900">
                  {getQuestionText()}
                </p>
              </div>

              {/* Video Recording */}
              <div className="text-center">
                <video
                  ref={videoRef}
                  className="mx-auto rounded-lg border border-gray-300 shadow-sm"
                  width={600}
                  height={400}
                  autoPlay
                  muted
                />

                <Button
                  size="sm"
                  onClick={handleRecordingToggle}
                  className={`mt-4 w-20 h-20 rounded-full ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>

                <p className="mt-2 text-sm text-gray-600">
                  {isRecording
                    ? "Recording..."
                    : "Tap to record your video answer"}
                </p>
              </div>

              {/* Text Response */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Or type your response:
                </label>
                {currentQuestion.id === "incident" && (
                  <div className="mb-3">
                    <SectionsPreview summary={responses.incident?.toString() || ""} />
                  </div>
                )}
                <Textarea
                  placeholder="Type your response here..."
                  value={responses[currentQuestion.id]?.toString() || ""}
                  onChange={(e) =>
                    handleTextResponse(currentQuestion.id, e.target.value)
                  }
                  rows={4}
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <Button
                    onClick={handleNext}
                    disabled={
                      !(
                        responses[currentQuestion.id]?.toString().trim() ||
                        responses[currentQuestion.id]?.videoBlob
                      )
                    }
                  >
                    {currentStep === questions.length
                      ? "Submit Complaint"
                      : "Next"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceComplaintForm;
