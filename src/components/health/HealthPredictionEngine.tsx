
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Loader2, AlertTriangle, History } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Flexible types to handle both string and object formats from API
interface RiskFactor {
  risk: string;
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
}

interface KeyDriver {
  driver?: string;
  description?: string;
}

interface AIPrediction {
  id: string;
  dealId: string;
  dealTitle: string;
  currentScore: number;
  predictedScore30Days: number;
  predictedScore60Days?: number;
  predictedScore90Days?: number;
  trajectory: 'improving' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
  keyDrivers: (string | KeyDriver)[];
  riskFactors: (string | RiskFactor)[];
  recommendation: string;
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    blockedMilestones: number;
    daysSinceActivity?: number;
  };
  disclaimer: string;
  createdAt?: string;
}

interface HealthPredictionEngineProps {
  deals: DealSummary[];
  userId?: string;
}

// Helper to extract text from string or object
const extractDriverText = (driver: string | KeyDriver): string => {
  if (typeof driver === 'string') return driver;
  return (driver as any)?.driver || (driver as any)?.description || (driver as any)?.area || JSON.stringify(driver);
};

const extractRiskText = (risk: string | RiskFactor): string => {
  if (typeof risk === 'string') return risk;
  return (risk as any)?.risk || (risk as any)?.description || JSON.stringify(risk);
};

// Clamp score to valid 0-100 range
const clampScore = (score: number): number => Math.min(100, Math.max(0, Math.round(score)));

const HealthPredictionEngine: React.FC<HealthPredictionEngineProps> = ({ deals, userId }) => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string>('');

  // Load historical predictions on mount
  useEffect(() => {
    if (userId) {
      loadHistoricalPredictions();
    }
  }, [userId]);

  const loadHistoricalPredictions = async () => {
    if (!userId) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('deal_health_predictions')
        .select(`
          id,
          deal_id,
          probability_percentage,
          confidence_level,
          reasoning,
          suggested_improvements,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const historicalPredictions: AIPrediction[] = data.map(record => {
          const deal = deals.find(d => d.id === record.deal_id);
          const improvements = record.suggested_improvements as any[] || [];
          
          return {
            id: record.id,
            dealId: record.deal_id,
            dealTitle: deal?.title || 'Unknown Deal',
            currentScore: deal?.healthScore || 0,
            predictedScore30Days: clampScore(record.probability_percentage),
            trajectory: record.probability_percentage > (deal?.healthScore || 0) ? 'improving' : 
                       record.probability_percentage < (deal?.healthScore || 0) ? 'declining' : 'stable',
            confidence: (record.confidence_level as 'high' | 'medium' | 'low') || 'medium',
            keyDrivers: improvements.map(imp => imp?.recommendation || imp?.area || JSON.stringify(imp)),
            riskFactors: [],
            recommendation: record.reasoning || 'No recommendation available',
            metrics: {
              totalMilestones: 0,
              completedMilestones: 0,
              overdueMilestones: 0,
              blockedMilestones: 0
            },
            disclaimer: 'Historical prediction - AI-generated analysis for informational purposes only.',
            createdAt: record.created_at
          };
        });

        setPredictions(historicalPredictions);
      }
    } catch (error) {
      console.error('Error loading historical predictions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generatePrediction = async (dealId: string) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }
    
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    setLoading(true);
    try {
      // Call the real AI prediction edge function
      const { data, error } = await supabase.functions.invoke('document-ai-assistant', {
        body: {
          operation: 'predict_deal_health',
          dealId,
          userId
        }
      });

      if (error) throw error;

      const prediction = data.prediction;
      const metrics = data.metrics;

      // Clamp predicted scores to valid 0-100 range
      const clampedScore30 = clampScore(prediction.predictedScore30Days);
      const clampedScore60 = prediction.predictedScore60Days ? clampScore(prediction.predictedScore60Days) : undefined;
      const clampedScore90 = prediction.predictedScore90Days ? clampScore(prediction.predictedScore90Days) : undefined;

      const newPrediction: AIPrediction = {
        id: `pred-${Date.now()}`,
        dealId,
        dealTitle: deal.title,
        currentScore: prediction.currentScore,
        predictedScore30Days: clampedScore30,
        predictedScore60Days: clampedScore60,
        predictedScore90Days: clampedScore90,
        trajectory: prediction.trajectory || 'stable',
        confidence: prediction.confidence || 'medium',
        keyDrivers: prediction.keyDrivers || [],
        riskFactors: prediction.riskFactors || [],
        recommendation: prediction.recommendation || 'No specific recommendations at this time.',
        metrics: {
          totalMilestones: metrics.totalMilestones,
          completedMilestones: metrics.completedMilestones,
          overdueMilestones: metrics.overdueMilestones,
          blockedMilestones: metrics.blockedMilestones,
          daysSinceActivity: metrics.daysSinceActivity
        },
        disclaimer: data.disclaimer,
        createdAt: new Date().toISOString()
      };

      // Save to database with clamped score
      await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: clampedScore30,
          confidence_level: prediction.confidence,
          reasoning: prediction.recommendation,
          suggested_improvements: (prediction.keyDrivers || []).map((driver: string | KeyDriver) => ({
            area: 'Key Driver',
            recommendation: extractDriverText(driver),
            impact: 'medium'
          }))
        });

      setPredictions(prev => [newPrediction, ...prev]);
      toast.success('AI prediction generated successfully');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate AI prediction');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      case 'low': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-success" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-destructive" />;
      default: return <CheckCircle className="h-5 w-5 text-warning" />;
    }
  };

  const getTrajectoryBadge = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return <Badge className="bg-success/10 text-success border-success/20">Improving</Badge>;
      case 'declining': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declining</Badge>;
      default: return <Badge className="bg-warning/10 text-warning border-warning/20">Stable</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Predictions
        </CardTitle>
        <CardDescription>
          Generate AI-powered health score predictions using real deal data and milestone analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Deal Selection */}
        <div className="flex gap-2">
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select a deal...</option>
            {deals.map(deal => (
              <option key={deal.id} value={deal.id}>
                {deal.title} (Current: {deal.healthScore}%)
              </option>
            ))}
          </select>
          
          <Button
            onClick={() => selectedDeal && generatePrediction(selectedDeal)}
            disabled={!selectedDeal || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Predict
              </>
            )}
          </Button>
        </div>

        {/* Loading History State */}
        {loadingHistory && (
          <div className="text-center py-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading prediction history...</p>
          </div>
        )}

        {/* Predictions List */}
        <div className="space-y-4">
          {predictions.length === 0 && !loadingHistory ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No predictions generated yet</p>
              <p className="text-sm">Select a deal and click "Predict" to get AI-powered health analysis</p>
            </div>
          ) : (
            predictions.map((prediction) => (
              <Card key={prediction.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTrajectoryIcon(prediction.trajectory)}
                      <div>
                        <h4 className="font-semibold">{prediction.dealTitle}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>AI Prediction</span>
                          {getTrajectoryBadge(prediction.trajectory)}
                          {prediction.createdAt && (
                            <span className="flex items-center gap-1 text-xs">
                              <History className="h-3 w-3" />
                              {formatDate(prediction.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {prediction.predictedScore30Days}%
                      </div>
                      <div className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence} confidence
                      </div>
                    </div>
                  </div>

                  {/* Score Comparison */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-lg font-bold">{prediction.currentScore}%</p>
                    </div>
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <p className="text-xs text-muted-foreground">30 Days</p>
                      <p className="text-lg font-bold text-primary">{prediction.predictedScore30Days}%</p>
                    </div>
                    {prediction.predictedScore60Days && (
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">60 Days</p>
                        <p className="text-lg font-bold">{prediction.predictedScore60Days}%</p>
                      </div>
                    )}
                  </div>

                  <Progress 
                    value={prediction.predictedScore30Days} 
                    className="mb-4"
                  />

                  {/* Metrics Summary */}
                  {prediction.metrics.totalMilestones > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                      <div className="text-center p-2 border rounded">
                        <p className="font-medium">{prediction.metrics.totalMilestones}</p>
                        <p className="text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <p className="font-medium text-success">{prediction.metrics.completedMilestones}</p>
                        <p className="text-muted-foreground">Done</p>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <p className="font-medium text-warning">{prediction.metrics.overdueMilestones}</p>
                        <p className="text-muted-foreground">Overdue</p>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <p className="font-medium text-destructive">{prediction.metrics.blockedMilestones}</p>
                        <p className="text-muted-foreground">Blocked</p>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Key Drivers */}
                  {prediction.keyDrivers.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Key Drivers
                      </h5>
                      <ul className="space-y-1">
                        {prediction.keyDrivers.map((driver, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            {extractDriverText(driver)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {prediction.riskFactors.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        Risk Factors
                      </h5>
                      <ul className="space-y-1">
                        {prediction.riskFactors.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            {extractRiskText(risk)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Recommendation */}
                  <div className="bg-muted p-3 rounded-lg">
                    <h5 className="font-medium mb-1">AI Recommendation</h5>
                    <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    {prediction.disclaimer}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthPredictionEngine;
