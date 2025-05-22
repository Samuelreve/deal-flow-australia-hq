
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ChevronLeft, MessageSquare, History, Users } from "lucide-react";
import MainLayout from '@/components/layouts/MainLayout';
import DocQAPanel from '@/components/dashboard/contract/DocQAPanel';
import VersionHistoryTab from '@/components/dashboard/contract/VersionHistoryTab';
import CommentThreadTab from '@/components/dashboard/contract/CommentThreadTab';

const DemoContractPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  // Demo contract summary
  const contractSummary = {
    title: "Mutual Non-Disclosure Agreement",
    description: "This is a standard mutual NDA between two businesses",
    parties: ["Company A, Inc.", "Company B, Ltd."],
    created: "May 20, 2025",
    effectiveDate: "June 01, 2025",
    termLength: "2 years",
    keyPoints: [
      "Both parties agree to keep all shared confidential information secret for 5 years",
      "Confidential information includes business plans, customer data, and trade secrets",
      "Each party must use reasonable care to protect information, at least equal to their own practices",
      "Disclosure is only permitted to employees or agents with a need to know",
      "Agreement is governed by California law",
      "Breaching party responsible for legal fees of non-breaching party"
    ],
    risksIdentified: [
      { 
        severity: "high", 
        description: "No specific remedies defined for breach beyond standard legal recourse"
      },
      {
        severity: "medium",
        description: "No requirements to notify the other party if information is compromised"
      },
      {
        severity: "low",
        description: "Confidentiality period may be longer than industry standard (typically 3 years)"
      }
    ]
  };
  
  // Sample contract text
  const contractText = `MUTUAL NON-DISCLOSURE AGREEMENT

THIS MUTUAL NON-DISCLOSURE AGREEMENT (the "Agreement") is made and entered into as of June 1, 2025 (the "Effective Date") by and between Company A, Inc., a Delaware corporation ("Company A"), and Company B, Ltd., a California corporation ("Company B").

1. PURPOSE
The parties wish to explore a potential business relationship (the "Purpose"). In connection with the Purpose, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or that should reasonably be understood to be confidential given the nature of the information and circumstances of disclosure. Confidential Information includes, but is not limited to, technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, marketing, distribution and sales methods and systems, sales and profit figures, finances and other business information.

3. OBLIGATIONS
Each party shall protect the confidentiality of the other party's Confidential Information with at least the same degree of care as it uses to protect its own confidential information, but in no event less than reasonable care. Neither party shall disclose, use, or permit the use or disclosure of Confidential Information to any third party, except as permitted by this Agreement or required by law.

4. TERM
The obligations of each receiving party hereunder shall survive for a period of five (5) years from the date of disclosure of the Confidential Information.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California without reference to conflict of laws principles.

6. REMEDIES
Each party acknowledges that money damages may not be a sufficient remedy for any breach of this Agreement and that the non-breaching party shall be entitled to seek equitable relief, including injunction and specific performance, as a remedy for any such breach. The breaching party shall be responsible for the reasonable legal fees incurred by the non-breaching party in enforcing this Agreement.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

COMPANY A, INC.                    COMPANY B, LTD.

By: ___________________            By: ___________________
Name: John Smith                   Name: Jane Doe
Title: CEO                         Title: President`;

  const handleSelectText = () => {
    // In a real implementation, this would capture text selected by the user
    // For demo purposes, we'll just set a predefined text selection
    setSelectedText("Each party shall protect the confidentiality of the other party's Confidential Information with at least the same degree of care as it uses to protect its own confidential information, but in no event less than reasonable care.");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Back button and page header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold">Contract Demo</h1>
          </div>
          
          <div className="w-24">
            {/* Empty div for flex spacing */}
          </div>
        </div>
        
        {/* Document view and AI features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Document preview column */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-2">{contractSummary.title}</h2>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Between: {contractSummary.parties.join(" and ")}</p>
                <p>Effective: {contractSummary.effectiveDate}</p>
              </div>
              
              <div 
                className="border rounded-md p-4 h-[500px] overflow-y-auto font-mono text-sm whitespace-pre-wrap bg-gray-50"
                onMouseUp={handleSelectText}
              >
                {contractText}
              </div>
            </Card>
            
            <Card className="p-4">
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="keyPoints">Key Points</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Document Summary</h3>
                    <p className="text-sm text-muted-foreground">{contractSummary.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">Parties</h4>
                      <ul className="list-disc list-inside text-sm">
                        {contractSummary.parties.map((party, index) => (
                          <li key={index}>{party}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border rounded p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">Key Details</h4>
                      <div className="text-sm space-y-1">
                        <p>Effective Date: {contractSummary.effectiveDate}</p>
                        <p>Term Length: {contractSummary.termLength}</p>
                        <p>Created: {contractSummary.created}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="keyPoints">
                  <div>
                    <h3 className="font-semibold text-lg">Key Points</h3>
                    <p className="text-sm text-muted-foreground mb-4">Important terms and conditions from the document</p>
                    
                    <ul className="space-y-2">
                      {contractSummary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="risks">
                  <div>
                    <h3 className="font-semibold text-lg">Risk Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">Potential issues identified in the document</p>
                    
                    <div className="space-y-3">
                      {contractSummary.risksIdentified.map((risk, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${
                              risk.severity === 'high' ? 'bg-red-500' :
                              risk.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                            }`} />
                            <span className="font-medium capitalize">{risk.severity} Risk</span>
                          </div>
                          <p className="text-sm">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Q&A and additional features column */}
          <div className="space-y-6">
            <DocQAPanel 
              documentId="demo-doc-1"
              versionId="demo-version-1"
              dealId="demo-deal" 
              documentName={contractSummary.title}
            />
            
            <Tabs defaultValue="versions">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="versions">
                  <div className="flex items-center gap-1">
                    <History className="h-4 w-4" />
                    <span>Versions</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Comments</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="versions">
                <Card className="pt-0">
                  <VersionHistoryTab 
                    documentId="demo-doc-1"
                    documentName={contractSummary.title}
                    isDemoMode={true}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="comments">
                <Card className="pt-0">
                  <CommentThreadTab 
                    documentId="demo-doc-1"
                    versionId="demo-version-1"
                    isDemoMode={true}
                  />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DemoContractPage;
