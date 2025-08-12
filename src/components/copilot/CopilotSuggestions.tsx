
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Sparkles } from "lucide-react";
import { useCopilot } from "./useCopilot";

const SuggestionCard: React.FC<{ title: string; description?: string; cta?: string; onClick?: () => void; icon?: React.ReactNode; }>
= ({ title, description, cta, onClick, icon }) => (
  <div className="rounded-md border bg-card p-3 flex items-start gap-3">
    <div className="mt-1 text-primary">{icon || <CheckCircle2 className="h-4 w-4" />}</div>
    <div className="flex-1">
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{description}</div>}
      {cta && (
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={onClick}>{cta}</Button>
        </div>
      )}
    </div>
  </div>
);

const CopilotSuggestions: React.FC = () => {
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
    const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke('document-ai-assistant', {
      body: { operation, dealId }
    });
    if (error) throw new Error(error.message);
    return (data as any)?.suggestion || (data as any)?.response || '';
  };

  const fetchMilestones = async (): Promise<string[]> => {
    const dealId = await ensureDealContext();
    const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke('document-ai-assistant', {
      body: { operation: 'generate_milestones', dealId }
    });
    if (error) throw new Error(error.message);
    const list = (data as any)?.milestones || [];
    return list.map((m: any) => m?.title || (typeof m === 'string' ? m : 'Milestone'));
  };

  return (
    <Card className="w-[360px] shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          Trustroom Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          I’ll monitor your deal and provide proactive tips here.
        </div>

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
          <div className="text-xs text-muted-foreground">Loading suggestions…</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CopilotSuggestions;
