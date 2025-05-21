
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentAnalysis } from '@/services/documentAnalysisService';
import { FileText, History, Loader2 } from 'lucide-react';

interface DocumentAnalysisHistoryProps {
  analyses: DocumentAnalysis[];
  loading: boolean;
  onSelectAnalysis: (analysis: DocumentAnalysis) => void;
  selectedAnalysisId?: string;
}

const DocumentAnalysisHistory: React.FC<DocumentAnalysisHistoryProps> = ({
  analyses,
  loading,
  onSelectAnalysis,
  selectedAnalysisId
}) => {
  // Format the analysis type for display
  const formatAnalysisType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No analysis history found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedAnalysisId === analysis.id
                ? 'bg-primary/10 border-primary/30'
                : 'hover:bg-muted'
            }`}
            onClick={() => onSelectAnalysis(analysis)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatAnalysisType(analysis.analysisType)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(analysis.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {analysis.analysisType === 'contract_summary' 
                ? analysis.analysisContent?.summary?.substring(0, 100) + '...' 
                : 'Click to view analysis results'}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentAnalysisHistory;
