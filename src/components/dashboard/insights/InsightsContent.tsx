
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsightsSectionFormatter } from './InsightsSectionFormatter';
import InsightsMetricsChart from './InsightsMetricsChart';
import InsightsCategories from './InsightsCategories';
import InsightsRecommendations from './InsightsRecommendations';
import { toast } from '@/components/ui/use-toast';
import { DealInsightsResponse } from '@/hooks/document-ai/types';

interface InsightsContentProps {
  insightsText?: string;
  insightsData?: DealInsightsResponse | null;
}

const InsightsContent = ({ insightsText, insightsData }: InsightsContentProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(false);
  
  // Check if we have any content to display
  useEffect(() => {
    const hasTextContent = !!insightsText && insightsText.length > 0;
    const hasDataContent = !!insightsData && 
      ((insightsData.insights && insightsData.insights.length > 0) || 
       (insightsData.metrics && Object.keys(insightsData.metrics).length > 0) ||
       (insightsData.recommendations && insightsData.recommendations.length > 0));
    
    setHasContent(hasTextContent || hasDataContent);
  }, [insightsText, insightsData]);
  
  // Handle applying a recommendation
  const handleApplyRecommendation = (recommendation: string) => {
    toast({
      title: "Recommendation Applied",
      description: `You've applied: ${recommendation.substring(0, 60)}...`,
    });
  };
  
  // Create metrics data for chart if available
  const metricsData = insightsData?.metrics ? 
    Object.entries(insightsData.metrics)
      .filter(([_, value]) => typeof value === 'number')
      .map(([key, value]) => ({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: value as number
      }))
    : [];
  
  if (!hasContent) {
    return (
      <div className="text-center p-8">
        <p>No insights available at this time. Click "Refresh Insights" to generate new insights.</p>
      </div>
    );
  }
  
  return (
    <div className={`${isExpanded ? '' : 'max-h-[450px] overflow-hidden relative'}`}>
      {insightsData ? (
        <>
          {/* Render enhanced insights UI if we have structured data */}
          {metricsData.length > 0 && (
            <InsightsMetricsChart 
              title="Deal Portfolio Metrics" 
              metrics={metricsData} 
            />
          )}
          
          <InsightsCategories 
            insights={insightsData.insights || []} 
            showEmpty={false}
          />
          
          <InsightsRecommendations 
            recommendations={insightsData.recommendations || []}
            onApplyRecommendation={handleApplyRecommendation}
          />
        </>
      ) : insightsText ? (
        // Fallback to text formatting if we only have text
        <InsightsSectionFormatter text={insightsText} />
      ) : (
        <p className="text-center p-4">Click "Refresh Insights" to analyze your deal portfolio.</p>
      )}
      
      {/* Disclaimer */}
      {hasContent && (
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
      {!isExpanded && hasContent && (insightsText?.length > 500 || insightsData?.insights?.length > 3) && (
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
  );
};

export default InsightsContent;
