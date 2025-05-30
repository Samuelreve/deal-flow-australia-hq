
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, CheckCircle, FileText, Building2, User, HandHeart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps } from '../types';

const ReviewSubmissionStep: React.FC<StepProps> = ({ 
  data, 
  onPrev, 
  onSubmit, 
  isSubmitting 
}) => {
  const [checklist, setChecklist] = useState({
    reviewedDetails: false,
    uploadedDocs: false,
    readyToCreate: false
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const formatPrice = (price: string) => {
    if (!price) return 'Price on Application';
    return `$${price}`;
  };

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Downloading PDF summary...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Review & Submit</h2>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review all information carefully. Once submitted, your deal will be created 
          in draft status and you can make further edits from the deal dashboard.
        </AlertDescription>
      </Alert>

      {/* Business Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Business Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trading Name</p>
              <p className="font-medium">{data.businessTradingName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Entity</p>
              <p className="font-medium">{data.legalEntityName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
              <p className="font-medium">{data.entityType}</p>
            </div>
            {data.abn && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ABN</p>
                <p className="font-medium">{data.abn}</p>
              </div>
            )}
          </div>
          {data.registeredAddress && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registered Address</p>
              <p className="text-sm">{data.registeredAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <HandHeart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Deal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deal Title</p>
            <p className="font-medium text-lg">{data.dealTitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deal Type</p>
              <p className="font-medium">{data.dealType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asking Price</p>
              <p className="font-medium">{formatPrice(data.askingPrice)}</p>
            </div>
            {data.targetCompletionDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Completion</p>
                <p className="font-medium">{new Date(data.targetCompletionDate).toLocaleDateString()}</p>
              </div>
            )}
            {data.reasonForSelling && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reason for Selling</p>
                <p className="font-medium">{data.reasonForSelling}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm bg-muted p-3 rounded mt-1">{data.dealDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Seller Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Seller Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seller Name</p>
              <p className="font-medium">{data.sellerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
              <p className="font-medium">{data.sellerEntityType}</p>
            </div>
          </div>
          {data.legalRepName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Representative</p>
              <p className="font-medium">{data.legalRepName}</p>
              {data.legalRepEmail && (
                <p className="text-sm text-muted-foreground">{data.legalRepEmail}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Documents ({data.uploadedDocuments.length})
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.uploadedDocuments.map((doc, index) => (
              <div key={doc.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doc.filename}</span>
                </div>
                <Badge variant="outline">{doc.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Checklist</CardTitle>
          <CardDescription>
            Please confirm the following before creating your deal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reviewed"
              checked={checklist.reviewedDetails}
              onCheckedChange={() => handleChecklistChange('reviewedDetails')}
            />
            <label 
              htmlFor="reviewed" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have reviewed my business and deal details
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="uploaded"
              checked={checklist.uploadedDocs}
              onCheckedChange={() => handleChecklistChange('uploadedDocs')}
            />
            <label 
              htmlFor="uploaded" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have uploaded the required documents
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ready"
              checked={checklist.readyToCreate}
              onCheckedChange={() => handleChecklistChange('readyToCreate')}
            />
            <label 
              htmlFor="ready" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I'm ready to create this deal
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          size="lg" 
          disabled={!allChecked || isSubmitting}
        >
          {isSubmitting ? 'Creating Deal...' : 'Create Deal'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewSubmissionStep;
