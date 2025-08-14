
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
    <Card className="w-[400px] h-[600px] shadow-xl overflow-hidden border-0">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6" />
          <span className="text-lg font-semibold">Copilot</span>
        </div>
      </div>
      
      <CardContent className="flex flex-col h-[540px] p-4 gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={summarizeDeal} 
            disabled={loading}
            className="flex items-center gap-2 justify-start bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200 text-gray-700"
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm">Summarize deal</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={suggestNextAction} 
            disabled={loading}
            className="flex items-center gap-2 justify-start bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200 text-gray-700"
          >
            <Compass className="h-4 w-4" />
            <span className="text-sm">Next steps</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateMilestones} 
            disabled={loading}
            className="flex items-center gap-2 justify-start bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200 text-gray-700 col-span-1"
          >
            <ListChecks className="h-4 w-4" />
            <span className="text-sm">Generate milestones</span>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={predictDealHealth} 
            disabled={loading}
            className="flex items-center gap-2 justify-start bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200 text-gray-700"
          >
            <Activity className="h-4 w-4" />
            <span className="text-sm">Show health</span>
          </Button>
        </div>

        {uploadedDocument && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800 flex-1 font-medium">{uploadedDocument.name}</span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearUploadedDocument}
              className="h-7 w-7 p-0 hover:bg-green-100"
            >
              <X className="h-4 w-4 text-green-600" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1 rounded-lg border bg-gray-50/50 p-4">
          <div className="space-y-4">
            {messages.length === 0 && !uploadedDocument && (
              <div className="text-sm text-gray-500 text-center py-8">
                Ask me anything about your deal. I can suggest next steps, generate milestones, and summarise progress.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[280px] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={onSubmit} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Input
              placeholder={uploadedDocument ? "Ask me about the document..." : "Type a question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pr-12 bg-white border-2 border-gray-200 focus:border-blue-400"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="border-2 border-gray-200 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
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
