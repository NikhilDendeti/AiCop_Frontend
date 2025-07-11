/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Mic,
  Plus,
  Eye,
  FileText,
  Download,
  Sparkles,
  TrendingUp,
  Phone,
  AlertTriangle,
} from "lucide-react";
import VoiceComplaintForm from "./VoiceComplaintForm";
import ComplaintDetails from "./ComplaintDetails";
import LegalResources from "./LegalResources";
import VoiceAssistance from "./VoiceAssistance";
import { useLocation, useNavigate } from "react-router-dom";
import { apiURL } from "@/utils/apiUtil";

interface CitizenInterfaceProps {
  onBack: () => void;
}

const CitizenInterface = ({ onBack }: CitizenInterfaceProps) => {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "new-complaint"
    | "view-complaint"
    | "legal-resources"
    | "voice-assistance"
  >("dashboard");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );

  const [complaints, setComplaints] = useState([]);
  const location = useLocation();
  const [animatedProgress, setAnimatedProgress] = useState<
    Record<string, number>
  >({});

  const progressByComplaintId: Record<string, number> = {
    "9051cddd-fccc-4caa-b387-6b0142780374": 30, // Theft
    "9c42080e-d84a-4350-af1a-d6943d416d01": 50, // Crime Against Women
    "c46c7259-4616-447a-9aeb-42997d9787b1": 75, // Crime Against Women
  };

  useEffect(() => {
    console.log("useEffect called");
    const fetchUserComplaints = async () => {
      try {
        const res = await fetch(
          `${apiURL}/user/complaints/2d4b7fb4-08a8-40a0-8cf7-8c92a2be1078/`
        );
        const data = await res.json();
        console.log(data, "complaints data");
        setComplaints(data);

        // Animate progress for each complaint
        const animationStates: Record<string, number> = {};
        data.forEach((complaint: any) => {
          const target = progressByComplaintId[complaint.complaint_id] ?? 0;
          animationStates[complaint.complaint_id] = 0;

          let current = 0;
          const interval = setInterval(() => {
            current += 1;
            animationStates[complaint.complaint_id] = current;
            setAnimatedProgress((prev) => ({ ...prev, ...animationStates }));
            if (current >= target) {
              clearInterval(interval);
            }
          }, 10); // Speed of animation
        });
      } catch (error) {
        console.error("Error fetching user complaints:", error);
      }
    };

    fetchUserComplaints();
  }, [location.state?.submitted]);

  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-500 text-white"; // ✅ Green
      case "pending":
        return "bg-orange-400 text-white"; // 🟠 Orange
      case "under_investigation":
      case "under_review":
      case "under_evaluation":
        return "bg-blue-500 text-white"; // 🔵 Blue (you can change to purple or teal if preferred)
      default:
        return "bg-gray-500 text-white"; // Fallback
    }
  };

  const handleViewComplaint = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setCurrentView("view-complaint");
  };

  if (currentView === "new-complaint") {
    return <VoiceComplaintForm onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "view-complaint" && selectedComplaintId) {
    const complaint = complaints.find((c) => c.id === selectedComplaintId);
    return (
      <ComplaintDetails
        complaint={complaint}
        onBack={() => setCurrentView("dashboard")}
      />
    );
  }

  if (currentView === "legal-resources") {
    return <LegalResources onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "voice-assistance") {
    return <VoiceAssistance onBack={() => setCurrentView("dashboard")} />;
  }

  const getProgressColor = (progress: number) => {
    if (progress < 40) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                size="sm"
                className="hover:bg-white/60"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Citizen Dashboard
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Manage your complaints and track progress
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 md:px-4 md:py-2 shadow-lg">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Citizen Portal
            </Badge>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8 text-center">
          <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium text-xs md:text-sm">
              Your Complaint Dashboard
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Manage your complaints and stay updated on their progress
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
              onClick={() => setCurrentView("new-complaint")}
            >
              <CardContent className="p-6 md:p-8 text-center">
                <div className="mx-auto mb-3 p-4 md:p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-4 max-w-md">
                  <Plus className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  <div className="text-left">
                    <h3 className="text-white font-semibold text-lg md:text-xl">
                      File New Complaint
                    </h3>
                  </div>
                </div>

                <p className="text-sm md:text-base text-gray-700 font-medium">
                  Start voice-guided complaint filing
                </p>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
              onClick={() => setCurrentView("voice-assistance")}
            >
              <CardContent className="p-6 md:p-8 text-center">
                <div className="mx-auto mb-3 p-4 md:p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-4 max-w-md">
                  <Mic className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  <div className="text-left">
                    <h3 className="text-white font-semibold text-lg md:text-xl">
                      Voice Assistance
                    </h3>
                  </div>
                </div>

                <p className="text-sm md:text-base text-gray-700 font-medium">
                  Get help in Telugu, Hindi, or English
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {complaints.map((complaint: any) => {
            const progress = animatedProgress[complaint.complaint_id] ?? 0;

            return (
              <Card
                key={complaint.complaint_id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
                style={{ gap: "1rem" }}
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                        {complaint.case_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </CardTitle>
                      <p className="text-sm md:text-base text-gray-600 font-medium">
                        FIR No:{" "}
                        {complaint.complaint_id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Location: [Unknown]
                      </p>
                    </div>
                    <Badge
                      className={
                        getStatusColor(complaint.status) +
                        " px-3 py-1 shadow-lg text-xs md:text-sm"
                      }
                    >
                      {complaint.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">
                          Filed on: {complaint.incident_date}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">
                          Officer: [Not Assigned]
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-xs md:text-sm line-clamp-2">
                      {complaint.incident_summary}
                    </p>

                    {/* ✅ Progress Section */}

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="font-semibold text-gray-900">
                          Investigation Progress
                        </span>
                        <span className="font-bold text-blue-600">
                          {progress}%
                        </span>
                      </div>

                      {/* ✅ Animated Progress Bar */}
                      <div className="w-full h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                            progress
                          )}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 text-xs md:text-sm"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Download FIR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Section */}
        {/* <div className="mt-8 md:mt-16 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-red-200/20">
          <div className="flex items-center mb-4 md:mb-6">
            <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600 mr-3" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              Emergency Contact
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <Phone className="h-8 w-8 md:h-12 md:w-12 text-red-600 mx-auto mb-3" />
              <h4 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                Police Emergency
              </h4>
              <p className="text-2xl md:text-3xl font-bold text-red-600">100</p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 md:h-12 md:w-12 text-pink-600 mx-auto mb-3" />
              <h4 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                Women Helpline
              </h4>
              <p className="text-2xl md:text-3xl font-bold text-pink-600">
                1091
              </p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 md:h-12 md:w-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                Cybercrime
              </h4>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                1930
              </p>
            </div>
          </div>
        </div> */}

        {/* Emergency Contact Section */}
        <div className="mt-12">
          <div className="bg-white shadow-xl rounded-3xl p-6 md:p-10 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-red-600 h-6 w-6 md:h-7 md:w-7" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                Emergency Contact Numbers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {/* Card 1: Police Emergency */}
              <div className="bg-red-50 hover:bg-red-100 transition-colors duration-300 rounded-2xl p-6 shadow-md border border-red-100">
                <Phone className="mx-auto text-red-500 h-10 w-10 mb-3" />
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Police Emergency
                </h4>
                <p className="text-3xl font-bold text-red-600">100</p>
              </div>

              {/* Card 2: Women Helpline */}
              <div className="bg-pink-50 hover:bg-pink-100 transition-colors duration-300 rounded-2xl p-6 shadow-md border border-pink-100">
                <Phone className="mx-auto text-pink-500 h-10 w-10 mb-3" />
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Women Helpline
                </h4>
                <p className="text-3xl font-bold text-pink-600">1091</p>
              </div>

              {/* Card 3: Cybercrime */}
              <div className="bg-blue-50 hover:bg-blue-100 transition-colors duration-300 rounded-2xl p-6 shadow-md border border-blue-100">
                <Phone className="mx-auto text-blue-500 h-10 w-10 mb-3" />
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Cybercrime
                </h4>
                <p className="text-3xl font-bold text-blue-600">1930</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-white via-slate-100 to-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-200/40">
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-6">
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 24/7 Support */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">
                  24/7 Support
                </h4>
                <p className="text-gray-600 text-sm md:text-base">
                  AI assistance available in Telugu, Hindi, and English
                </p>
              </div>
              {/* Legal Aid */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">
                  Legal Aid
                </h4>
                <p className="text-gray-600 text-sm md:text-base">
                  Free legal consultation for your cases
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenInterface;
