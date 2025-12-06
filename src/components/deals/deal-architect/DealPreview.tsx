import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Edit2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DealCreationData } from '../deal-creation/types';
import { GeneratedMilestone } from './hooks/useDealArchitect';

interface DealPreviewProps {
  dealData: Partial<DealCreationData>;
  milestones: GeneratedMilestone[];
  confidence: 'low' | 'medium' | 'high';
  onConfirm: () => void;
  onToggleMilestone: (index: number) => void;
  onUpdateMilestone: (index: number, updates: Partial<GeneratedMilestone>) => void;
  onContinueChat: () => void;
}

export function DealPreview({
  dealData,
  milestones,
  confidence,
  onConfirm,
  onToggleMilestone,
  onUpdateMilestone,
  onContinueChat
}: DealPreviewProps) {
  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'Not specified';
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: dealData.currency || 'AUD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const selectedMilestones = milestones.filter(m => m.selected !== false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Deal Ready for Creation</h3>
        </div>
        <Badge 
          variant={confidence === 'high' ? 'default' : confidence === 'medium' ? 'secondary' : 'outline'}
          className="capitalize"
        >
          {confidence} confidence
        </Badge>
      </div>

      {/* Deal Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Deal Title</p>
                <p className="font-medium">{dealData.dealTitle || 'Untitled Deal'}</p>
                {dealData.businessTradingName && (
                  <p className="text-sm text-muted-foreground">{dealData.businessTradingName}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Asking Price</p>
                <p className="font-medium">{formatCurrency(dealData.askingPrice)}</p>
              </div>
            </div>

            {dealData.dealCategory && (
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="capitalize">
                  {dealData.dealCategory.replace('_', ' ')}
                </Badge>
              </div>
            )}

            {dealData.targetCompletionDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Target Date</p>
                  <p className="font-medium">{dealData.targetCompletionDate}</p>
                </div>
              </div>
            )}
          </div>

          {dealData.dealDescription && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dealData.dealDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones Preview */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Generated Milestones ({selectedMilestones.length}/{milestones.length})</span>
              <span className="text-xs font-normal text-muted-foreground">
                Deselect any you don't need
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      milestone.selected !== false ? 'bg-muted/50' : 'opacity-50'
                    }`}
                  >
                    <Checkbox
                      checked={milestone.selected !== false}
                      onCheckedChange={() => onToggleMilestone(index)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{milestone.name}</p>
                      {milestone.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      #{milestone.order}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Warning for low confidence */}
      {confidence === 'low' && (
        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            I may be missing some information. Consider providing more details or you can add them later.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onContinueChat} className="flex-1">
          <Edit2 className="h-4 w-4 mr-2" />
          Refine Details
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Create Deal
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        You can always edit deal details after creation
      </p>
    </div>
  );
}

export default DealPreview;
