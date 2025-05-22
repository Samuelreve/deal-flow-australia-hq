
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentAI } from "@/hooks/document-ai";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

import InsightsHeader from './insights/InsightsHeader';
import InsightsLoading from './insights/InsightsLoading';
import InsightsError from './insights/InsightsError';
import InsightsContent from './insights/InsightsContent';
import { formatInsightsToText } from './insights/utils/insightsFormatter';

/**
 * Component for displaying AI-generated insights about a user's deal portfolio
 */
const DealInsightsPanel = () => {
  const { user } = useAuth();
  const [insightsText, setInsightsText] = useState<string>("");
  
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
      if (result) {
        // Convert the insights array to a formatted text for display
        const formattedText = formatInsightsToText(result);
        setInsightsText(formattedText);
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

  return (
    <Card className="mb-8">
      <InsightsHeader onRefresh={generateInsights} loading={loading} />
      <CardContent>
        {loading ? (
          <InsightsLoading />
        ) : error ? (
          <InsightsError error={error} />
        ) : (
          <InsightsContent insightsText={insightsText} />
        )}
      </CardContent>
    </Card>
  );
};

export default DealInsightsPanel;
