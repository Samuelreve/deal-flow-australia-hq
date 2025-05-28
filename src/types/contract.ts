
export interface DocumentMetadata {
  id?: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  version: string;
  versionDate: string;
  size?: number;
  category?: string;
}

export interface QuestionHistoryItem {
  id: string;
  question: string;
  answer: string | { answer: string; sources?: string[] };
  timestamp: number;
  type: 'question' | 'analysis';
  analysisType?: string;
  sources?: string[];
  isProcessing?: boolean;
}

export interface DocumentHighlight {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  color: string;
  category?: 'risk' | 'obligation' | 'key term' | 'custom';
  note?: string;
  createdAt: string;
}

export interface AnalysisProgress {
  stage: string;
  progress: number;
  message?: string;
  startTime?: Date;
}

export interface ContractAnalysisState {
  documentMetadata: DocumentMetadata | null;
  contractText: string;
  customSummary: any | null;
  isAnalyzing: boolean;
  analysisProgress: AnalysisProgress;
  documentHighlights: DocumentHighlight[];
  error: string | null;
}

export interface DocumentUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export interface QuestionAnswerState {
  questionHistory: QuestionHistoryItem[];
  isProcessing: boolean;
  error: string | null;
}
