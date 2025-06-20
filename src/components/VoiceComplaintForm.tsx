import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mic, MicOff, FileText, Send, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceComplaintFormProps {
  onBack: () => void;
}

const VoiceComplaintForm = ({ onBack }: VoiceComplaintFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice to text
      setTimeout(() => {
        const mockResponse =
          currentStep === 1
            ? "My mobile phone was stolen from my bag while I was traveling on the bus."
            : `Response for question ${currentStep}`;
        setResponses((prev) => ({
          ...prev,
          [currentQuestion.id]: mockResponse,
        }));
        toast({
          title: "Voice recorded",
          description: "Your response has been transcribed successfully.",
        });
      }, 1000);
    } else {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly in your preferred language.",
      });
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      generateComplaint();
    }
  };

  const generateComplaint = () => {
    setIsGenerating(true);
    // Simulate AI complaint generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Complaint Generated",
        description:
          "Your legal complaint has been drafted with relevant IPC sections.",
      });
      setCurrentStep(questions.length + 1);
    }, 3000);
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

        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        </div>
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
                <Volume2 className="h-5 w-5 ml-2 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-blue-900">
                  {getQuestionText()}
                </p>
              </div>

              {/* Voice Recording */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleVoiceToggle}
                  className={`w-32 h-32 rounded-full ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-12 w-12" />
                  ) : (
                    <Mic className="h-12 w-12" />
                  )}
                </Button>
                <p className="mt-4 text-sm text-gray-600">
                  {isRecording
                    ? "Recording... Tap to stop"
                    : "Tap to start recording"}
                </p>
              </div>

              {/* Text Response */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Or type your response:
                </label>
                <Textarea
                  placeholder="Type your response here..."
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [currentQuestion.id]: e.target.value,
                    }))
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
                <Button
                  onClick={handleNext}
                  disabled={!responses[currentQuestion.id]?.trim()}
                >
                  {currentStep === questions.length
                    ? "Generate Complaint"
                    : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceComplaintForm;
