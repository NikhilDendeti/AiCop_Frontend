
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Volume2, Phone, FileText, User, Clock, MapPin, AlertTriangle, Edit, Save, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OfficerComplaintDetailsProps {
  complaint: any;
  onBack: () => void;
}

const OfficerComplaintDetails = ({ complaint, onBack }: OfficerComplaintDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [newStatus, setNewStatus] = useState(complaint?.status || '');
  const { toast } = useToast();

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Complaint Not Found</h3>
            <Button onClick={onBack}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const officers = [
    'Inspector Rajesh Kumar',
    'Sub-Inspector Priya Sharma', 
    'Inspector Meera Reddy',
    'Sub-Inspector Ram Kumar',
    'Constable Anitha Reddy',
    'Head Constable Venkat Rao'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Investigation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "Complaint details have been updated successfully."
    });
    setIsEditing(false);
  };

  const handleAssignOfficer = () => {
    if (selectedOfficer) {
      toast({
        title: "Officer Assigned",
        description: `${selectedOfficer} has been assigned to this case.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-orange-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
                <p className="text-sm text-gray-600">FIR No: {complaint.id}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Main Complaint Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{complaint.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Filed on {complaint.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {complaint.location}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Citizen: <strong>{complaint.citizen}</strong></span>
                      <Phone className="h-4 w-4 text-gray-500 ml-4" />
                      <span>{complaint.citizenPhone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority} Priority
                    </Badge>
                    {complaint.urgencyScore > 80 && (
                      <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        URGENT
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Urgency Assessment</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${complaint.urgencyScore > 80 ? 'bg-red-500' : complaint.urgencyScore > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${complaint.urgencyScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm">{complaint.urgencyScore}/100</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Current Assignment</h4>
                    <p className="text-gray-700">
                      <strong>Officer:</strong> {complaint.assignedOfficer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Volume2 className="h-5 w-5 mr-2 text-blue-600" />
                    Voice Transcript
                  </span>
                  {complaint.hasAudio && (
                    <Button size="sm" variant="outline">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play Original Audio
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{complaint.transcript}</p>
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Auto-transcribed • 98% confidence
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  AI Legal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Suggested IPC Sections</h4>
                    <div className="flex flex-wrap gap-2">
                      {complaint.suggestedIPC.map((section: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Case Category</h4>
                    <Badge className="bg-purple-100 text-purple-800">
                      {complaint.title.includes('Theft') ? 'Property Crime' : 
                       complaint.title.includes('Violence') ? 'Violent Crime' : 
                       complaint.title.includes('Cyber') ? 'Cyber Crime' : 'Civil Matter'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Evidence & Witnesses */}
            <Card>
              <CardHeader>
                <CardTitle>Evidence & Witnesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Available Evidence</h4>
                    <div className="space-y-2">
                      {complaint.evidence.map((item: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item}</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Available
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Witnesses</h4>
                    <div className="space-y-2">
                      {complaint.witnesses.map((witness: string, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <span className="text-sm">{witness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Officer Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                  Officer Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Assign Officer</label>
                    <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {officers.map((officer) => (
                          <SelectItem key={officer} value={officer}>
                            {officer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Update Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                        <SelectItem value="Evidence Collection">Evidence Collection</SelectItem>
                        <SelectItem value="Arrest Warrant Issued">Arrest Warrant Issued</SelectItem>
                        <SelectItem value="Case Closed">Case Closed</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleAssignOfficer} className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign & Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Investigation Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Investigation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add investigation notes, follow-up actions, or observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                  />
                  <Button variant="outline" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Citizen
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Contact Witness
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Flag Urgent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetails;
