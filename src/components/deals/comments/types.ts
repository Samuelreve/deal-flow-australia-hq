
export interface Comment {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface UseCommentsProps {
  dealId: string;
}
