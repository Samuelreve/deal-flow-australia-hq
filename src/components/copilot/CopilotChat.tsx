
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Loader2, Send, Compass, ListChecks, FileText, Activity, Upload, X } from "lucide-react";
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
  const { messages, loading, sendMessage, suggestNextAction, generateMilestones, summarizeDeal, predictDealHealth, uploadAndAnalyzeDocument, uploadedDocument, clearUploadedDocument } = useCopilot({ initialDealId: dealId });
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndAnalyzeDocument(file);
    }
  };

  return (
    <Card className="w-[420px] h-[640px] copilot-card overflow-hidden border-0 bg-card/95">
      <div className="copilot-gradient text-primary-foreground px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">AI Copilot</span>
            <p className="text-xs text-primary-foreground/80 mt-0.5">Your intelligent deal assistant</p>
          </div>
        </div>
      </div>
      
      <CardContent className="flex flex-col h-[580px] p-6 gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={summarizeDeal} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Summarize deal</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={suggestNextAction} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
              <Compass className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-medium">Next steps</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={generateMilestones} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <ListChecks className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Generate milestones</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={predictDealHealth} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-medium">Show health</span>
          </Button>
        </div>

        {uploadedDocument && (
          <div className="flex items-center gap-3 p-4 bg-secondary/50 border border-border rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{uploadedDocument.name}</span>
              <p className="text-xs text-muted-foreground">Document ready for analysis</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearUploadedDocument}
              className="h-8 w-8 p-0 hover:bg-secondary"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 rounded-xl border bg-secondary/20 p-5 custom-scrollbar">
          <div className="space-y-4">
            {messages.length === 0 && !uploadedDocument && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-2">Ready to assist</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                  I can help analyze your deal, suggest next steps, generate milestones, and provide insights.
                </p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[300px] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'copilot-message-user text-primary-foreground' 
                    : 'copilot-message-assistant text-foreground'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center py-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <span className="font-medium">Analyzing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              placeholder={uploadedDocument ? "Ask about the document..." : "Ask me anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12 bg-background border border-border rounded-xl px-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-12 w-12 rounded-xl border-border hover:bg-secondary transition-all"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-xl copilot-gradient text-primary-foreground border-0 hover:scale-105 transition-all"
            size="icon"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default CopilotChat;
