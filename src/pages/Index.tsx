import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  FileText,
  Shield,
  Users,
  Calendar,
  CheckCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { LoginFlow } from "@/components/auth/LoginFlow";
import CitizenInterface from "@/components/CitizenInterface";
import OfficerInterface from "@/components/OfficerInterface";

const Index = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"citizen" | "officer" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-orange-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <img
                  src="public/assests/logo.png"
                  className="h-12 w-12 md:h-12 md:w-12"
                />
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    SmartCopAI
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    AI-Powered Police Complaint Assistant
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1 md:px-4 md:py-2 shadow-lg text-xs md:text-sm">
                <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Government of India Initiative
              </Badge>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4 md:mb-6">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium text-xs md:text-sm">
                Next-Generation Complaint System
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4 md:mb-6 leading-tight">
              स्वागत है • Welcome • స్వాగతం
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              File complaints in your language with AI assistance. Speak in
              Telugu, Hindi, or English - our AI will help draft your legal
              complaint and connect you with police officers.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mic className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                  Voice Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Speak your complaint in Telugu, Hindi, or English. Our AI
                  transcribes and understands your concern.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                  AI Legal Drafting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Get professionally drafted complaints with relevant IPC
                  sections suggested automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 md:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                  Real-time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Track your complaint status, assigned officers, and get
                  updates throughout the investigation process.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Role Selection */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Choose Your Role
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                Select your portal to get started with SmartCopAI
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative"
                onClick={() => {
                  setUserRole("citizen");
                  setShowLogin(true);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center relative z-10 pb-4 md:pb-6">
                  <div className="mx-auto mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                    Citizen Portal
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-2 md:space-y-3 text-gray-600 mb-4 md:mb-6">
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      File new complaints
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Voice input support
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Track complaint status
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Access complaint history
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate("/login?type=citizen")}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl"
                  >
                    Enter as Citizen
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative"
                onClick={() => {
                  setUserRole("officer");
                  setShowLogin(true);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center relative z-10 pb-4 md:pb-6">
                  <div className="mx-auto mb-4 md:mb-6 p-4 md:p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                    Police Officer Portal
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ul className="space-y-2 md:space-y-3 text-gray-600 mb-4 md:mb-6">
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      Review complaints
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      Access voice transcripts
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      Update investigation status
                    </li>
                    <li className="flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      Assign case officers
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate("/login?type=officer")}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl"
                  >
                    Enter as Officer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          {/* <div className="mt-12 md:mt-20 bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-12 border-0">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
              Platform Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div className="group">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  1,247
                </div>
                <div className="text-gray-600 font-medium text-sm md:text-base">
                  Complaints Filed
                </div>
              </div>
              <div className="group">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  892
                </div>
                <div className="text-gray-600 font-medium text-sm md:text-base">
                  Cases Resolved
                </div>
              </div>
              <div className="group">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="text-gray-600 font-medium text-sm md:text-base">
                  Languages Supported
                </div>
              </div>
              <div className="group">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-gray-600 font-medium text-sm md:text-base">
                  AI Assistance
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 md:py-12 mt-12 md:mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-base md:text-lg mb-2">
              &copy; 2024 SmartCopAI - Government of India. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm md:text-base">
              Powered by AI for transparent and efficient policing
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (showLogin) {
    return (
      <LoginFlow
        userType={userRole || "citizen"}
        onLogin={() => {
          setIsAuthenticated(true);
          setShowLogin(false);
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  if (userRole === "citizen") {
    return (
      <CitizenInterface
        onBack={() => {
          setIsAuthenticated(false);
          setShowLogin(false);
        }}
      />
    );
  }

  if (userRole === "officer") {
    return (
      <OfficerInterface
        onBack={() => {
          setIsAuthenticated(false);
          setShowLogin(false);
        }}
      />
    );
  }

  return null;
};

export default Index;
