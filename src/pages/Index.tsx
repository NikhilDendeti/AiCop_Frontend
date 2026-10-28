import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Decorative Background */}
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
                  src="/assets/logo.png"
                  className="h-12 w-12 md:h-12 md:w-12"
                  alt="SmartCopAI Logo"
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

        {/* Main Content */}
        <div
          className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex-grow"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
            <p
              className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4"
              style={{ textAlign: "center", paddingTop: "16px" }}
            >
              File complaints in your language with AI assistance. Speak in
              Telugu, Hindi, or English – our AI will help draft your legal
              complaint and connect you with police officers.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center ">
            <Button
              onClick={() => navigate("/login")}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 before:absolute before:inset-0 before:bg-white/10 before:blur-md before:opacity-0 hover:before:opacity-100"
              style={{ height: "60px", width: "260px" }}
            >
              <span className="relative z-10">🚀 Get Started</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 md:py-12">
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
};

export default Index;
