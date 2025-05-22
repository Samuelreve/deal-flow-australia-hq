
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, MessageSquare, AlertTriangle, Loader, Search } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

const mockContractText = `
MUTUAL NON-DISCLOSURE AGREEMENT

THIS MUTUAL NON-DISCLOSURE AGREEMENT (the "Agreement") is made and entered into as of [DATE] (the "Effective Date") by and between ABC Corp., a Delaware corporation with its principal place of business at 123 Main St, San Francisco, CA 94105 ("Company A"), and XYZ, Inc., a California corporation with its principal place of business at 456 Market St, San Francisco, CA 94105 ("Company B").

1. PURPOSE
Each party wishes to disclose certain Confidential Information to the other party for the purpose of evaluating a potential business relationship between the parties (the "Purpose").

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by one party (the "Disclosing Party") to the other party (the "Receiving Party"), either directly or indirectly, in writing, orally or by inspection of tangible objects, which is designated as "Confidential," "Proprietary" or some similar designation, or that should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure. Confidential Information includes, but is not limited to, technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances or other business information.

3. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date, unless terminated earlier by mutual written agreement.

4. OBLIGATIONS
The Receiving Party shall:
(a) Use the Confidential Information only for the Purpose;
(b) Restrict disclosure of Confidential Information solely to those employees or agents with a need to know such information and who are bound by confidentiality obligations no less restrictive than those contained herein;
(c) Not disclose any Confidential Information to any third party without prior written approval of the Disclosing Party;
(d) Use no less than reasonable care to protect the Disclosing Party's Confidential Information.

5. EXCLUSIONS
The obligations of the Receiving Party shall not apply to any information that:
(a) Was publicly known or made generally available without a duty of confidentiality prior to the time of disclosure;
(b) Becomes publicly known or made generally available without a duty of confidentiality after disclosure through no action or inaction of the Receiving Party;
(c) Is in the rightful possession of the Receiving Party without confidentiality obligations at the time of disclosure;
(d) Is properly obtained by the Receiving Party from a third party without restriction on disclosure; or
(e) Is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information.

6. RETURN OF MATERIALS
Upon the termination of this Agreement, or upon the Disclosing Party's request at any time, the Receiving Party shall promptly return or destroy all copies of the Disclosing Party's Confidential Information.

7. REMEDIES
The Receiving Party acknowledges that unauthorized disclosure of the Disclosing Party's Confidential Information could cause substantial harm for which damages alone may not be a sufficient remedy. Therefore, the Disclosing Party shall be entitled to seek appropriate equitable relief, including injunction and specific performance, in addition to any other remedies available at law.

8. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California without regard to conflicts of law principles.

9. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties regarding the subject matter hereof and supersedes all prior agreements, understandings, and communications between the parties, whether written or oral.

10. MISCELLANEOUS
This Agreement may not be modified except by a written instrument signed by both parties. The failure of either party to enforce any provision of this Agreement shall not be deemed a waiver of that or any other provision.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

ABC Corp.                          XYZ, Inc.

By: ______________________         By: ______________________
Name:                              Name: 
Title:                             Title:
Date:                              Date:
`;

// Mock AI response for contract summary
const mockSummary = {
  summary: [
    {
      title: "What is this contract about?",
      content: "This is a Mutual Non-Disclosure Agreement (NDA) between ABC Corp. and XYZ, Inc. to protect confidential information shared during business discussions."
    },
    {
      title: "Who are the parties involved?",
      content: "ABC Corp. (a Delaware corporation) and XYZ, Inc. (a California corporation)."
    },
    {
      title: "Key terms and obligations",
      content: "Both parties must use confidential information only for evaluating a business relationship, restrict disclosure to employees with a need to know, not disclose to third parties without approval, and protect information with reasonable care."
    },
    {
      title: "Termination conditions",
      content: "The agreement lasts for 3 years from the effective date, unless terminated earlier by mutual written agreement. Upon termination or request, all confidential materials must be returned or destroyed."
    },
    {
      title: "Potential risks or red flags",
      content: "No specific risks identified, though the agreement is governed by California law which may have implications depending on your jurisdiction."
    }
  ],
  disclaimer: "This AI-generated summary is provided for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional before making decisions based on this information."
};

// Mock AI responses for common questions
const mockAnswers: Record<string, string> = {
  "what is the duration": "This Agreement remains in effect for a period of 3 years from the Effective Date, unless terminated earlier by mutual written agreement, as specified in Section 3.",
  "what happens if confidentiality is breached": "According to Section 7 (Remedies), the Disclosing Party is entitled to seek appropriate equitable relief, including injunction and specific performance, in addition to any other remedies available at law, as unauthorized disclosure could cause substantial harm for which damages alone may not be sufficient.",
  "who are the parties": "The parties to this agreement are ABC Corp., a Delaware corporation with its principal place of business at 123 Main St, San Francisco, CA 94105, and XYZ, Inc., a California corporation with its principal place of business at 456 Market St, San Francisco, CA 94105.",
  "what law governs this agreement": "According to Section 8, this Agreement is governed by and construed in accordance with the laws of the State of California without regard to conflicts of law principles.",
  "what is considered confidential information": "As defined in Section 2, 'Confidential Information' includes technical data, trade secrets, know-how, research, product plans, products, services, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, and other business information that is designated as confidential or should reasonably be understood to be confidential."
};

const DemoContractPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("summary");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check URL parameters to see if we should auto-analyze
    const shouldAnalyze = searchParams.get("analyze") === "true";
    
    if (shouldAnalyze) {
      setIsAnalyzing(true);
      // Simulate AI analysis delay
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        toast.success("Contract analyzed successfully", {
          description: "AI summary and insights are now available"
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  
  const handleAskQuestion = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setIsLoading(true);
    setAnswer(null);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Look for keywords in the question to match to our mock answers
      const lowerQuestion = question.toLowerCase();
      let foundAnswer = null;
      
      for (const [keyword, response] of Object.entries(mockAnswers)) {
        if (lowerQuestion.includes(keyword)) {
          foundAnswer = response;
          break;
        }
      }
      
      if (foundAnswer) {
        setAnswer(foundAnswer);
      } else {
        setAnswer("I cannot find specific information about this in the contract. Please try rephrasing your question or ask about another topic covered in the agreement.");
      }
      
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Smart Contract Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered analysis and insights for your legal documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p className="text-sm text-muted-foreground">Mutual NDA - Template.pdf</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p className="text-sm text-muted-foreground">Non-Disclosure Agreement</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Uploaded</h3>
                  <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-sm">Analyzed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Document Versions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-primary/5 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">v1</span>
                      <span className="text-sm">Current Version</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading state */}
            {isAnalyzing ? (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <Loader className="h-12 w-12 animate-spin text-primary" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Analyzing your contract...</h3>
                    <p className="text-muted-foreground">
                      Our AI is reviewing the document to provide insights and summaries
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="assistant">Ask Questions</TabsTrigger>
                  <TabsTrigger value="document">Full Document</TabsTrigger>
                </TabsList>
                
                {/* Summary Tab */}
                <TabsContent value="summary">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Contract Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {mockSummary.summary.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <h3 className="text-base font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.content}</p>
                        </div>
                      ))}
                      
                      <Alert className="bg-amber-50 border-amber-200 mt-6">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-sm text-amber-700">
                          {mockSummary.disclaimer}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Assistant Tab */}
                <TabsContent value="assistant">
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Contract Assistant
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Ask questions about the contract to get instant answers.
                      </p>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g., What is the duration of this agreement?"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                          disabled={isLoading}
                        />
                        <Button onClick={handleAskQuestion} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Ask
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {answer && (
                        <div className="bg-muted p-4 rounded-md mt-4">
                          <h3 className="font-medium mb-2">Answer:</h3>
                          <p className="text-sm">{answer}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground pt-2">
                        Try questions like "What happens if confidentiality is breached?" or "What is the duration of this agreement?"
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-700">
                      The AI analyzes the exact contents of your contract to provide accurate answers based solely on the document.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
                
                {/* Document Tab */}
                <TabsContent value="document">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Full Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                          {mockContractText}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoContractPage;
