
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, AlertTriangle, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useDocumentAI } from '@/hooks/document-ai';
import { Progress } from '@/components/ui/progress';
import { formatRelativeTime } from '@/utils/formatDate';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';

interface DealHealthPredictionPanelProps {
  dealId: string;
}

type ImpactLevel = 'High' | 'Medium' | 'Low';

interface PredictionResult {
  probability_of_success_percentage: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  prediction_reasoning: string;
  suggested_improvements: Array<{
    area: string;
    recommendation: string;
    impact: ImpactLevel;
  }>;
  disclaimer: string;
}

const DealHealthPredictionPanel: React.FC<DealHealthPredictionPanelProps> = ({ dealId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [lastPredictedAt, setLastPredictedAt] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const { predictDealHealth, loading, result: aiResult, error } = useDocumentAI({ dealId });
  
  const predictionResult = aiResult as PredictionResult | null;
  
  const handleGetPrediction = async () => {
    try {
      await predictDealHealth();
      setLastPredictedAt(new Date());
      setIsExpanded(true);
    } catch (err: any) {
      console.error('Error predicting deal health:', err);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: err.message || 'Failed to predict deal health',
      });
    }
  };

  // Helper function to get color for probability score
  const getProbabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Helper function to get color for confidence level
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Helper function to get color for impact level
  const getImpactColor = (level: ImpactLevel) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get recommendations to display
  const displayRecommendations = showAllRecommendations 
    ? predictionResult?.suggested_improvements || []
    : (predictionResult?.suggested_improvements || []).slice(0, 3);
  
  const hasMoreRecommendations = predictionResult?.suggested_improvements && 
    predictionResult.suggested_improvements.length > 3;
  
  return (
    <Card className={`mt-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Deal Success Prediction
            </CardTitle>
            <CardDescription>
              Get AI-powered insights on deal health and suggested improvements
            </CardDescription>
          </div>
          {predictionResult && (
            <button 
              onClick={toggleExpanded} 
              className="text-muted-foreground hover:text-foreground"
              aria-label={isExpanded ? "Collapse prediction" : "Expand prediction"}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </CardHeader>
      
      {!predictionResult && !loading && (
        <CardContent>
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-4 max-w-md">
              Our AI can analyze your deal data to predict success probability and suggest improvements to increase your chances of closing the deal.
            </p>
            <Button 
              onClick={handleGetPrediction} 
              className="bg-primary hover:bg-primary/80"
            >
              Get AI Prediction
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
      
      {loading && (
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing deal data...</p>
          <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
        </CardContent>
      )}
      
      {error && !loading && (
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive">Prediction failed</h4>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3" 
                onClick={handleGetPrediction}
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      )}
      
      {predictionResult && !loading && !error && (
        <>
          <CardContent className={`transition-all duration-300 ${isExpanded ? '' : 'hidden'}`}>
            <div className="space-y-4">
              {/* Prediction Score */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Success Probability</h3>
                    <p className="text-3xl font-bold">{predictionResult.probability_of_success_percentage}%</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getConfidenceColor(predictionResult.confidence_level)} px-2 py-0.5`}
                  >
                    {predictionResult.confidence_level} Confidence
                  </Badge>
                </div>
                <Progress 
                  value={predictionResult.probability_of_success_percentage} 
                  className="h-2" 
                  indicatorClassName={getProbabilityColor(predictionResult.probability_of_success_percentage)} 
                />
              </div>
              
              {/* Reasoning */}
              <div>
                <h3 className="text-sm font-medium mb-1">Analysis</h3>
                <p className="text-muted-foreground text-sm">{predictionResult.prediction_reasoning}</p>
              </div>
              
              {/* Recommended Improvements */}
              <div>
                <h3 className="text-sm font-medium mb-2">Recommended Improvements</h3>
                <div className="space-y-3">
                  {displayRecommendations.map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-muted p-3 rounded-md"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{item.area}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${getImpactColor(item.impact)} text-xs px-2`}
                        >
                          {item.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </motion.div>
                  ))}
                </div>
                
                {hasMoreRecommendations && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllRecommendations(!showAllRecommendations)} 
                    className="mt-2 text-muted-foreground hover:text-foreground"
                  >
                    {showAllRecommendations ? 'Show Less' : 'Show All Recommendations'}
                    {showAllRecommendations ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className={`border-t pt-3 px-6 pb-3 bg-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground ${isExpanded ? '' : 'hidden'}`}>
            <div className="flex-1">
              <p>{predictionResult.disclaimer}</p>
              {lastPredictedAt && (
                <p className="mt-1">Last predicted {formatRelativeTime(lastPredictedAt)}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGetPrediction} 
              disabled={loading}
              className="whitespace-nowrap"
            >
              Update Prediction
            </Button>
          </CardFooter>
        </>
      )}
      
      {predictionResult && !isExpanded && (
        <CardContent className="pt-0 pb-4 px-6">
          <div className="flex justify-between items-center" onClick={toggleExpanded}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getProbabilityColor(predictionResult.probability_of_success_percentage)}`}>
                <span className="text-white text-xs font-medium">{predictionResult.probability_of_success_percentage}%</span>
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={`${getConfidenceColor(predictionResult.confidence_level)} px-2 py-0.5 text-xs`}
                >
                  {predictionResult.confidence_level} confidence
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {lastPredictedAt && `Last updated ${formatRelativeTime(lastPredictedAt)}`}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground" 
              onClick={toggleExpanded}
            >
              View details
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DealHealthPredictionPanel;
