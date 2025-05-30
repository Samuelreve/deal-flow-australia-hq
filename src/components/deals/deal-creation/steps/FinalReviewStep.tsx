
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, CheckCircle, FileText, Building2, User, HandHeart, Sparkles, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { StepProps } from '../types';

const FinalReviewStep: React.FC<StepProps> = ({ 
  data, 
  onPrev, 
  onSubmit, 
  isSubmitting 
}) => {
  const [checklist, setChecklist] = useState({
    reviewedDetails: false,
    uploadedDocs: false,
    understoodProcess: false,
    readyToCreate: false
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const formatPrice = (price: string) => {
    if (!price) return 'Price on Application';
    return `$${price} AUD`;
  };

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadSummary = () => {
    // TODO: Implement PDF generation
    console.log('Downloading deal summary PDF...');
  };

  const getCompletionStats = () => {
    const total = 20; // Total possible fields
    let completed = 0;
    
    // Count completed fields
    if (data.businessTradingName) completed++;
    if (data.businessLegalName) completed++;
    if (data.legalEntityType) completed++;
    if (data.businessIndustry) completed++;
    if (data.abn) completed++;
    if (data.dealTitle) completed++;
    if (data.dealType) completed++;
    if (data.dealDescription) completed++;
    if (data.primarySellerName) completed++;
    if (data.sellerEntityType) completed++;
    if (data.askingPrice) completed++;
    if (data.targetCompletionDate) completed++;
    if (data.reasonForSelling) completed++;
    if (data.registeredAddress) completed++;
    if (data.principalAddress) completed++;
    if (data.keyAssetsIncluded) completed++;
    if (data.keyAssetsExcluded) completed++;
    if (data.legalRepName) completed++;
    if (data.yearsInOperation > 0) completed++;
    if (data.uploadedDocuments.length > 0) completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Almost there!</strong> Please review all information carefully. Once submitted, your deal will be created 
          in draft status and you can make further edits from the deal dashboard.
        </AlertDescription>
      </Alert>

      {/* Completion Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Deal Information Complete</h3>
              <p className="text-sm text-green-600">
                {stats.completed} of {stats.total} fields completed ({stats.percentage}%)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-800">{stats.percentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <Building2 className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trading Name</p>
              <p className="font-medium">{data.businessTradingName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Entity</p>
              <p className="font-medium">{data.businessLegalName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
              <p className="font-medium">{data.legalEntityType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <p className="font-medium">{data.businessIndustry}</p>
            </div>
            {data.abn && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ABN</p>
                <p className="font-medium">{data.abn}</p>
              </div>
            )}
            {data.yearsInOperation > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Years Operating</p>
                <p className="font-medium">{data.yearsInOperation} years</p>
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
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <HandHeart className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Deal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deal Title</p>
            <p className="font-medium text-lg">{data.dealTitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          {data.reasonForSelling && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason for Selling</p>
              <p className="font-medium">{data.reasonForSelling}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <div className="bg-muted p-4 rounded-lg mt-1">
              <p className="text-sm whitespace-pre-line">{data.dealDescription}</p>
            </div>
          </div>
          {(data.keyAssetsIncluded || data.keyAssetsExcluded) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.keyAssetsIncluded && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assets Included</p>
                  <p className="text-sm bg-green-50 p-2 rounded border">{data.keyAssetsIncluded}</p>
                </div>
              )}
              {data.keyAssetsExcluded && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assets Excluded</p>
                  <p className="text-sm bg-red-50 p-2 rounded border">{data.keyAssetsExcluded}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller Information Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <User className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Seller Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Seller</p>
              <p className="font-medium">{data.primarySellerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seller Entity Type</p>
              <p className="font-medium">{data.sellerEntityType}</p>
            </div>
          </div>
          {data.legalRepName && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Legal Representative</p>
              <p className="font-medium text-blue-800">{data.legalRepName}</p>
              {data.legalRepEmail && (
                <p className="text-sm text-blue-700">{data.legalRepEmail}</p>
              )}
              {data.legalRepPhone && (
                <p className="text-sm text-blue-700">{data.legalRepPhone}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg">
              Documents ({data.uploadedDocuments.length})
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={downloadSummary}>
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </CardHeader>
        <CardContent>
          {data.uploadedDocuments.length > 0 ? (
            <div className="space-y-2">
              {data.uploadedDocuments.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.filename}</span>
                  </div>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Final Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            Final Checklist
          </CardTitle>
          <CardDescription>
            Please confirm the following before creating your deal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="reviewed"
              checked={checklist.reviewedDetails}
              onCheckedChange={() => handleChecklistChange('reviewedDetails')}
            />
            <label 
              htmlFor="reviewed" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have reviewed all my business and deal details above
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="uploaded"
              checked={checklist.uploadedDocs}
              onCheckedChange={() => handleChecklistChange('uploadedDocs')}
            />
            <label 
              htmlFor="uploaded" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have uploaded the required documents and they are accurate
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="understood"
              checked={checklist.understoodProcess}
              onCheckedChange={() => handleChecklistChange('understoodProcess')}
            />
            <label 
              htmlFor="understood" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand this creates a deal listing that I can collaborate on with others
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="ready"
              checked={checklist.readyToCreate}
              onCheckedChange={() => handleChecklistChange('readyToCreate')}
            />
            <label 
              htmlFor="ready" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I'm ready to create this deal and begin the business sale process
            </label>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Your deal will be created in <strong>draft status</strong> - it's not public yet</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>AI will generate smart milestones based on your deal type</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>You can invite lawyers, advisors, and eventually buyers to collaborate</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p>Access the full DealPilot suite: document management, AI assistance, and more</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrev} variant="outline" size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </Button>
        <Button 
          onClick={onSubmit} 
          size="lg" 
          disabled={!allChecked || isSubmitting}
          className="min-w-[200px] bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Deal...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create My Deal
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FinalReviewStep;
