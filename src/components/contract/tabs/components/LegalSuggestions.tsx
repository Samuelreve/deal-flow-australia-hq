
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, HelpCircle } from 'lucide-react';

const LegalSuggestions: React.FC = () => {
  const suggestions = [
    "What are the key obligations of each party in this contract?",
    "Are there any penalty clauses or liability limitations?",
    "What are the termination conditions and notice requirements?",
    "What are the payment terms and due dates?",
    "Are there any intellectual property provisions?",
    "What dispute resolution mechanisms are in place?"
  ];

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Suggested Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Here are some common questions you can ask about your contract:
        </p>
        <div className="grid gap-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 p-2 rounded-md hover:bg-white transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-slate-700">{suggestion}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalSuggestions;
