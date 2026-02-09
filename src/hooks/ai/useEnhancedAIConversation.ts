import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessCategoryDetection } from "./useBusinessCategoryDetection";
import { parseSSEStream } from "@/lib/streaming";

interface FunctionCallResult {
  function: string;
  args: any;
  result: {
    success: boolean;
    result?: any;
    error?: string;
  };
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  category?: string;
  confidence?: number;
  documentContext?: string;
  isStreaming?: boolean;
  functionCalls?: FunctionCallResult[];
}

const STORAGE_KEY = "trustroom_ai_conversation";
const MAX_STORED_MESSAGES = 50;

// Load conversation from localStorage
function loadConversation(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (error) {
    console.error("Failed to load conversation from storage:", error);
  }
  return [];
}

// Save conversation to localStorage
function saveConversation(messages: Message[]) {
  try {
    // Only save last N messages to prevent storage bloat
    const toSave = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error("Failed to save conversation to storage:", error);
  }
}

interface UseEnhancedAIConversationOptions {
  documentContent?: string;
  dealId?: string;
  enableFunctions?: boolean;
}

export const useEnhancedAIConversation = (options: UseEnhancedAIConversationOptions = {}) => {
  const { documentContent, dealId, enableFunctions = true } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const { detectCategory } = useBusinessCategoryDetection();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    const storedMessages = loadConversation();

    const welcomeMessage: Message = {
      id: "welcome",
      content: `Welcome to Trustroom AI Advisor! 🚀

I'm your expert AI advisor for mergers, acquisitions, and business transactions. With expertise across thousands of deals, I can help you with:

🎯 What I Can Do: 
• Deal Strategy — Structure deals, evaluate options, develop negotiation tactics
• Valuation — EBITDA multiples, DCF analysis, comparable transactions
• Due Diligence — Financial, legal, commercial, and operational checklists
• Contracts — NDA, LOI, Purchase Agreement analysis and guidance
• Negotiations — Tactics, leverage points, term optimization

${
  dealId
    ? `⚡ Actions I Can Take:
• Create milestones and tasks for your deal
• Generate due diligence checklists
• Send invitations to deal participants
• Update milestone status
• Get deal status and progress summaries

`
    : ""
}✨ Get Started:
${
  dealId
    ? 'Try "Create a due diligence checklist" or "What\'s the status of this deal?"'
    : 'Ask me anything like "How do I value a SaaS business?" or upload a document for instant analysis.'
}

What can I help you with today?`,
      role: "assistant",
      timestamp: new Date(),
      category: "strategy",
    };

    if (storedMessages.length > 0) {
      // Show restored messages but with fresh welcome
      setMessages([welcomeMessage, ...storedMessages.filter((m) => m.id !== "welcome")]);
    } else {
      setMessages([welcomeMessage]);
    }
  }, [dealId]);

  // Save conversation when messages change (excluding welcome and streaming)
  useEffect(() => {
    const messagesToSave = messages.filter((m) => m.id !== "welcome" && !m.isStreaming);
    if (messagesToSave.length > 0) {
      saveConversation(messagesToSave);
    }
  }, [messages]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        id: "welcome",
        content: `Conversation cleared! I'm ready for a fresh start.

What would you like to discuss?`,
        role: "assistant",
        timestamp: new Date(),
        category: "strategy",
      },
    ]);
    toast.success("Conversation history cleared");
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return;

    // Detect category from user input
    const detection = detectCategory(inputValue);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
      documentContext: documentContent,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);
    setStreamedContent("");

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Add placeholder streaming message
    const streamingMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: streamingMsgId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        category: detection.category,
        confidence: detection.confidence,
        isStreaming: true,
      },
    ]);

    try {
      // Build chat history for context (exclude welcome and current streaming)
      const chatHistory = messages
        .filter((m) => m.id !== "welcome" && !m.isStreaming)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      console.log("Sending message to AI assistant:", {
        message: currentInput,
        category: detection.category,
        hasDocument: !!documentContent,
        historyLength: chatHistory.length,
        dealId,
        enableFunctions,
      });

      // Get session for auth
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const supabaseUrl = "https://wntmgfuclbdrezxcvzmw.supabase.co";

      // Determine if we should stream (only when functions are not expected to be used)
      const shouldStream = !dealId || !enableFunctions;

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          message: currentInput,
          category: detection.category,
          documentContext: documentContent,
          chatHistory,
          stream: shouldStream,
          dealId,
          enableFunctions: enableFunctions && !!dealId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }

      // Check content type to determine if streaming
      const contentType = response.headers.get("content-type");
      const isStreamResponse = contentType?.includes("text/event-stream");

      if (isStreamResponse) {
        setIsStreaming(true);
        let fullContent = "";

        await parseSSEStream(response, {
          onDelta: (text) => {
            fullContent += text;
            setStreamedContent(fullContent);
            // Update the streaming message content
            setMessages((prev) => prev.map((m) => (m.id === streamingMsgId ? { ...m, content: fullContent } : m)));
          },
          onDone: () => {
            // Finalize the message
            setMessages((prev) =>
              prev.map((m) => (m.id === streamingMsgId ? { ...m, content: fullContent, isStreaming: false } : m)),
            );
            setIsStreaming(false);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Stream error:", error);
            throw error;
          },
        });
      } else {
        // JSON response (with potential function calls)
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get AI response");
        }

        let responseContent = data.response || "";

        // If there were function calls, format them nicely
        if (data.functionCalls && data.functionCalls.length > 0) {
          const functionSummary = data.functionCalls
            .map((fc: FunctionCallResult) => {
              if (fc.result.success) {
                return `✅ **${formatFunctionName(fc.function)}**: ${fc.result.result?.message || "Completed successfully"}`;
              } else {
                return `❌ **${formatFunctionName(fc.function)}**: ${fc.result.error || "Failed"}`;
              }
            })
            .join("\n");

          if (responseContent) {
            responseContent = `${functionSummary}\n\n${responseContent}`;
          } else {
            responseContent = functionSummary;
          }

          // Show toast for successful actions
          const successCount = data.functionCalls.filter((fc: FunctionCallResult) => fc.result.success).length;
          if (successCount > 0) {
            toast.success(`Completed ${successCount} action${successCount > 1 ? "s" : ""}`);
          }
        }

        // Update the message with final content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsgId
              ? {
                  ...m,
                  content: responseContent,
                  isStreaming: false,
                  functionCalls: data.functionCalls,
                }
              : m,
          ),
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle abort
      if (error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsgId
              ? { ...m, content: streamedContent || "Response cancelled.", isStreaming: false }
              : m,
          ),
        );
        setIsStreaming(false);
        setIsLoading(false);
        return;
      }

      console.error("Error getting AI response:", error);

      // Update streaming message to error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                isStreaming: false,
              }
            : m,
        ),
      );

      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [
    inputValue,
    isLoading,
    isStreaming,
    messages,
    documentContent,
    detectCategory,
    streamedContent,
    dealId,
    enableFunctions,
  ]);

  const handleFeedback = useCallback((messageId: string, helpful: boolean) => {
    console.log(`Feedback for message ${messageId}: ${helpful ? "helpful" : "not helpful"}`);
    toast.success(helpful ? "Thanks for your feedback!" : "Thanks! We'll work to improve.");
  }, []);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isStreaming,
    streamedContent,
    handleSendMessage,
    handleFeedback,
    cancelStream,
    clearHistory,
  };
};

// Helper function to format function names nicely
function formatFunctionName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
