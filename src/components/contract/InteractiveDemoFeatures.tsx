
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  FileSearch, 
  AlertTriangle, 
  Users, 
  DollarSign,
  Lightbulb,
  TrendingUp,
  Shield
} from "lucide-react";
import { mockSummaryData } from '@/hooks/contract-analysis/mockData';

interface InteractiveDemoFeaturesProps {
  onAskQuestion: (question: string) => void;
}

const InteractiveDemoFeatures: React.FC<InteractiveDemoFeaturesProps> = ({ onAskQuestion }) => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const quickQuestions = [
    "What are the termination conditions?",
    "Who owns intellectual property created during discussions?", 
    "What remedies are available for breach?",
    "Can this agreement be amended?",
    "What information is considered confidential?"
  ];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab("risks")}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium">Risk Analysis</h3>
            <p className="text-sm text-muted-foreground">3 risks identified</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab("obligations")}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium">Obligations</h3>
            <p className="text-sm text-muted-foreground">Mutual duties</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab("financial")}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium">Financial Terms</h3>
            <p className="text-sm text-muted-foreground">No costs specified</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab("insights")}>
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium">AI Insights</h3>
            <p className="text-sm text-muted-foreground">View recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="h-5 w-5" />
                Contract Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">3 Years</div>
                  <div className="text-sm text-blue-700">Agreement Term</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5 Years</div>
                  <div className="text-sm text-green-700">Survival Period</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">Low-Med</div>
                  <div className="text-sm text-yellow-700">Risk Level</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Terms</h4>
                {mockSummaryData.keyTerms.map((term, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{term.term}</span>
                    <Badge variant={term.importance === 'high' ? 'destructive' : 'secondary'}>
                      {term.importance}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Overall Risk Level: <Badge className="ml-2 bg-yellow-100 text-yellow-800">{mockSummaryData.riskAssessment.overallRisk}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSummaryData.riskAssessment.risks.map((risk, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getRiskColor(risk.level)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{risk.type}</h4>
                    <Badge variant="outline" className={getRiskColor(risk.level)}>
                      {risk.level} Risk
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{risk.description}</p>
                  <div className="text-sm">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obligations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Company A Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockSummaryData.obligations.companyA.map((obligation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{obligation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Company B Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockSummaryData.obligations.companyB.map((obligation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{obligation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">✅ Strengths</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clear termination procedures with adequate notice</li>
                  <li>• Comprehensive definition of confidential information</li>
                  <li>• Mutual obligations provide balanced protection</li>
                  <li>• Includes injunctive relief provisions</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Areas for Improvement</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Consider adding specific carve-outs for publicly available information</li>
                  <li>• Add explicit data privacy law compliance provisions</li>
                  <li>• Consider shorter survival period if appropriate for your business</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">💡 Next Steps</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Review with legal counsel before signing</li>
                  <li>• Ensure both parties understand confidentiality scope</li>
                  <li>• Set up internal processes for handling confidential information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Try These Questions
          </CardTitle>
          <CardDescription>
            Click any question to see how our AI assistant responds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3 text-sm"
                onClick={() => onAskQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveDemoFeatures;
