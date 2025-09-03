import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Sparkles, Brain } from "lucide-react";
import { useCopilot } from "./useCopilot";

const SuggestionCard: React.FC<{ title: string; description?: string; cta?: string; onClick?: () => void; icon?: React.ReactNode; }>
= ({ title, description, cta, onClick, icon }) => (
  <div className="rounded-xl border bg-card p-4 flex items-start gap-3 copilot-button">
    <div className="mt-1 text-primary">{icon || <CheckCircle2 className="h-4 w-4" />}</div>
    <div className="flex-1">
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{description}</div>}
      {cta && (
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={onClick} className="text-xs">{cta}</Button>
        </div>
      )}
    </div>
  </div>
);

const CopilotSuggestions: React.FC<{ onHeaderMouseDown?: (e: React.MouseEvent) => void }> = ({ onHeaderMouseDown }) => {
  const { suggestNextAction, generateMilestones } = useCopilot();
  const [nextAction, setNextAction] = useState<string>("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Fetch next action text
        const next = await suggestNextActionWrapper();
        if (mounted) setNextAction(next);
        // Fetch milestones
        const mls = await generateMilestonesWrapper();
        if (mounted) setMilestones(mls);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const suggestNextActionWrapper = async (): Promise<string> => {
    // useCopilot.suggestNextAction pushes message into chat flow; we want raw text, so reuse by calling operation directly
    try {
      const res = await fetchSuggestion('suggest_next_action');
      return res;
    } catch {
      return '';
    }
  };

  const generateMilestonesWrapper = async (): Promise<string[]> => {
    try {
      const res = await fetchMilestones();
      return res;
    } catch {
      return [];
    }
  };

  const { ensureDealContext } = useCopilot();
  const fetchSuggestion = async (operation: 'suggest_next_action'): Promise<string> => {
    const dealId = await ensureDealContext();
    const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke('copilot', {
      body: { operation, dealId }
    });
    if (error) throw new Error(error.message);
    return (data as any)?.suggestion || (data as any)?.response || '';
  };

  const fetchMilestones = async (): Promise<string[]> => {
    const dealId = await ensureDealContext();
    const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke('copilot', {
      body: { operation: 'generate_milestones', dealId }
    });
    if (error) throw new Error(error.message);
    const list = (data as any)?.milestones || [];
    return list.map((m: any) => m?.title || (typeof m === 'string' ? m : 'Milestone'));
  };

  return (
    <Card className="w-full max-w-[420px] md:w-[420px] copilot-card overflow-hidden border-0 bg-card/95" style={{ height: `${Math.min(window.innerHeight - 100, 800)}px` }}>
      <div 
        className="copilot-gradient text-primary-foreground px-6 py-5 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onHeaderMouseDown}
      >
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
      
      <CardContent className="flex flex-col p-6 gap-6" style={{ height: `${Math.min(window.innerHeight - 160, 740)}px` }}>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2">Deal Suggestions</h3>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            I'll monitor your deal and provide proactive tips here.
          </p>
        </div>

        <div className="space-y-4 flex-1">
          {/* Next action */}
          <SuggestionCard
            title={nextAction ? nextAction.split('\n')[0].replace(/^\*\*Recommendation:\*\*\s*/i, '') : 'Getting your next best step...'}
            description={nextAction}
            cta="Apply suggestion"
            onClick={() => { /* hook into flows later */ }}
          />

          {/* Milestones */}
          <SuggestionCard
            title="Generate milestones"
            description={milestones.length ? `Suggested milestones:\n- ${milestones.join('\n- ')}` : 'Drafting suggested milestones for your deal...'}
            cta="Create milestones"
            onClick={() => { /* hook into milestone creation later */ }}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />

          {/* Upload example CTA */}
          <SuggestionCard
            title="Upload your key document"
            description="Add a cap table, SPA draft, or financials to kickstart analysis."
            cta="Upload document"
            onClick={() => { /* integrate with uploader later */ }}
            icon={<Upload className="h-4 w-4" />}
          />

          {loading && (
            <div className="text-xs text-muted-foreground text-center">Loading suggestions…</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CopilotSuggestions;