
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tempDealService } from "@/services/tempDealService";
import { DocumentTextExtractionService } from "@/services/documentTextExtraction";
import { toast } from "sonner";

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
  const [uploadedDocument, setUploadedDocument] = useState<{ name: string; content: string } | null>(null);
  const initializedRef = useRef(false);

  // Storage key for persisting messages
  const storageKey = useMemo(() => `copilot_messages_${dealId || 'default'}`, [dealId]);

  // Load messages from localStorage and clean up old ones
  const loadPersistedMessages = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: CopilotMessage[] = JSON.parse(stored);
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours
        
        // Filter out messages older than 24 hours
        const validMessages = parsed.filter(msg => (now - msg.timestamp) < oneDayInMs);
        
        // Update localStorage if we removed any messages
        if (validMessages.length !== parsed.length) {
          localStorage.setItem(storageKey, JSON.stringify(validMessages));
        }
        
        return validMessages;
      }
    } catch (error) {
      console.warn('Failed to load persisted copilot messages:', error);
      localStorage.removeItem(storageKey);
    }
    return [];
  }, [storageKey]);

  // Save messages to localStorage
  const saveMessages = useCallback((msgs: CopilotMessage[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (error) {
      console.warn('Failed to save copilot messages:', error);
    }
  }, [storageKey]);

  // Load persisted messages on mount
  useEffect(() => {
    if (!initializedRef.current) {
      const persistedMessages = loadPersistedMessages();
      if (persistedMessages.length > 0) {
        setMessages(persistedMessages);
      }
      initializedRef.current = true;
    }
  }, [loadPersistedMessages]);

  // Save messages whenever they change
  useEffect(() => {
    if (initializedRef.current && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

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
    setMessages(prev => {
      const newMessages = [
        ...prev,
        { id: crypto.randomUUID(), role, content, timestamp: Date.now() }
      ];
      // Auto-cleanup: remove messages older than 24 hours
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      return newMessages.filter(msg => (now - msg.timestamp) < oneDayInMs);
    });
  }, []);

  // Helper to call the AI assistant edge function
  const callAssistant = useCallback(async (payload: any) => {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      setUserId(user.id);
    }
    const body = { userId: userId || (await supabase.auth.getUser()).data.user?.id, ...payload };
    const { data, error } = await supabase.functions.invoke('copilot', { body });
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
        chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
        context: uploadedDocument ? { uploadedDocument } : undefined
      });
      const aiText = data.answer || data.response || data.suggestion || 'I have noted that.';
      addMessage("assistant", aiText);
    } catch (e: any) {
      addMessage("assistant", `Sorry, I couldn't process that. ${e.message ?? ''}`.trim());
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext, messages, uploadedDocument]);

  const suggestNextAction = useCallback(async () => {
    setLoading(true);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({ operation: 'suggest_next_action', dealId: activeDealId });
      const aiText = data.suggestion || data.response || 'Here is your next recommended step.';
      addMessage("assistant", aiText);
      return aiText;
    } catch (e: any) {
      const msg = `Unable to fetch next action. ${e.message ?? ''}`.trim();
      addMessage("assistant", msg);
      return '';
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
      return text;
    } catch (e: any) {
      const msg = `Unable to generate milestones. ${e.message ?? ''}`.trim();
      addMessage("assistant", msg);
      return '';
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
      return aiText;
    } catch (e: any) {
      const msg = `Unable to summarize deal. ${e.message ?? ''}`.trim();
      addMessage("assistant", msg);
      return '';
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext]);

  const predictDealHealth = useCallback(async () => {
    setLoading(true);
    try {
      const activeDealId = await ensureDealContext();
      const data = await callAssistant({ operation: 'predict_deal_health', dealId: activeDealId });
      const pct = data.probability_of_success_percentage ?? data.predicted_score;
      const conf = data.confidence_level ?? data.confidence;
      const summary = `Deal health prediction: ${pct ?? 'N/A'}% success probability${conf ? ` (confidence: ${conf})` : ''}.`;
      addMessage("assistant", summary);
      return summary;
    } catch (e: any) {
      const msg = `Unable to predict deal health. ${e.message ?? ''}`.trim();
      addMessage("assistant", msg);
      return '';
    } finally {
      setLoading(false);
    }
  }, [addMessage, callAssistant, ensureDealContext]);

  const uploadAndAnalyzeDocument = useCallback(async (file: File) => {
    if (!DocumentTextExtractionService.isSupportedFileType(file)) {
      toast.error("Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }

    setLoading(true);
    try {
      const result = await DocumentTextExtractionService.extractTextFromFile(file);
      if (result.success && result.text) {
        setUploadedDocument({ name: file.name, content: result.text });
        addMessage("assistant", `✅ Document "${file.name}" uploaded successfully! I can now answer questions about this document.`);
        toast.success(`Document "${file.name}" uploaded and analyzed successfully!`);
      } else {
        throw new Error(result.error || "Failed to extract text from document");
      }
    } catch (e: any) {
      toast.error("Failed to process document: " + (e.message || "Unknown error"));
      addMessage("assistant", "Sorry, I couldn't process that document. Please try again with a different file.");
    } finally {
      setLoading(false);
    }
  }, [addMessage]);

  const clearUploadedDocument = useCallback(() => {
    setUploadedDocument(null);
    addMessage("assistant", "Document removed. I'm back to general assistance mode.");
  }, [addMessage]);

  return {
    messages,
    loading,
    dealId,
    sendMessage,
    suggestNextAction,
    generateMilestones,
    summarizeDeal,
    predictDealHealth,
    ensureDealContext,
    uploadAndAnalyzeDocument,
    uploadedDocument,
    clearUploadedDocument,
  };
}
