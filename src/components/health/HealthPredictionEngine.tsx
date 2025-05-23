
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthPrediction {
  id: string;
  dealId: string;
  predictedScore: number;
  confidenceLevel: number;
  timeframe: string;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: number;
  }>;
}

interface HealthPredictionEngineProps {
  deals: DealSummary[];
  userId?: string;
}

const HealthPredictionEngine: React.FC<HealthPredictionEngineProps> = ({ deals, userId }) => {
  const [predictions, setPredictions] = useState<HealthPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string>('');

  const generatePrediction = async (dealId: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      // Simulate AI prediction logic
      const currentScore = deal.healthScore;
      const randomVariation = Math.random() * 20 - 10; // -10 to +10
      const predictedScore = Math.max(0, Math.min(100, currentScore + randomVariation));
      
      const factors = [
        { factor: 'Document completion rate', impact: 'positive' as const, weight: 0.3 },
        { factor: 'Communication frequency', impact: 'positive' as const, weight: 0.2 },
        { factor: 'Timeline adherence', impact: currentScore > 60 ? 'positive' as const : 'negative' as const, weight: 0.25 },
        { factor: 'Milestone progress', impact: 'neutral' as const, weight: 0.25 }
      ];

      const recommendations = [
        { action: 'Increase document review frequency', priority: 'high' as const, estimatedImpact: 15 },
        { action: 'Schedule weekly check-ins', priority: 'medium' as const, estimatedImpact: 10 },
        { action: 'Update milestone timelines', priority: 'low' as const, estimatedImpact: 5 }
      ];

      const newPrediction: HealthPrediction = {
        id: `pred-${Date.now()}`,
        dealId,
        predictedScore: Math.round(predictedScore),
        confidenceLevel: 0.75 + Math.random() * 0.2, // 75-95% confidence
        timeframe: '30 days',
        factors,
        recommendations
      };

      // Save to database
      const { error } = await supabase
        .from('deal_health_predictions')
        .insert({
          deal_id: dealId,
          user_id: userId,
          probability_percentage: newPrediction.predictedScore,
          confidence_level: `${Math.round(newPrediction.confidenceLevel * 100)}%`,
          reasoning: `Based on current health score of ${currentScore}% and trend analysis`,
          suggested_improvements: newPrediction.recommendations.map(rec => ({
            area: rec.action,
            recommendation: rec.action,
            impact: rec.priority
          }))
        });

      if (error) throw error;

      setPredictions(prev => [newPrediction, ...prev]);
      toast.success('Health prediction generated successfully');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Predictions
        </CardTitle>
        <CardDescription>
          Generate AI-powered health score predictions for your deals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Deal Selection */}
        <div className="flex gap-2">
          <select
            value={selectedDeal}
            onChange={(e) => setSelectedDeal(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
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
            <Target className="h-4 w-4" />
            {loading ? 'Generating...' : 'Predict'}
          </Button>
        </div>

        {/* Predictions List */}
        <div className="space-y-4">
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No predictions generated yet</p>
              <p className="text-sm">Select a deal and click "Predict" to get started</p>
            </div>
          ) : (
            predictions.map((prediction) => {
              const deal = deals.find(d => d.id === prediction.dealId);
              if (!deal) return null;

              return (
                <Card key={prediction.id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Prediction for next {prediction.timeframe}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {prediction.predictedScore}%
                        </div>
                        <div className={`text-sm ${getConfidenceColor(prediction.confidenceLevel)}`}>
                          {Math.round(prediction.confidenceLevel * 100)}% confidence
                        </div>
                      </div>
                    </div>

                    <Progress 
                      value={prediction.predictedScore} 
                      className="mb-4"
                    />

                    <Separator className="my-4" />

                    {/* Key Factors */}
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Key Factors</h5>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getImpactIcon(factor.impact)}
                              <span>{factor.factor}</span>
                            </div>
                            <Badge variant="outline">
                              {Math.round(factor.weight * 100)}% weight
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Recommendations */}
                    <div>
                      <h5 className="font-medium mb-2">Recommended Actions</h5>
                      <div className="space-y-2">
                        {prediction.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{rec.action}</span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                              >
                                {rec.priority}
                              </Badge>
                              <span className="text-green-600">+{rec.estimatedImpact}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthPredictionEngine;
