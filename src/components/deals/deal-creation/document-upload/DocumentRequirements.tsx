
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';
import { REQUIRED_DOCUMENTS, RECOMMENDED_DOCUMENTS } from '../types';
import { UploadedDocument } from '../types';

interface DocumentRequirementsProps {
  uploadedDocuments: UploadedDocument[];
}

export const DocumentRequirements: React.FC<DocumentRequirementsProps> = ({ uploadedDocuments }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Document Requirements</CardTitle>
      <CardDescription>
        Here's what we need to get your deal ready
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-medium text-sm mb-2 text-red-600">Required Documents</h4>
          <ul className="text-sm space-y-1">
            {REQUIRED_DOCUMENTS.map(doc => (
              <li key={doc} className="flex items-center space-x-2">
                {uploadedDocuments.some(d => d.category === doc) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2 text-blue-600">Recommended Documents</h4>
          <ul className="text-sm space-y-1">
            {RECOMMENDED_DOCUMENTS.map(doc => (
              <li key={doc} className="flex items-center space-x-2">
                {uploadedDocuments.some(d => d.category === doc) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2 text-gray-600">Other Documents</h4>
          <p className="text-sm text-muted-foreground">
            Additional documents that may be relevant to your business sale
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
