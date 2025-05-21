
import React from 'react';

const ContractFeatures: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-medium text-sm">What our AI can do:</h4>
      <ul className="text-sm mt-2 space-y-1.5">
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span> 
          <span>Summarize key terms and sections</span>
        </li>
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span> 
          <span>Explain legal clauses in plain English</span>
        </li>
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span> 
          <span>Answer questions about the contract</span>
        </li>
      </ul>
    </div>
  );
};

export default ContractFeatures;
