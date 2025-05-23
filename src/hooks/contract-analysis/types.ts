
export interface DocumentMetadata {
  name: string;
  type: string;
  uploadDate: string;
  status: string;
  version: string;
  versionDate: string;
}

export interface SummaryItem {
  title: string;
  content: string;
}

export interface SummaryData {
  summary: SummaryItem[];
  disclaimer: string;
}

export interface Question {
  question: string;
  answer: string;
}

export interface Highlight {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  color: string;
  category?: 'risk' | 'obligation' | 'key term' | 'custom';
  note?: string;
  createdAt: string;
}

export interface HighlightCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}
