
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
        // Fetch counts for each version ID
        const { data, error } = await supabase
          .from("document_comments")
          .select('document_version_id, count(*)', { count: 'exact' })
          .in("document_version_id", versionIds)
          .groupby('document_version_id');

        if (error) throw new Error(error.message);

        // Convert the result to a record of {versionId: count}
        const counts: Record<string, number> = {};
        if (data) {
          data.forEach((item) => {
            counts[item.document_version_id] = parseInt(item.count, 10);
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
