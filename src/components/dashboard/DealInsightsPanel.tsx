
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle, Check, TrendingUp, Lightbulb } from "lucide-react";
import { useDocumentAI } from "@/hooks/document-ai";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Component for displaying AI-generated insights about a user's deal portfolio
 */
const DealInsightsPanel = () => {
  const { user } = useAuth();
  const [insightsText, setInsightsText] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const { 
    getDealInsights,
    loading,
    error
  } = useDocumentAI({ dealId: "" }); // Empty dealId as we're focusing on all deals
  
  // Function to generate insights
  const generateInsights = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate deal insights.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await getDealInsights();
      if (result && result.insightsText) {
        setInsightsText(result.insightsText);
      } else {
        toast({
          title: "Insights generation failed",
          description: "No insights data received from AI assistant.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Failed to generate insights:", err);
      toast({
        title: "Insights generation failed",
        description: error?.toString() || "Failed to generate deal insights.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    // Generate insights on component mount
    if (user?.id && !insightsText) {
      generateInsights();
    }
  }, [user?.id]);
  
  // Function to format markdown-like text with React components
  const formatInsightsText = (text: string) => {
    if (!text) return <p>No insights available.</p>;
    
    // Replace markdown-style headers with styled components
    const formattedText = text
      .split('\n')
      .map((line, index) => {
        // Match bold sections like **Overall Portfolio Health:**
        if (line.match(/^\s*\*\*([^*]+):\*\*/)) {
          const sectionName = line.match(/^\s*\*\*([^*]+):\*\*/)?.[1] || '';
          const restOfLine = line.replace(/^\s*\*\*([^*]+):\*\*/, '').trim();
          
          let icon = null;
          if (sectionName.includes("Overall Portfolio Health")) {
            icon = <TrendingUp className="h-5 w-5 mr-2 text-primary" />;
          } else if (sectionName.includes("Deals Needing Attention")) {
            icon = <AlertCircle className="h-5 w-5 mr-2 text-destructive" />;
          } else if (sectionName.includes("Deals Progressing Well")) {
            icon = <Check className="h-5 w-5 mr-2 text-green-500" />;
          } else if (sectionName.includes("Key Trends") || sectionName.includes("Observations")) {
            icon = <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />;
          } else if (sectionName.includes("Recommendations")) {
            icon = <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />;
          }
          
          return (
            <div key={index} className="mb-4">
              <h3 className="flex items-center text-md font-semibold mb-2">
                {icon}
                {sectionName}:
              </h3>
              <p className="ml-7 text-muted-foreground">{restOfLine}</p>
            </div>
          );
        } 
        // Lists with dashes or bullets
        else if (line.match(/^\s*[\-\*•]\s+/)) {
          const listItem = line.replace(/^\s*[\-\*•]\s+/, '').trim();
          return (
            <div key={index} className="ml-7 mb-2 flex items-baseline">
              <span className="mr-2 text-primary">•</span>
              <p className="text-muted-foreground">{listItem}</p>
            </div>
          );
        }
        // Regular paragraphs inside a section (indented lines)
        else if (line.match(/^\s+/) && line.trim().length > 0) {
          return <p key={index} className="ml-7 mb-2 text-muted-foreground">{line.trim()}</p>;
        }
        // Empty lines
        else if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }
        // Regular text
        else {
          return <p key={index} className="mb-2 text-muted-foreground">{line}</p>;
        }
      });
    
    return <div className="space-y-1">{formattedText}</div>;
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">AI Deal Insights</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            {loading ? "Generating..." : "Refresh Insights"}
          </Button>
        </div>
        <CardDescription>
          AI-powered analysis of your deal portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-pulse flex space-x-4 w-full max-w-md">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Analyzing your deal portfolio...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error generating insights</AlertTitle>
            <AlertDescription>{error.toString()}</AlertDescription>
          </Alert>
        ) : (
          <div className={`${isExpanded ? '' : 'max-h-[400px] overflow-hidden relative'}`}>
            {formatInsightsText(insightsText)}
            
            {/* Disclaimer */}
            {insightsText && (
              <>
                <div className="h-4"></div>
                <Alert className="mt-4 bg-muted/50 border-muted">
                  <AlertDescription className="text-xs text-muted-foreground">
                    This is an AI-generated analysis based on your deal portfolio data. 
                    It is provided for informational purposes only and should not replace professional judgment.
                  </AlertDescription>
                </Alert>
              </>
            )}
            
            {/* Expand/collapse gradient and button */}
            {!isExpanded && insightsText && insightsText.length > 500 && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(true)}
                  >
                    Show More
                  </Button>
                </div>
              </>
            )}
            
            {isExpanded && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                >
                  Show Less
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealInsightsPanel;
