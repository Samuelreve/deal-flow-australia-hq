
import React from 'react';

interface AITipProps {
  step: number;
}

const getAITipForStep = (step: number): string => {
  const tips = {
    1: "Complete business details help generate accurate legal documents and milestone planning. Don't worry about getting everything perfect - you can always edit later.",
    2: "A clear deal description attracts serious buyers. Consider highlighting what makes your business unique and profitable.",
    3: "Adding a legal representative now streamlines the process later. They can be invited to collaborate on your deal once it's created.",
    4: "Upload core documents now to speed up due diligence. Financial statements and asset lists are particularly valuable for buyers.",
    5: "Review everything carefully - this creates your official deal listing. You can always make changes from the deal dashboard after submission."
  };
  
  return tips[step as keyof typeof tips] || "Complete this step to continue with your deal creation.";
};

export const AITip: React.FC<AITipProps> = ({ step }) => (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-blue-100 rounded-full">
        <span className="text-blue-600 font-bold text-sm">AI</span>
      </div>
      <div>
        <p className="text-sm text-blue-800">
          <strong>Smart Tip:</strong> {getAITipForStep(step)}
        </p>
      </div>
    </div>
  </div>
);
