
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Send, Compass, ListChecks, FileText } from "lucide-react";
import { useCopilot } from "./useCopilot";

const QuickActions: React.FC<{
  onNext: () => void;
  onMilestones: () => void;
  onSummary: () => void;
  loading: boolean;
}> = ({ onNext, onMilestones, onSummary, loading }) => (
  <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="secondary" onClick={onNext} disabled={loading}>
      <Compass className="h-4 w-4" /> Next step
    </Button>
    <Button size="sm" variant="secondary" onClick={onMilestones} disabled={loading}>
      <ListChecks className="h-4 w-4" /> Milestones
    </Button>
    <Button size="sm" variant="secondary" onClick={onSummary} disabled={loading}>
      <FileText className="h-4 w-4" /> Summary
    </Button>
  </div>
);

const CopilotChat: React.FC = () => {
  const { messages, loading, sendMessage, suggestNextAction, generateMilestones, summarizeDeal } = useCopilot();
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    sendMessage(text);
  };

  return (
    <Card className="w-[360px] h-[520px] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5" /> Deal Copilot (AU)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[420px] gap-3">
        <QuickActions
          onNext={suggestNextAction}
          onMilestones={generateMilestones}
          onSummary={summarizeDeal}
          loading={loading}
        />

        <div ref={scrollerRef} className="flex-1 rounded-md border bg-background/60 p-3 overflow-y-auto">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Ask me anything about your deal. I can suggest next steps, generate milestones, and summarise progress.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="Type a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                // submit on Enter
              }
            }}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CopilotChat;
