
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Scale, AlertTriangle, FileText } from 'lucide-react';

const LegalSuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: Scale,
      title: "Key Terms Analysis",
      description: "Ask about payment terms, deliverables, and obligations"
    },
    {
      icon: AlertTriangle,
      title: "Risk Assessment",
      description: "Identify potential legal risks and liability clauses"
    },
    {
      icon: FileText,
      title: "Compliance Check",
      description: "Review regulatory requirements and compliance obligations"
    },
    {
      icon: Lightbulb,
      title: "Improvement Suggestions",
      description: "Get recommendations for contract optimization"
    }
  ];

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
          <Lightbulb className="h-5 w-5" />
          Legal Analysis Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <suggestion.icon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">{suggestion.title}</h4>
                <p className="text-sm text-amber-700">{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-700 mt-4 text-center">
          Upload a contract document and ask specific questions to get detailed legal analysis
        </p>
      </CardContent>
    </Card>
  );
};

export default LegalSuggestions;
