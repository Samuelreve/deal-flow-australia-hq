
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentAI } from "@/hooks/document-ai";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

import InsightsHeader from './insights/InsightsHeader';
import InsightsLoading from './insights/InsightsLoading';
import InsightsError from './insights/InsightsError';
import InsightsContent from './insights/InsightsContent';
import { DealInsightsResponse } from '@/hooks/document-ai/types';

/**
 * Component for displaying AI-generated insights about a user's deal portfolio
 */
const DealInsightsPanel = () => {
  const { user } = useAuth();
  const [insightsText, setInsightsText] = useState<string>("");
  const [insightsData, setInsightsData] = useState<DealInsightsResponse | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const { 
    getDealInsights,
    formatInsightsToText,
    loading,
    error,
    clearError
  } = useDocumentAI({ dealId: "" }); // Empty dealId as we're focusing on all deals
  
  // Function to generate insights with retry logic
  const generateInsights = useCallback(async (isRetry: boolean = false) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate deal insights.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Clear any previous errors
      clearError?.();
      
      const result = await getDealInsights();
      if (result) {
        // Store the raw insights data
        setInsightsData(result);
        
        // Also convert to text for backward compatibility
        const formattedText = formatInsightsToText(result);
        setInsightsText(formattedText);
        
        // Reset retry count on success
        setRetryCount(0);
      } else {
        if (!isRetry && retryCount < 2) {
          // Try once more
          setRetryCount(prev => prev + 1);
          toast({
            title: "Retrying insights generation",
            description: "First attempt didn't return data, trying again...",
          });
          setTimeout(() => generateInsights(true), 1000);
        } else {
          toast({
            title: "Insights generation failed",
            description: "No insights data received from AI assistant.",
            variant: "destructive"
          });
        }
      }
    } catch (err: any) {
      console.error("Failed to generate insights:", err);
      toast({
        title: "Insights generation failed",
        description: err?.toString() || "Failed to generate deal insights.",
        variant: "destructive"
      });
    }
  }, [user?.id, getDealInsights, formatInsightsToText, retryCount, clearError]);

  useEffect(() => {
    // Generate insights on component mount
    if (user?.id && !insightsText && !insightsData && !loading) {
      generateInsights();
    }
  }, [user?.id, insightsText, insightsData, loading, generateInsights]);

  return (
    <Card className="mb-8">
      <InsightsHeader onRefresh={() => generateInsights()} loading={loading} />
      <CardContent>
        {loading ? (
          <InsightsLoading />
        ) : error ? (
          <InsightsError error={error} />
        ) : (
          <InsightsContent 
            insightsText={insightsText} 
            insightsData={insightsData} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DealInsightsPanel;
