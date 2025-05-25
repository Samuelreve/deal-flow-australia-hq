
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "./types";

/**
 * Fetch all comments for a specific deal
 */
export const fetchDealComments = async (dealId: string): Promise<Comment[]> => {
  if (!dealId) {
    return [];
  }
  
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      deal_id,
      user_id,
      content,
      created_at,
      profiles (
        name,
        avatar_url
      )
    `)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
  
  // Transform the data to match our Comment type
  return (data || []).map((item: any) => ({
    id: item.id,
    deal_id: item.deal_id,
    user_id: item.user_id,
    content: item.content,
    created_at: item.created_at,
    profiles: {
      name: item.profiles?.name || 'Unknown User',
      avatar_url: item.profiles?.avatar_url || null
    }
  }));
};

/**
 * Add a new comment
 */
export const addComment = async (dealId: string, userId: string, content: string): Promise<void> => {
  const { error } = await supabase
    .from("comments")
    .insert({
      deal_id: dealId,
      user_id: userId,
      content: content.trim()
    });

  if (error) {
    console.error("Error posting comment:", error);
    throw error;
  }
};

/**
 * Get an authentication token from the current session
 */
export const getAuthToken = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session?.access_token) {
    throw new Error("Unauthorized: No auth token");
  }
  
  return data.session.access_token;
};
