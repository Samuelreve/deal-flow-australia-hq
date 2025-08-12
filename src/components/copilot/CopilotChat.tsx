
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Send, Compass, ListChecks, FileText, Activity } from "lucide-react";
import { useCopilot } from "./useCopilot";

const QuickActions: React.FC<{
  onNext: () => void;
  onMilestones: () => void;
  onSummary: () => void;
  onHealth: () => void;
  loading: boolean;
}> = ({ onNext, onMilestones, onSummary, onHealth, loading }) => (
  <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="secondary" onClick={onSummary} disabled={loading}>
      <FileText className="h-4 w-4" /> Summarize deal
    </Button>
    <Button size="sm" variant="secondary" onClick={onNext} disabled={loading}>
      <Compass className="h-4 w-4" /> Next steps
    </Button>
    <Button size="sm" variant="secondary" onClick={onMilestones} disabled={loading}>
      <ListChecks className="h-4 w-4" /> Generate milestones
    </Button>
    <Button size="sm" variant="secondary" onClick={onHealth} disabled={loading}>
      <Activity className="h-4 w-4" /> Show health
    </Button>
  </div>
);

const CopilotChat: React.FC<{ dealId?: string }> = ({ dealId }) => {
  const { messages, loading, sendMessage, suggestNextAction, generateMilestones, summarizeDeal, predictDealHealth } = useCopilot({ initialDealId: dealId });
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
    <Card className="w-[360px] h-[520px] shadow-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">Copilot</span>
          </div>
        </div>
      </div>
      <CardContent className="flex flex-col h-[420px] gap-3">
        <QuickActions
          onNext={suggestNextAction}
          onMilestones={generateMilestones}
          onSummary={summarizeDeal}
          onHealth={predictDealHealth}
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
