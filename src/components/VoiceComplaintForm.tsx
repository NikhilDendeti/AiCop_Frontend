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
import ComplaintPreview from "./complaintpreview";
import { apiURL } from "@/utils/apiUtil";

interface VoiceComplaintFormProps {
  onBack: () => void;
}

const VoiceComplaintForm = ({ onBack }: VoiceComplaintFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [caseType, setCaseType] = useState("Theft");
  const [complaint, setComplaint] = useState<any>(null);

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
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
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
        setRecordedChunks([]);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data]);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
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

  const generateComplaint = async () => {
    setIsGenerating(true);
    setTimeout(async () => {
      setIsGenerating(false);
      toast({
        title: "Complaint Generated",
        description:
          "Your legal complaint has been drafted with relevant IPC sections.",
      });

      const complaintId = "c46c7259-4616-447a-9aeb-42997d9787b1";
      if (complaintId) {
        navigate(`/complaint/${complaintId}`);
      }
    }, 3000);
  };

  const handleSubmitComplaint = async () => {
    try {
      const videoEntries = Object.entries(responses).filter(
        ([_, resp]) => resp?.videoBlob
      );

      const evidenceArray = await Promise.all(
        videoEntries.map(async ([key, resp]) => {
          const base64 = await blobToBase64(resp.videoBlob!);
          return {
            file_url: base64,
            type: "video",
          };
        })
      );

      const incidentLocationBlob = responses.when_where?.videoBlob;
      const incidentTypeBlob = responses.incident?.videoBlob;

      const incident_location_video_url = incidentLocationBlob
        ? await blobToBase64(incidentLocationBlob)
        : "";

      const incident_type_video_url = incidentTypeBlob
        ? await blobToBase64(incidentTypeBlob)
        : "";

      const payload = {
        incident_summary: responses.incident?.toString() || "",
        case_type: caseType,
        location: responses.when_where?.toString() || "",
        incident_date: "2025-06-15",
        incident_time: "15:45",
        is_cognizable: true,
        incident_location_video_url,
        incident_type_video_url,
        accused: [
          {
            name: "Unknown",
            description: responses.involved?.toString() || "",
            contact_info: "Unknown",
            statement: responses.involved?.toString() || "",
          },
        ],
        witnesses: [
          {
            name: "Witness",
            contact_info: "N/A",
            statement: responses.witnesses?.toString() || "",
          },
        ],
        evidence: evidenceArray,
      };

      console.log("Payload:", JSON.stringify(payload)); // 👈 Debug log

      const finalRes = await fetch(`${apiURL}/create_complaint/v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const finalJson = await finalRes.json();

      if (!finalRes.ok)
        throw new Error(finalJson.message || "Complaint submission failed");

      toast({
        title: "Complaint Submitted",
        description: `Complaint ID: ${finalJson.complaint_id}`,
      });

      return finalJson.complaint_id;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
      });
      return null;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  if (currentStep > questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <header className="bg-white shadow-sm border-b-2 border-green-400">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Complaint Generated
                </h1>
                <p className="text-sm text-gray-600">
                  Review and submit your legal complaint
                </p>
              </div>
            </div>
          </div>
        </header>

        <ComplaintPreview complaintId={complaint} />

        {/* <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 mr-2 text-green-600" />
                Generated Legal Complaint
              </CardTitle>
              <div className="flex space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  Auto-drafted
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  IPC Sections Added
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">
                  COMPLAINT UNDER SECTION 154 OF THE CODE OF CRIMINAL PROCEDURE,
                  1973
                </h3>
                <div className="space-y-4 text-sm">
                  <p>
                    <strong>To:</strong> The Station House Officer, [Police
                    Station Name]
                  </p>
                  <p>
                    <strong>Subject:</strong> Complaint regarding Mobile Phone
                    Theft
                  </p>

                  <div className="space-y-3">
                    <p>Sir/Madam,</p>
                    <p>
                      I, the undersigned, hereby lodge this complaint regarding
                      the theft of my mobile phone that occurred while I was
                      traveling on a public bus.
                    </p>

                    <p>
                      <strong>Details of the Incident:</strong>
                    </p>
                    <p>
                      The incident took place on [Date] at approximately [Time]
                      while I was traveling from [Location A] to [Location B] on
                      bus number [Bus Number]. During the journey, my mobile
                      phone (Brand: [Brand], Model: [Model], IMEI: [IMEI
                      Number]) was stolen from my bag.
                    </p>

                    <p>
                      <strong>Relevant IPC Sections:</strong>
                    </p>
                    <ul className="list-disc ml-6">
                      <li>Section 378 - Theft</li>
                      <li>Section 379 - Punishment for theft</li>
                    </ul>

                    <p>
                      I request you to kindly register an FIR and investigate
                      the matter. I am ready to cooperate with the investigation
                      and provide any additional information required.
                    </p>

                    <p>Thanking you,</p>
                    <p>
                      [Your Name]
                      <br />
                      [Your Address]
                      <br />
                      [Contact Number]
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Complaint
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    );
  }

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

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Case Type
          </label>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="murder">Murder</option>
            <option value="theft">Theft</option>
            <option value="crime_against_women">Crime Against Women</option>
            <option value="public_nuisance">Public Nuisance</option>
          </select>
        </div>

        {isGenerating ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Generating Your Legal Complaint
              </h3>
              <p className="text-gray-600">
                AI is drafting your complaint and adding relevant IPC
                sections...
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
                      ? "Generate Complaint"
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
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}
