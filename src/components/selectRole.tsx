import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, ArrowLeft } from "lucide-react";

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto" style={{ paddingTop: "8%" }}>
      {/* <div className="text-center mb-8 md:mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Choose Your Role
        </h3>
        <p className="text-gray-600 text-base md:text-lg">
          Select your portal to get started with SmartCopAI
        </p>
      </div> */}
      <div className="relative mb-8 md:mb-12">
        {/* Back Button on the left */}
        <div className="absolute left-0 top-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>

        {/* Centered Heading and Description */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h3>
          <p className="text-gray-600 text-base md:text-lg">
            Select your portal to get started with SmartCopAI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Citizen Card */}
        <Card
          className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative"
          onClick={() => navigate("/login?type=citizen")}
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
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl">
              Enter as Citizen
            </Button>
          </CardContent>
        </Card>

        {/* Officer Card */}
        <Card
          className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative"
          onClick={() => navigate("/login?type=officer")}
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
            <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg py-4 md:py-6 text-base md:text-lg font-semibold rounded-xl">
              Enter as Officer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector;
