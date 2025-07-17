
export interface DocumentMetadata {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  size: number;
  type: string;
  status: "draft" | "final" | "signed";
  version: number;
  milestone_id: string | null;
  category: string | null;
  latest_version_id: string | null;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface DocumentVersionMetadata {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  size: number;
  type: string;
  uploaded_by: string;
  uploaded_at: string;
  created_at: string;
  description: string | null;
}
