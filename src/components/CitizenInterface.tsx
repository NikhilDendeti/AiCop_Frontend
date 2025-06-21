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
import { useLocation } from "react-router-dom";

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

  useEffect(() => {
    const fetchUserComplaints = async () => {
      try {
        const res = await fetch(
          "api/user/complaints/2d4b7fb4-08a8-40a0-8cf7-8c92a2be1078/"
        );
        const data = await res.json();
        console.log(data, "complaints data");
        setComplaints(data);
      } catch (error) {
        console.error("Error fetching user complaints:", error);
      }
    };

    fetchUserComplaints();
  }, [location.state?.submitted]);

  // Comprehensive mock complaint data
  const mockComplaints = [
    {
      id: "FIR001",
      title: "Mobile Phone Theft",
      date: "2024-01-15",
      status: "Under Investigation",
      officer: "Inspector Rajesh Kumar",
      progress: 65,
      location: "Bus Stand, Hyderabad",
      description:
        "My Samsung Galaxy S23 was stolen from my bag while traveling on bus from Secunderabad to Kukatpally around 3 PM.",
      evidence: [
        "CCTV footage requested",
        "Bus ticket submitted",
        "Phone IMEI registered",
      ],
      updates: [
        {
          date: "2024-01-16",
          message: "FIR registered successfully",
          officer: "Constable Priya Sharma",
        },
        {
          date: "2024-01-18",
          message: "CCTV footage reviewed, suspect identified",
          officer: "Inspector Rajesh Kumar",
        },
        {
          date: "2024-01-20",
          message: "Investigation ongoing, checking nearby areas",
          officer: "Inspector Rajesh Kumar",
        },
      ],
    },
    {
      id: "FIR002",
      title: "Noise Pollution Complaint",
      date: "2024-01-10",
      status: "Resolved",
      officer: "Sub-Inspector Priya Sharma",
      progress: 100,
      location: "Banjara Hills, Hyderabad",
      description:
        "Loud music and noise from neighboring construction site disturbing residents daily from 6 AM to 10 PM.",
      evidence: [
        "Sound level measurements",
        "Video recordings",
        "Neighbor testimonies",
      ],
      updates: [
        {
          date: "2024-01-11",
          message: "Complaint registered and site visited",
          officer: "Sub-Inspector Priya Sharma",
        },
        {
          date: "2024-01-12",
          message: "Notice issued to construction company",
          officer: "Sub-Inspector Priya Sharma",
        },
        {
          date: "2024-01-14",
          message: "Sound levels reduced, compliance achieved",
          officer: "Sub-Inspector Priya Sharma",
        },
      ],
    },
    {
      id: "FIR003",
      title: "Domestic Violence Report",
      date: "2024-01-08",
      status: "Under Investigation",
      officer: "Inspector Meera Reddy",
      progress: 45,
      location: "Jubilee Hills, Hyderabad",
      description:
        "Physical assault by spouse with threats and verbal abuse. Medical treatment sought for injuries.",
      evidence: ["Medical reports", "Injury photographs", "Witness statements"],
      updates: [
        {
          date: "2024-01-09",
          message: "Emergency response provided, medical aid arranged",
          officer: "Inspector Meera Reddy",
        },
        {
          date: "2024-01-11",
          message: "Counseling session arranged, legal aid contacted",
          officer: "Inspector Meera Reddy",
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0";
      case "Under Investigation":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0";
      case "Pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0";
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
                onClick={onBack}
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
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                  File New Complaint
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Start voice-guided complaint filing
                </p>
              </CardContent>
            </Card>

            {/* <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
              onClick={() => setCurrentView("legal-resources")}
            >
              <CardContent className="p-6 md:p-8 text-center">
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                  Legal Resources
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Know your rights and legal procedures
                </p>
              </CardContent>
            </Card> */}

            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
              onClick={() => setCurrentView("voice-assistance")}
            >
              <CardContent className="p-6 md:p-8 text-center">
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mic className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2">
                  Voice Assistance
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Get help in Telugu, Hindi, or English
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Complaints */}
        {/* <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            My Complaints
          </h2>
          <div className="space-y-4 md:space-y-6">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                        {complaint.title}
                      </CardTitle>
                      <p className="text-sm md:text-base text-gray-600 font-medium">
                        FIR No: {complaint.id}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {complaint.location}
                      </p>
                    </div>
                    <Badge
                      className={
                        getStatusColor(complaint.status) +
                        " px-3 py-1 shadow-lg text-xs md:text-sm"
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">
                          Filed on: {complaint.date}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">
                          Officer: {complaint.officer}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-xs md:text-sm line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="font-semibold text-gray-900">
                          Investigation Progress
                        </span>
                        <span className="font-bold text-blue-600">
                          {complaint.progress}%
                        </span>
                      </div>
                      <Progress
                        value={complaint.progress}
                        className="h-2 md:h-3 bg-gray-200"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 text-xs md:text-sm"
                        onClick={() => handleViewComplaint(complaint.id)}
                      >
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-50 text-xs md:text-sm"
                      >
                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Download FIR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {complaints.map((complaint: any) => (
          <Card
            key={complaint.complaint_id}
            className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl"
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
                    FIR No: {complaint.complaint_id.slice(0, 8).toUpperCase()}
                  </p>
                  {/* Optional: show static location or placeholder */}
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
                  {complaint.status.charAt(0).toUpperCase() +
                    complaint.status.slice(1)}
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

                <div className="space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="font-semibold text-gray-900">
                      Investigation Progress
                    </span>
                    <span className="font-bold text-blue-600">0%</span>
                  </div>
                  <Progress value={0} className="h-2 md:h-3 bg-gray-200" />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 text-xs md:text-sm"
                    onClick={() => handleViewComplaint(complaint.complaint_id)}
                  >
                    <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 text-xs md:text-sm"
                  >
                    <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Download FIR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Emergency Section */}
        <div className="mt-8 md:mt-16 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-red-200/20">
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
        </div>

        {/* Help Section */}
        <div className="mt-6 md:mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <h4 className="font-bold text-base md:text-lg text-gray-900 mb-3">
                24/7 Support
              </h4>
              <p className="text-gray-600 text-sm md:text-lg">
                AI assistance available in Telugu, Hindi, and English
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold text-base md:text-lg text-gray-900 mb-3">
                Legal Aid
              </h4>
              <p className="text-gray-600 text-sm md:text-lg">
                Free legal consultation for your cases
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenInterface;
