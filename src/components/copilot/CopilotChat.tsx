
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

const CopilotChat: React.FC<{ dealId?: string; onHeaderMouseDown?: (e: React.MouseEvent) => void }> = ({ dealId, onHeaderMouseDown }) => {
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
      <div 
        className="copilot-gradient text-primary-foreground px-6 py-5 cursor-grab active:cursor-grabbing select-none relative"
        onMouseDown={onHeaderMouseDown}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-primary-foreground/15 rounded-xl backdrop-blur-sm shadow-lg">
            <Brain className="h-5 w-5 animate-pulse-soft" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">AI Copilot</span>
            <p className="text-xs text-primary-foreground/90 mt-0.5">Your intelligent deal assistant</p>
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
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3 copilot-content-enter"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 relative overflow-hidden">
              <FileText className="h-4 w-4 text-primary relative z-10" />
            </div>
            <span className="text-sm font-medium">Summarize deal</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={suggestNextAction} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3 copilot-content-enter"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/10 relative overflow-hidden">
              <Compass className="h-4 w-4 text-accent relative z-10" />
            </div>
            <span className="text-sm font-medium">Next steps</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={generateMilestones} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3 copilot-content-enter"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 relative overflow-hidden">
              <ListChecks className="h-4 w-4 text-primary relative z-10" />
            </div>
            <span className="text-sm font-medium">Generate milestones</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={predictDealHealth} 
            disabled={loading}
            className="copilot-button h-12 flex items-center gap-3 justify-start text-left p-3 copilot-content-enter"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/10 relative overflow-hidden">
              <Activity className="h-4 w-4 text-accent relative z-10" />
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

        <ScrollArea className="flex-1 rounded-xl border bg-secondary/20 p-5 custom-scrollbar backdrop-blur-sm">
          <div className="space-y-4">
            {messages.length === 0 && !uploadedDocument && (
              <div className="text-center py-12 animate-scale-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6 animate-bounce-gentle">
                  <Brain className="h-8 w-8 text-primary animate-pulse-soft" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Ready to assist</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                  I can help analyze your deal, suggest next steps, generate milestones, and provide insights.
                </p>
              </div>
            )}
            {messages.map((m, index) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[300px] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'copilot-message-user text-primary-foreground' 
                      : 'copilot-message-assistant text-foreground'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center py-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Analyzing...</span>
                  <span className="text-xs text-muted-foreground/70">AI is processing your request</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="flex gap-3 items-end animate-slide-up">
          <div className="flex-1 relative">
            <Input
              placeholder={uploadedDocument ? "Ask about the document..." : "Ask me anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12 bg-background/90 border border-border/50 rounded-xl px-4 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-12 w-12 rounded-xl border-border/50 hover:bg-secondary/80 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-xl copilot-gradient text-primary-foreground border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
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
