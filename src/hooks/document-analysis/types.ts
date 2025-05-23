
export interface AnalysisType {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: 'basic' | 'advanced' | 'legal' | 'financial';
}

export interface AnalysisRequest {
  documentId: string;
  versionId: string;
  analysisType: string;
  dealId: string;
  saveToHistory?: boolean;
}

export interface AnalysisResult {
  type: string;
  content: any;
  disclaimer?: string;
  timestamp: Date;
  success: boolean;
}

export interface AnalysisProgress {
  stage: string;
  progress: number;
  message?: string;
  startTime?: Date;
}

export interface AnalysisHistory {
  id: string;
  analysisType: string;
  analysisContent: any;
  createdAt: string;
  documentId: string;
  documentVersionId: string;
}
