import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Languages,
  Headphones,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import generateLegalResponse from "../Ai-VoiceAssistant/generateresponse";
import { speakText } from "@/Ai-VoiceAssistant/speaktext";
import { transcribeVoice } from "@/Ai-VoiceAssistant/transcribevoice";

interface VoiceAssistanceProps {
  onBack: () => void;
}

const VoiceAssistance = ({ onBack }: VoiceAssistanceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [currentStep, setCurrentStep] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  ];

  const voiceCommands = [
    {
      command: "File a complaint",
      description: "Start the complaint filing process",
      example: "I want to file a complaint about theft",
    },
    {
      command: "Check status",
      description: "Check the status of your existing complaints",
      example: "What is the status of my complaint FIR001?",
    },
    {
      command: "Get help",
      description: "Get help and guidance",
      example: "I need help with my case",
    },
    {
      command: "Emergency",
      description: "Access emergency services",
      example: "This is an emergency",
    },
  ];

  const helpTopics = [
    {
      title: "How to file a complaint",
      content:
        'Say "I want to file a complaint" and I will guide you through the process step by step.',
      audio: true,
    },
    {
      title: "Check complaint status",
      content:
        'You can ask "What is the status of my complaint" followed by your FIR number.',
      audio: true,
    },
    {
      title: "Language support",
      content:
        "I can understand and respond in English, Hindi, and Telugu. Just speak naturally.",
      audio: true,
    },
    {
      title: "Voice quality tips",
      content:
        "Speak clearly, avoid background noise, and hold the microphone button while speaking.",
      audio: true,
    },
  ];

  // Simulate audio level animation
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  const handleStopListening = () => {
    setIsListening(false);
    toast({
      title: "Processing...",
      description: "Analyzing your voice input",
    });
  };

  const handleVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        if (blob.size < 1000) {
          toast({
            title: "Recording too short",
            description: "Please try again.",
          });
          return;
        }

        const { text, language } = await transcribeVoice(blob);
        // const langCode = "en";

        // const langCode = "en";
        const langCode = selectedLanguage as "en" | "hi" | "te";
        setSelectedLanguage(langCode);
        setTranscript(text);

        const legalReply = await generateLegalResponse(text, langCode);
        setAiResponse(legalReply);
        speakText(legalReply, langCode);
      };

      recorder.start();
      toast({
        title: "Recording...",
        description: "Speak now, recording for 5 seconds.",
      });

      setTimeout(() => {
        recorder.stop();
      }, 5000); // Record for 5 seconds
    } catch (err) {
      console.error("Recording failed:", err);
      toast({
        title: "Error",
        description: "Could not start microphone.",
        variant: "destructive",
      });
    }
  };

  const handlePlayResponse = () => {
    setIsSpeaking(true);
    toast({
      title: "Playing Response",
      description: "AI is speaking your response",
    });

    // Simulate speech duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, 4000);
  };

  const handleReset = () => {
    setTranscript("");
    setAiResponse("");
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentStep(0);
  };

  const getCurrentLanguage = () => {
    return languages.find((l) => l.code === selectedLanguage) || languages[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                size="sm"
                className="hover:bg-white/60"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Voice Assistant
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  AI-powered multilingual support
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-3 py-1 md:px-4 md:py-2 shadow-lg">
              <Headphones className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Voice Active
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Language Selection */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Languages className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" />
              Select Language / भाषा चुनें / భాష ఎంచుకోండి
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={
                    selectedLanguage === lang.code ? "default" : "outline"
                  }
                  className={`p-4 md:p-6 h-auto flex-col space-y-2 ${
                    selectedLanguage === lang.code
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <span className="font-bold text-base md:text-lg">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs md:text-sm opacity-80">
                    {lang.name}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Interaction Area */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Mic className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-600" />
              Voice Interaction
            </CardTitle>
            <p className="text-sm md:text-base text-gray-600">
              Speaking in: <strong>{getCurrentLanguage().nativeName}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Voice Control */}
            <div className="text-center">
              <div className="relative inline-block">
                <Button
                  size="lg"
                  onClick={
                    isListening ? handleStopListening : handleVoiceRecord
                  }
                  disabled={isSpeaking}
                  className={`w-24 h-24 md:w-32 md:h-32 rounded-full text-white shadow-2xl transition-all duration-300 ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 animate-pulse scale-110"
                      : "bg-green-600 hover:bg-green-700 hover:scale-105"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8 md:h-12 md:w-12" />
                  ) : (
                    <Mic className="h-8 w-8 md:h-12 md:w-12" />
                  )}
                </Button>

                {/* Audio Level Indicator */}
                {isListening && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 md:w-24">
                    <Progress value={audioLevel} className="h-1 md:h-2" />
                  </div>
                )}
              </div>

              <p className="mt-4 md:mt-6 text-sm md:text-base font-medium">
                {isListening
                  ? "Listening... Tap to stop"
                  : "Tap to start speaking"}
              </p>

              {isSpeaking && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-blue-600 animate-pulse" />
                  <span className="text-sm md:text-base text-blue-600 font-medium">
                    AI is speaking...
                  </span>
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                      What you said:
                    </h4>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      {transcript}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Response */}
            {aiResponse && (
              <div className="bg-green-50 p-4 md:p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        AI Assistant:
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePlayResponse}
                        disabled={isSpeaking}
                        className="text-xs md:text-sm"
                      >
                        {isSpeaking ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" /> Speaking...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" /> Play
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 text-sm md:text-base"
                disabled={isListening || isSpeaking}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Conversation
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm md:text-base"
                disabled={!aiResponse || isListening || isSpeaking}
              >
                Continue with Voice Assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Commands Help */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <HelpCircle className="h-5 w-5 md:h-6 md:w-6 mr-2 text-orange-600" />
              Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {voiceCommands.map((cmd, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                    {cmd.command}
                  </h4>
                  <p className="text-gray-600 mb-2 text-xs md:text-sm">
                    {cmd.description}
                  </p>
                  <p className="text-gray-500 italic text-xs md:text-sm">
                    Example: "{cmd.example}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistance;
