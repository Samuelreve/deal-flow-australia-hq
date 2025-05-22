
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
