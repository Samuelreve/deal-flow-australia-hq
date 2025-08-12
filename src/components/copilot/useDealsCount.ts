
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDealsCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) { setCount(0); setLoading(false); }
          return;
        }
        // Count deals where user is seller/buyer or participant
        const { data: participantDeals } = await supabase
          .from('deal_participants')
          .select('deal_id', { count: 'exact' })
          .eq('user_id', user.id);
        const { data: ownDeals } = await supabase
          .from('deals')
          .select('id', { count: 'exact' })
          .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);
        const unique = new Set<string>([...(participantDeals?.map(d => d.deal_id) || [])]);
        (ownDeals || []).forEach(d => unique.add((d as any).id));
        if (mounted) setCount(unique.size);
      } catch {
        if (mounted) setCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { count, loading };
}
