/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  FileText,
  Mic,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Volume2,
  Eye,
  Edit,
  UserPlus,
  Bot,
} from "lucide-react";
import OfficerComplaintDetails from "./OfficerComplaintDetails";
import { useNavigate } from "react-router-dom";

interface OfficerInterfaceProps {
  onBack: () => void;
}

const OfficerInterface = ({ onBack }: OfficerInterfaceProps) => {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(
    null
  );
  const [currentView, setCurrentView] = useState<
    "dashboard" | "complaint-details"
  >("dashboard");

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedOfficers, setAssignedOfficers] = useState<
    Record<string, string>
  >({});

  // Comprehensive mock complaint data for officers
  // const complaints = [
  //   {
  //     id: "FIR001",
  //     title: "Mobile Phone Theft",
  //     citizen: "Rajesh Kumar",
  //     citizenPhone: "+91 98765 43210",
  //     date: "2024-01-15",
  //     status: "Pending Review",
  //     priority: "Medium",
  //     location: "Bus Stand, Hyderabad",
  //     hasAudio: true,
  //     transcript:
  //       "My mobile phone was stolen from my bag while I was traveling on the bus from Secunderabad to Kukatpally. It happened around 3 PM yesterday. The phone is a Samsung Galaxy S23, black color. I was sitting near the window seat when someone bumped into me and I later realized my phone was missing.",
  //     suggestedIPC: [
  //       "Section 378 - Theft",
  //       "Section 379 - Punishment for theft",
  //     ],
  //     audioUrl: "#",
  //     assignedOfficer: "Not Assigned",
  //     evidence: ["Bus ticket", "IMEI number", "Purchase receipt"],
  //     witnesses: ["Co-passenger: Priya Sharma (+91 98765 11111)"],
  //     urgencyScore: 65,
  //   },
  //   {
  //     id: "FIR002",
  //     title: "Domestic Violence",
  //     citizen: "Priya Sharma",
  //     citizenPhone: "+91 98765 54321",
  //     date: "2024-01-14",
  //     status: "Under Investigation",
  //     priority: "High",
  //     location: "Banjara Hills, Hyderabad",
  //     hasAudio: true,
  //     transcript:
  //       "मेरे पति ने मुझे मारा और धमकी दी। यह कल रात 10 बजे हुआ। मेरे पास चोट के निशान हैं। मैं डर रही हूं। मुझे सुरक्षा चाहिए।",
  //     suggestedIPC: [
  //       "Section 498A - Domestic Violence",
  //       "Section 323 - Voluntarily causing hurt",
  //       "Section 506 - Criminal intimidation",
  //     ],
  //     audioUrl: "#",
  //     assignedOfficer: "Inspector Meera Reddy",
  //     evidence: ["Medical report", "Injury photographs", "Previous complaints"],
  //     witnesses: ["Neighbor: Mrs. Lakshmi (+91 98765 22222)"],
  //     urgencyScore: 95,
  //   },
  //   {
  //     id: "FIR003",
  //     title: "Property Dispute",
  //     citizen: "Venkat Reddy",
  //     citizenPhone: "+91 98765 65432",
  //     date: "2024-01-13",
  //     status: "Resolved",
  //     priority: "Low",
  //     location: "Jubilee Hills, Hyderabad",
  //     hasAudio: false,
  //     transcript:
  //       "మా పొరుగువాడు మా భూమిలో అతిక్రమణ చేస్తున్నాడు. అతను గేటు వేసి మా దారిని మూసేశాడు. ఇది చాలా రోజులుగా జరుగుతోంది. మేము చాలాసార్లు చెప్పాము కానీ వినట్లేదు.",
  //     suggestedIPC: [
  //       "Section 441 - Criminal trespass",
  //       "Section 447 - Criminal trespass",
  //       "Section 268 - Public nuisance",
  //     ],
  //     audioUrl: "#",
  //     assignedOfficer: "Sub-Inspector Ram Kumar",
  //     evidence: ["Property documents", "Survey records", "Photographs"],
  //     witnesses: ["Revenue Officer: K. Srinivas (+91 98765 33333)"],
  //     urgencyScore: 30,
  //   },
  //   {
  //     id: "FIR004",
  //     title: "Chain Snatching",
  //     citizen: "Sunitha Devi",
  //     citizenPhone: "+91 98765 76543",
  //     date: "2024-01-16",
  //     status: "Pending Review",
  //     priority: "High",
  //     location: "Ameerpet, Hyderabad",
  //     hasAudio: true,
  //     transcript:
  //       "I was walking back from temple when two men on motorcycle snatched my gold chain. It happened so fast. The chain was worth around 2 lakhs. They came from behind and pulled it forcefully. My neck got injured.",
  //     suggestedIPC: [
  //       "Section 392 - Robbery",
  //       "Section 323 - Voluntarily causing hurt",
  //     ],
  //     audioUrl: "#",
  //     assignedOfficer: "Not Assigned",
  //     evidence: [
  //       "CCTV footage nearby",
  //       "Medical report for neck injury",
  //       "Gold receipt",
  //     ],
  //     witnesses: ["Security guard: Ravi (+91 98765 44444)"],
  //     urgencyScore: 85,
  //   },
  //   {
  //     id: "FIR005",
  //     title: "Cyber Fraud",
  //     citizen: "Mahesh Chandra",
  //     citizenPhone: "+91 98765 87654",
  //     date: "2024-01-12",
  //     status: "Under Investigation",
  //     priority: "Medium",
  //     location: "Online/Gachibowli",
  //     hasAudio: true,
  //     transcript:
  //       "Someone called me saying I won a lottery of 5 lakhs. They asked for my bank details for processing. I gave them and later found 50,000 rupees debited from my account. The caller ID showed a Mumbai number.",
  //     suggestedIPC: [
  //       "Section 420 - Cheating",
  //       "Section 66D - IT Act - Cheating using computer",
  //     ],
  //     audioUrl: "#",
  //     assignedOfficer: "Cyber Crime Officer: Anitha Reddy",
  //     evidence: ["Bank statements", "Phone records", "Screenshots"],
  //     witnesses: ["Bank manager confirmation"],
  //     urgencyScore: 70,
  //   },
  // ];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.15:8000/si/complaints/"
        );
        if (response.data.status === "success") {
          const mapped = response.data.complaints.map((c: any) => ({
            id: c.complaint_id,
            title: c.case_type,
            citizen: c.user?.name || "Unknown",
            citizenPhone: c.user?.phone || "N/A",
            date: new Date(c.created_at).toLocaleDateString(),
            status:
              c.status === "pending_review"
                ? "Pending Review"
                : c.status === "under_investigation"
                ? "Under Investigation"
                : c.status === "resolved"
                ? "Resolved"
                : "Unknown",

            priority: "Medium", // Placeholder or derive from urgency
            location: "N/A", // Add if available
            hasAudio: false, // Set true if you later add audio
            transcript: "", // Optional
            suggestedIPC: [], // If available from AI assessment
            audioUrl: "",
            assignedOfficer: "Not Assigned",
            evidence: [],
            witnesses: [],
            urgencyScore: c.ai_urgency_score,
            ipc_sections: c.ipc_sections || {},
          }));
          console.log(mapped.status, "mapped");
          setComplaints(mapped);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Under Investigation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewComplaint = (complaintId: string) => {
    setSelectedComplaint(complaintId);
    setCurrentView("complaint-details");
  };

  if (currentView === "complaint-details" && selectedComplaint) {
    const complaint = complaints.find((c) => c.id === selectedComplaint);
    return (
      <OfficerComplaintDetails
        complaint={complaint}
        onBack={() => setCurrentView("dashboard")}
      />
    );
  }

  const pendingComplaints = complaints.filter(
    (c) => c.status === "Pending Review"
  );
  const underInvestigation = complaints.filter(
    (c) => c.status === "Under Investigation"
  );

  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved");
  const voiceComplaints = complaints.filter((c) => c.hasAudio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Officer Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Manage complaints and investigations
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 text-xs md:text-sm"
            >
              Police Officer Portal
            </Badge>
          </div>
        </div>
      </header> */}
      <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Officer Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Manage complaints and investigations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  // Handle opening AI assistant popup, widget, or route here
                  navigate("/officer-voice");
                }}
              >
                <Bot className="h-5 w-5 mr-2" />
                AI Assistant
              </Button>

              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 text-xs md:text-sm"
              >
                Police Officer Portal
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {pendingComplaints.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Pending Review
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {underInvestigation.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Under Investigation
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {resolvedComplaints.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Resolved</div>
            </CardContent>
          </Card>

          {/* <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6 text-center">
              <Mic className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold">
                {voiceComplaints.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Voice Complaints
              </div>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="all" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 text-xs md:text-sm">
            <TabsTrigger value="all">All Complaints</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingComplaints.length})
            </TabsTrigger>
            <TabsTrigger
              value="investigation"
              className="hidden md:inline-flex"
            >
              Under Investigation
            </TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={handleViewComplaint}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                assignedOfficers={assignedOfficers}
                setAssignedOfficers={setAssignedOfficers}
              />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingComplaints.length > 0 ? (
              pendingComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onView={handleViewComplaint}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  assignedOfficers={assignedOfficers}
                  setAssignedOfficers={setAssignedOfficers}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    No Pending Complaints
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    All complaints have been reviewed and assigned.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="investigation" className="space-y-4">
            {underInvestigation.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={handleViewComplaint}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                assignedOfficers={assignedOfficers}
                setAssignedOfficers={setAssignedOfficers}
              />
            ))}
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            {voiceComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onView={handleViewComplaint}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                assignedOfficers={assignedOfficers}
                setAssignedOfficers={setAssignedOfficers}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Complaint Card Component
const ComplaintCard = ({
  complaint,
  onView,
  getStatusColor,
  getPriorityColor,
  assignedOfficers,
  setAssignedOfficers,
}: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
            <CardTitle className="text-base md:text-lg truncate">
              {complaint.title}
            </CardTitle>
            {complaint.urgencyScore > 80 && (
              <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs whitespace-nowrap">
                URGENT
              </Badge>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-600 break-words">
            FIR: {complaint.id} • Citizen: {complaint.citizen}
          </p>
          <p className="text-xs md:text-sm text-gray-600 break-all">
            Phone: {complaint.citizenPhone}
          </p>
        </div>
        <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2">
          <Badge className={getPriorityColor(complaint.priority) + " text-xs"}>
            {complaint.priority}
          </Badge>
          <Badge className={getStatusColor(complaint.status) + " text-xs"}>
            {complaint.status}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
          <div>
            <span className="font-medium">Date Filed:</span> {complaint.date}
          </div>
          <div className="truncate">
            <span className="font-medium">Location:</span> {complaint.location}
          </div>
          <div className="truncate">
            {/* <span className="font-medium">Assigned Officer:</span>{" "}
            {complaint.assignedOfficer} */}
            <span className="font-medium">Assigned Officer:</span>{" "}
            {assignedOfficers[complaint.id] || complaint.assignedOfficer}
          </div>

          <div>
            <span className="font-medium">Urgency Score:</span>
            <span
              className={`ml-1 font-bold ${
                complaint.urgencyScore > 80
                  ? "text-red-600"
                  : complaint.urgencyScore > 50
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {complaint.urgencyScore}/100
            </span>
          </div>
        </div>

        {/* Audio Transcript */}
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-xs md:text-sm">Voice Transcript</h4>
            {complaint.hasAudio && (
              <Button size="sm" variant="outline" className="text-xs">
                <Volume2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Play Audio
              </Button>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-700 line-clamp-2 md:line-clamp-3">
            {complaint.transcript}
          </p>
        </div>

        {/* Evidence & Witnesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-xs md:text-sm">
              Evidence Available
            </h4>
            <div className="space-y-1">
              {complaint.evidence
                .slice(0, 2)
                .map((item: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs mr-1 mb-1 break-words"
                  >
                    {item}
                  </Badge>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-xs md:text-sm">Witnesses</h4>
            <div className="space-y-1">
              {complaint.witnesses
                .slice(0, 1)
                .map((witness: string, index: number) => (
                  <p key={index} className="text-xs text-gray-600 break-words">
                    {witness}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Suggested IPC Sections */}
        <div>
          <h4 className="font-medium mb-2 text-xs md:text-sm">
            AI Suggested IPC Sections
          </h4>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {Object.entries(complaint.ipc_sections || {}).map(
              ([code, desc], index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 text-xs break-words"
                >
                  {`IPC ${code}: ${desc}`}
                </Badge>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
          {/* <Select onValueChange={(value) => setSelectedOfficer(value)}>
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
              <SelectValue placeholder="Assign Officer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Constable">Constable</SelectItem>
              <SelectItem value="Head Constable">Head Constable</SelectItem>
            </SelectContent>
          </Select> */}
          <Select
            onValueChange={(value) => {
              setAssignedOfficers((prev: any) => ({
                ...prev,
                [complaint.id]: value,
              }));

              // You can call an API here too if needed to persist officer assignment
            }}
          >
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
              <SelectValue placeholder="Assign Officer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Constable Ramesh">Constable Ramesh</SelectItem>
              <SelectItem value="Head Constable Suma">
                Head Constable Suma
              </SelectItem>
            </SelectContent>
          </Select>

          {/* <Select>
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select> */}
          <Select
            onValueChange={async (value) => {
              // Map human-readable dropdown values to backend-compatible keys
              const apiStatus =
                value === "investigating"
                  ? "under_investigation"
                  : value === "pending"
                  ? "pending_review"
                  : "resolved";

              try {
                await axios.post(
                  "http://192.168.1.15:8000/update_complaint_status/v1",
                  {
                    complaint_id: complaint.id,
                    status: apiStatus,
                  }
                );

                // Update status in frontend for immediate UI feedback
                complaint.status =
                  apiStatus === "pending_review"
                    ? "Pending Review"
                    : apiStatus === "under_investigation"
                    ? "Under Investigation"
                    : "Resolved";

                console.log("✅ Complaint status updated:", apiStatus);
              } catch (error) {
                console.error("❌ Backend error:", error);
                alert("Failed to update complaint status");
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-32 text-xs md:text-sm">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default OfficerInterface;
