
import React from 'react';
import { Users, FileText, Brain, PenTool, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface UsageData {
  participants: { used: number; limit: number | null };
  documents: { used: number; limit: number | null };
  aiQueries: { used: number; limit: number | null };
  docusignEnvelopes: { used: number; limit: number | null };
}

interface UsageMeterProps {
  usage: UsageData;
  planName?: string;
  className?: string;
  compact?: boolean;
}

interface UsageItemProps {
  label: string;
  used: number;
  limit: number | null;
  icon: React.ReactNode;
  compact?: boolean;
}

const UsageItem: React.FC<UsageItemProps> = ({ label, used, limit, icon, compact }) => {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isExceeded = !isUnlimited && used >= limit;

  const getStatusColor = () => {
    if (isUnlimited) return 'text-muted-foreground';
    if (isExceeded) return 'text-destructive';
    if (isWarning) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (isExceeded) return 'bg-destructive';
    if (isWarning) return 'bg-warning';
    return 'bg-primary';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className={cn('flex-shrink-0', getStatusColor())}>
                {icon}
              </div>
              <span className="text-sm font-medium">
                {used}{isUnlimited ? '' : `/${limit}`}
              </span>
              {isExceeded && <AlertTriangle className="h-3 w-3 text-destructive" />}
              {isUnlimited && <CheckCircle2 className="h-3 w-3 text-muted-foreground" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}: {used} {isUnlimited ? '(unlimited)' : `of ${limit} used`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('flex-shrink-0', getStatusColor())}>
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {used} {isUnlimited ? '' : `/ ${limit}`}
          </span>
          {isUnlimited && (
            <Badge variant="outline" className="text-xs">Unlimited</Badge>
          )}
          {isExceeded && (
            <Badge variant="destructive" className="text-xs">Exceeded</Badge>
          )}
          {isWarning && !isExceeded && (
            <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
              Low
            </Badge>
          )}
        </div>
      </div>
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />
      )}
    </div>
  );
};

export const UsageMeter: React.FC<UsageMeterProps> = ({
  usage,
  planName,
  className,
  compact = false,
}) => {
  const items = [
    { key: 'participants', label: 'Participants', icon: <Users className="h-4 w-4" />, data: usage.participants },
    { key: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" />, data: usage.documents },
    { key: 'aiQueries', label: 'AI Queries', icon: <Brain className="h-4 w-4" />, data: usage.aiQueries },
    { key: 'docusignEnvelopes', label: 'Signatures', icon: <PenTool className="h-4 w-4" />, data: usage.docusignEnvelopes },
  ];

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 flex-wrap', className)}>
        {items.map((item) => (
          <UsageItem
            key={item.key}
            label={item.label}
            used={item.data.used}
            limit={item.data.limit}
            icon={item.icon}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Usage</CardTitle>
          {planName && (
            <Badge variant="outline">{planName} Plan</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <UsageItem
            key={item.key}
            label={item.label}
            used={item.data.used}
            limit={item.data.limit}
            icon={item.icon}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export const getUsageLimitsForPlan = (planType: 'free' | 'starter' | 'professional' | 'enterprise'): {
  participants: number | null;
  documents: number | null;
  aiQueries: number | null;
  docusignEnvelopes: number | null;
} => {
  switch (planType) {
    case 'free':
      return {
        participants: 2,
        documents: 5,
        aiQueries: 3,
        docusignEnvelopes: 0,
      };
    case 'starter':
      return {
        participants: 4,
        documents: 20,
        aiQueries: 10,
        docusignEnvelopes: 5,
      };
    case 'professional':
      return {
        participants: 10,
        documents: 50,
        aiQueries: 50,
        docusignEnvelopes: 20,
      };
    case 'enterprise':
      return {
        participants: null,
        documents: null,
        aiQueries: null,
        docusignEnvelopes: null,
      };
  }
};

export default UsageMeter;
