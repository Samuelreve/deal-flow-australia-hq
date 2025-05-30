
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

const ProfessionalDisclaimer: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm text-amber-800">
        <strong>Legal Disclaimer:</strong> This AI assistant provides informational analysis only and should not be considered legal advice. 
        Always consult with a qualified legal professional for contract interpretation, legal compliance, and decision-making. 
        The AI's responses are based on the document content provided and may not capture all legal nuances or jurisdictional requirements.
      </AlertDescription>
    </Alert>
  );
};

export default ProfessionalDisclaimer;
