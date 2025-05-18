
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCommentCounts(versionIds: string[]) {
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCommentCounts = async () => {
      if (!versionIds.length) {
        setCommentCounts({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Instead of using groupBy, let's try a different approach that should work
        // with your version of Supabase client
        const { data, error } = await supabase
          .from("document_comments")
          .select('*')
          .in("document_version_id", versionIds);

        if (error) throw new Error(error.message);

        // Manually count comments for each version ID
        const counts: Record<string, number> = {};
        
        // Initialize counts for all requested version IDs
        versionIds.forEach(id => {
          counts[id] = 0;
        });
        
        // Count comments for each version ID
        if (data) {
          data.forEach((comment) => {
            const versionId = comment.document_version_id;
            counts[versionId] = (counts[versionId] || 0) + 1;
          });
        }

        setCommentCounts(counts);
      } catch (err) {
        console.error("Error fetching document comment counts:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommentCounts();
  }, [versionIds]);

  return {
    commentCounts,
    isLoading,
    error,
  };
}
