import React, {
  useEffect,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";

interface User {
  name?: string;
  email?: string;
  phone?: string;
  user_id?: string;
}

interface Assessment {
  ipc_sections?: Record<string, string>;
}

interface Complaint {
  assessment?: Assessment;
  location?: string;
  case_type?: string;
  incident_summary?: string;
  incident_date?: string;
  incident_time?: string;
  user?: User;
  ai_urgency_score?: number;
}

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiURL } from "@/utils/apiUtil";

const ComplaintPreview = ({ complaintId }: { complaintId: string }) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToLegalProcedure, setAgreedToLegalProcedure] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(
          `${apiURL}/complaint/${complaintId}`
        );
        const data = await res.json();
        setComplaint(data);
      } catch (error) {
        console.error("Error fetching complaint:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  if (loading) return <p>Loading complaint details...</p>;
  if (!complaint) return <p>Complaint not found.</p>;

  const onBack = (event: ReactMouseEvent<HTMLButtonElement>) => {
    navigate(-1);
  };

  const handleSubmitComplaint = () => {
    setShowModal(true);
  };

  const Modal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-green-600">
          Complaint Submitted Successfully!
        </h2>
        <p className="text-gray-700 text-sm">
          Your complaint has been saved and is under review. You will be
          contacted if more details are needed.
        </p>
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => {
              setShowModal(false);
              navigate("/citizen-dashboard");
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showModal && <Modal />}
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-green-600" />
                  Generated Legal Complaint
                </div>
                {complaint.ai_urgency_score !== undefined && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    AI Urgency: {complaint.ai_urgency_score}
                  </Badge>
                )}
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
                    <strong>To:</strong> The Station House Officer,{" "}
                    {complaint.location || "[Police Station]"}
                  </p>
                  <p>
                    <strong>Subject:</strong> Complaint regarding{" "}
                    {complaint.case_type}
                  </p>

                  <div className="space-y-3">
                    <p>Sir/Madam,</p>
                    <p>{complaint.incident_summary}</p>
                    <p>
                      <strong>Details of the Incident:</strong>
                    </p>
                    <p>
                      The incident took place on {complaint.incident_date} at
                      approximately {complaint.incident_time} in{" "}
                      {complaint.location}.
                    </p>
                    <p>
                      <strong>Relevant IPC Sections:</strong>
                    </p>
                    <ul className="list-disc ml-6">
                      {complaint.assessment?.ipc_sections &&
                        Object.entries(complaint.assessment.ipc_sections).map(
                          ([sec, desc]) => (
                            <li key={sec}>
                              Section {sec} - {desc}
                            </li>
                          )
                        )}
                    </ul>
                    <p>
                      I request you to kindly register an FIR and investigate
                      the matter. I am ready to cooperate with the investigation
                      and provide any additional information required.
                    </p>
                    <p>Thanking you,</p>
                    <p>
                      {complaint.user?.name}
                      <br />
                      [Address not provided]
                      <br />
                      {complaint.user?.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="legalAgreement"
                  checked={agreedToLegalProcedure}
                  onChange={() => setAgreedToLegalProcedure((prev) => !prev)}
                  className="h-4 w-4 border-gray-300 rounded"
                />
                <label
                  htmlFor="legalAgreement"
                  className="text-sm text-gray-700"
                >
                  I agree to the legal procedure and confirm the accuracy of the
                  information provided.
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!agreedToLegalProcedure}
                  onClick={handleSubmitComplaint}
                >
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
    </>
  );
};

export default ComplaintPreview;
