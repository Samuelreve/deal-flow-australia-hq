
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfessionalDisclaimer: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertDescription className="text-sm text-amber-800">
        ⚖️ <strong>Professional Disclaimer:</strong> This AI analysis is based solely on the uploaded contract content and is provided for informational purposes only. It does not constitute legal advice. Always consult with a qualified attorney for professional legal guidance.
      </AlertDescription>
    </Alert>
  );
};

export default ProfessionalDisclaimer;
