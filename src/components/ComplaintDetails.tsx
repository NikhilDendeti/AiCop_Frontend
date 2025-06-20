
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, MapPin, Clock, User, CheckCircle, Download, Phone } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  date: string;
  status: string;
  officer: string;
  progress: number;
  location: string;
  description: string;
  evidence: string[];
  updates: Array<{
    date: string;
    message: string;
    officer: string;
  }>;
}

interface ComplaintDetailsProps {
  complaint: Complaint | undefined;
  onBack: () => void;
}

const ComplaintDetails = ({ complaint, onBack }: ComplaintDetailsProps) => {
  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 md:p-8 text-center">
            <h3 className="text-lg md:text-xl font-bold mb-4">Complaint Not Found</h3>
            <Button onClick={onBack}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0';
      case 'Under Investigation': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0';
      case 'Pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center space-x-3 md:space-x-4 flex-wrap gap-4">
            <Button variant="ghost" onClick={onBack} size="sm" className="hover:bg-white/60">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                Complaint Details
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium">FIR No: {complaint.id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Main Complaint Info */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 mb-2 break-words">{complaint.title}</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Filed on {complaint.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="truncate">{complaint.location}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(complaint.status) + " px-3 py-2 md:px-4 md:py-2 shadow-lg text-xs md:text-sm whitespace-nowrap"}>
                {complaint.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Description</h4>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{complaint.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="font-semibold text-gray-900">Investigation Progress</span>
                  <span className="font-bold text-blue-600">{complaint.progress}%</span>
                </div>
                <Progress value={complaint.progress} className="h-2 md:h-3" />
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
                <span className="text-gray-700 text-xs md:text-sm">Assigned Officer: <strong>{complaint.officer}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Section */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              Evidence & Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {complaint.evidence.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-xs md:text-sm flex-1 min-w-0 pr-2">{item}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs whitespace-nowrap">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Submitted
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Updates Timeline */}
        <Card className="mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-base md:text-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              Investigation Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaint.updates.map((update, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                    {index !== complaint.updates.length - 1 && (
                      <div className="w-0.5 h-12 md:h-16 bg-gray-300 ml-1 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1 gap-2">
                      <p className="text-gray-900 font-medium text-sm md:text-base break-words">{update.message}</p>
                      <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{update.date}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600">by {update.officer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg text-sm md:text-base">
            <Download className="h-4 w-4 mr-2" />
            Download FIR Copy
          </Button>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-sm md:text-base">
            <Phone className="h-4 w-4 mr-2" />
            Contact Officer
          </Button>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-sm md:text-base">
            <FileText className="h-4 w-4 mr-2" />
            Add Information
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
