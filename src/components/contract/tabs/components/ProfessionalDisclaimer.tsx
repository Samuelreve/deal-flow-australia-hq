
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from 'lucide-react';

const ProfessionalDisclaimer: React.FC = () => {
  return (
    <Alert className="border-slate-300 bg-slate-50">
      <Shield className="h-4 w-4 text-slate-600" />
      <AlertDescription className="text-slate-700">
        <strong>Legal Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute legal advice. 
        Always consult with a qualified attorney for legal guidance on contracts and agreements.
      </AlertDescription>
    </Alert>
  );
};

export default ProfessionalDisclaimer;
