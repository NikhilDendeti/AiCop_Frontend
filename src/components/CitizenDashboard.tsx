import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const CitizenDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any user session data
    localStorage.removeItem('userType');
    localStorage.removeItem('mobileNumber');
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">File New Complaint</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Complaint Status</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Update Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
