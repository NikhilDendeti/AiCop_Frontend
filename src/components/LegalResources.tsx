import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Scale,
  Phone,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";

interface LegalResourcesProps {
  onBack: () => void;
}

const LegalResources = ({ onBack }: LegalResourcesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("rights");

  const legalCategories = {
    rights: {
      title: "Fundamental Rights",
      icon: Scale,
      content: [
        {
          title: "Right to Equality (Article 14)",
          description:
            "Equal protection under law. No discrimination based on religion, race, caste, sex, or place of birth.",
          relevance: "Applies to fair treatment during police proceedings",
        },
        {
          title: "Right to Freedom (Article 19-22)",
          description:
            "Freedom of speech, assembly, association, movement, residence, and profession.",
          relevance: "Protection from arbitrary arrest and detention",
        },
        {
          title: "Right against Exploitation (Article 23-24)",
          description:
            "Prohibition of traffic in human beings and forced labor.",
          relevance: "Protection from bonded labor and human trafficking",
        },
      ],
    },
    procedures: {
      title: "Police Procedures",
      icon: FileText,
      content: [
        {
          title: "FIR Registration (Section 154 CrPC)",
          description:
            "Police must register FIR for cognizable offenses. Cannot refuse to register if offense is made out.",
          relevance: "Your right to file complaints",
        },
        {
          title: "Arrest Procedures (Section 41 CrPC)",
          description:
            "Police can arrest without warrant for cognizable offenses. Must inform grounds of arrest.",
          relevance: "Know your rights during arrest",
        },
        {
          title: "Search and Seizure (Section 165 CrPC)",
          description:
            "Police can search premises with warrant. Emergency searches allowed in specific circumstances.",
          relevance: "Understand search procedures",
        },
      ],
    },
    helplines: {
      title: "Legal Aid & Helplines",
      icon: Phone,
      content: [
        {
          title: "National Legal Services Authority",
          description:
            "Free legal aid for economically weaker sections and marginalized communities.",
          relevance: "Toll-free: 15100",
        },
        {
          title: "Women Helpline",
          description:
            "24x7 helpline for women in distress, domestic violence, and harassment cases.",
          relevance: "Toll-free: 1091",
        },
        {
          title: "Child Helpline",
          description:
            "Emergency assistance for children in need of care and protection.",
          relevance: "Toll-free: 1098",
        },
      ],
    },
    ipc: {
      title: "Common IPC Sections",
      icon: BookOpen,
      content: [
        {
          title: "Section 378 - Theft",
          description:
            "Dishonestly taking movable property out of possession of another person without consent.",
          relevance: "Mobile theft, bag snatching, etc.",
        },
        {
          title: "Section 323 - Voluntarily Causing Hurt",
          description:
            "Causing bodily pain, disease or infirmity to any person.",
          relevance: "Physical assault cases",
        },
        {
          title: "Section 509 - Outraging Modesty",
          description:
            "Word, gesture or act intended to insult the modesty of a woman.",
          relevance: "Sexual harassment cases",
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              size="sm"
              className="hover:bg-white/60"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Legal Resources
              </h1>
              <p className="text-gray-600 font-medium">
                Know your rights and legal procedures
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse Legal Information
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(legalCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedCategory === key
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl"
                      : "bg-white/80 backdrop-blur-sm hover:bg-white"
                  }`}
                  onClick={() => setSelectedCategory(key)}
                >
                  <CardContent className="p-6 text-center">
                    <IconComponent
                      className={`h-8 w-8 mx-auto mb-3 ${
                        selectedCategory === key
                          ? "text-white"
                          : "text-blue-600"
                      }`}
                    />
                    <h3
                      className={`font-bold ${
                        selectedCategory === key
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {category.title}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Content Display */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {
              legalCategories[selectedCategory as keyof typeof legalCategories]
                .title
            }
          </h3>

          {legalCategories[
            selectedCategory as keyof typeof legalCategories
          ].content.map((item, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-xl"
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      <strong>Relevance:</strong> {item.relevance}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Legal Aid */}
        <Card className="mt-12 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-200/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              Need Immediate Legal Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  Legal Aid
                </h4>
                <p className="text-2xl font-bold text-blue-600">15100</p>
                <p className="text-sm text-gray-600">Free legal consultation</p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  Lawyer Referral
                </h4>
                <p className="text-2xl font-bold text-green-600">Available</p>
                <p className="text-sm text-gray-600">Connect with lawyers</p>
              </div>
              <div className="text-center">
                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  Document Help
                </h4>
                <p className="text-2xl font-bold text-purple-600">24/7</p>
                <p className="text-sm text-gray-600">
                  Legal document assistance
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg px-8 py-3">
                <Phone className="h-5 w-5 mr-2" />
                Contact Legal Aid Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-100/80 backdrop-blur-sm rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> This information is for general
            guidance only and does not constitute legal advice. For specific
            legal situations, please consult with a qualified lawyer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalResources;
