
import React from 'react';

const LegalSuggestions: React.FC = () => {
  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Suggested Legal Inquiries:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• "Who are the contracting parties and their respective roles?"</li>
        <li>• "What are the key obligations and responsibilities of each party?"</li>
        <li>• "What are the termination conditions and notice requirements?"</li>
        <li>• "What are the payment terms, amounts, and schedules?"</li>
        <li>• "What liability limitations and indemnification clauses exist?"</li>
        <li>• "Are there any dispute resolution or governing law provisions?"</li>
      </ul>
    </div>
  );
};

export default LegalSuggestions;
