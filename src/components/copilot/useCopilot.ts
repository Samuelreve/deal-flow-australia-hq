
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tempDealService } from "@/services/tempDealService";

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

interface UseCopilotOptions {
  initialDealId?: string;
}

export function useCopilot(options: UseCopilotOptions = {}) {
  const { initialDealId } = options;
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dealId, setDealId] = useState<string | null>(initialDealId || null);
  const [userId, setUserId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Init auth user
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) setUserId(user?.id || null);
    })();
    return () => { mounted = false; };
  }, []);

  const ensureDealContext = useCallback(async () => {
    if (dealId) return dealId;
    // Create a temporary analysis deal for Copilot sessions
    const temp = await tempDealService.createTempDeal({
      title: "Copilot Session",
      description: "Temporary deal for Copilot guidance",
      type: "analysis",
    });
    setDealId(temp.dealId);
    return temp.dealId;
  }, [dealId]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role, content, timestamp: Date.now() }
    ]);
  }, []);

  // Helper to call the AI assistant edge function
  const callAssistant = useCallback(async (payload: any) => {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      setUserId(user.id);
    }
    const body = { userId: userId || (await supabase.auth.getUser()).data.user?.id, ...payload };
    const { data, error } = await supabase.functions.invoke('document-ai-assistant', { body });
    if (error) throw new Error(error.message || 'Assistant error');
    return data as any;
  }, [userId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text?.trim()) return;
    setLoading(true);
    addMessage("user", text);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({
        operation: 'deal_chat_query',
        dealId: activeDealId,
        content: text,
        chatHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });
      const aiText = data.answer || data.response || data.suggestion || 'I have noted that.';
      addMessage("assistant", aiText);
    } catch (e: any) {
      addMessage("assistant", `Sorry, I couldn't process that. ${e.message ?? ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext, messages]);

  const suggestNextAction = useCallback(async () => {
    setLoading(true);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({ operation: 'suggest_next_action', dealId: activeDealId });
      const aiText = data.suggestion || data.response || 'Here is your next recommended step.';
      addMessage("assistant", aiText);
    } catch (e: any) {
      addMessage("assistant", `Unable to fetch next action. ${e.message ?? ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext]);

  const generateMilestones = useCallback(async () => {
    setLoading(true);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({ operation: 'generate_milestones', dealId: activeDealId });
      const text = Array.isArray(data.milestones)
        ? `Suggested milestones:\n- ${data.milestones.map((m: any) => m.title || m).join("\n- ")}`
        : (data.response || 'Generated milestones for your deal.');
      addMessage("assistant", text);
    } catch (e: any) {
      addMessage("assistant", `Unable to generate milestones. ${e.message ?? ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext]);

  const summarizeDeal = useCallback(async () => {
    setLoading(true);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({ operation: 'summarize_deal', dealId: activeDealId });
      const aiText = data.summary || data.response || 'Here is the current deal summary.';
      addMessage("assistant", aiText);
    } catch (e: any) {
      addMessage("assistant", `Unable to summarize deal. ${e.message ?? ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext]);

  return {
    messages,
    loading,
    dealId,
    sendMessage,
    suggestNextAction,
    generateMilestones,
    summarizeDeal,
    ensureDealContext,
  };
}
