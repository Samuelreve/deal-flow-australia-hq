import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!OPENAI_API_KEY) console.error("OPENAI_API_KEY not set for copilot");
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) console.error("Supabase env missing for copilot");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}` } },
});

async function isParticipant(dealId: string, userId: string) {
  // Check roles via deal_participants or deals seller/buyer
  const { data: dp } = await supabase
    .from("deal_participants")
    .select("id")
    .eq("deal_id", dealId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (dp) return true;
  const { data: deal } = await supabase
    .from("deals")
    .select("seller_id,buyer_id")
    .eq("id", dealId)
    .maybeSingle();
  return !!deal && (deal.seller_id === userId || deal.buyer_id === userId);
}

async function getDealContext(dealId: string) {
  const [dealRes, milestonesRes, partsRes, sigsRes] = await Promise.all([
    supabase.from("deals").select("id,title,status,health_score,deal_type,price,currency,created_at,updated_at").eq("id", dealId).maybeSingle(),
    supabase.from("milestones").select("id,title,status,order_index,assigned_to,due_date").eq("deal_id", dealId).order("order_index", { ascending: true }),
    supabase.from("deal_participants").select("user_id,role").eq("deal_id", dealId),
    supabase.from("document_signatures").select("status,signer_email,signer_role,signed_at").eq("deal_id", dealId),
  ]);

  const deal = dealRes.data ?? null;
  const milestones = milestonesRes.data ?? [];
  const participants = partsRes.data ?? [];
  const signatures = sigsRes.data ?? [];

  // Basic context string for LLM
  const blocked = milestones.filter((m: any) => m.status === "blocked").map((m: any) => m.title);
  const inProgress = milestones.filter((m: any) => m.status === "in_progress").map((m: any) => m.title);
  const completed = milestones.filter((m: any) => m.status === "completed").map((m: any) => m.title);

  const context = {
    deal,
    milestones,
    participants,
    signatures,
    summary: {
      milestone_counts: {
        total: milestones.length,
        completed: completed.length,
        in_progress: inProgress.length,
        blocked: blocked.length,
      },
      blocked,
      in_progress: inProgress,
      completed,
    },
  };

  const contextText = [
    `Deal: ${deal?.title ?? "N/A"} | Status: ${deal?.status ?? "N/A"} | Health: ${deal?.health_score ?? "N/A"}`,
    `Type: ${deal?.deal_type ?? "N/A"} | Price: ${deal?.price ?? "N/A"} ${deal?.currency ?? ""}`,
    `Milestones: total=${milestones.length}, completed=${completed.length}, in_progress=${inProgress.length}, blocked=${blocked.length}`,
    blocked.length ? `Blocked: ${blocked.join(", ")}` : "",
  ].filter(Boolean).join("\n");

  return { context, contextText };
}

function buildSystemPrompt() {
  return (
    "You are Trustroom Copilot. Assist with deals without giving legal advice.\n" +
    "Always: (1) be concise, (2) use plain English for non-lawyers, (3) propose actions.\n" +
    "Tag each output with {audience: seller|buyer|lawyer|accountant|analyst}.\n" +
    "If you are unsure, ask a clarifying question. Never fabricate facts.\n" +
    "Only use the provided deal context. If missing, say you lack info.\n" +
    "End with a short disclaimer: 'This is assistive guidance, not legal advice.'"
  );
}

async function callOpenAI(messages: any[]) {
  const t0 = Date.now();
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 700,
      messages,
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${errText}`);
  }
  const json = await resp.json();
  const t1 = Date.now();
  const content = json?.choices?.[0]?.message?.content ?? "";
  const usage = json?.usage ?? {};
  return { content, usage, latency: t1 - t0 };
}

async function logCopilot({ dealId, userId, role, operation, content, audience, usage, latency, metadata }: any) {
  try {
    await supabase.from("ai_copilot_logs").insert({
      deal_id: dealId ?? null,
      user_id: userId,
      role,
      operation,
      content,
      audience: audience ?? null,
      prompt_tokens: usage?.prompt_tokens ?? null,
      completion_tokens: usage?.completion_tokens ?? null,
      latency_ms: latency ?? null,
      metadata: metadata ?? {},
    });
  } catch (e) {
    console.error("Failed to insert copilot log", e);
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { operation, dealId, userId, content, chatHistory = [], items } = payload || {};

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (["deal_chat_query", "suggest_next_action", "generate_milestones", "summarize_deal", "create_checklist_items"].includes(operation) && !dealId) {
      return new Response(JSON.stringify({ error: "Missing dealId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // RBAC check for deal-scoped ops
    if (["deal_chat_query", "suggest_next_action", "generate_milestones", "summarize_deal", "create_checklist_items"].includes(operation)) {
      const allowed = await isParticipant(dealId, userId);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Authorization error" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (operation === "create_checklist_items") {
      // Create checklist items from AI or user request
      const rows = (Array.isArray(items) ? items : []).map((i: any) => ({
        deal_id: dealId,
        title: i.title ?? "Checklist item",
        description: i.description ?? null,
        status: (i.status ?? "open"),
        due_date: i.due_date ?? null,
        assigned_to: i.assigned_to ?? null,
        milestone_id: i.milestone_id ?? null,
        created_by: userId,
        source: "copilot",
      }));
      const { data, error } = await supabase.from("checklist_items").insert(rows).select();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, created: data?.length ?? 0, items: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build context for AI operations
    const { context, contextText } = dealId ? await getDealContext(dealId) : { context: {}, contextText: "" } as any;

    const system = buildSystemPrompt();

    if (operation === "deal_chat_query") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Missing content" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const messages = [
        { role: "system", content: system },
        ...chatHistory.slice(-6).map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        { role: "user", content: `Deal Context:\n${contextText}\n\nUser Question: ${content}` },
      ];

      const { content: answer, usage, latency } = await callOpenAI(messages);

      // Background logging
      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "user", operation, content }));
      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "assistant", operation, content: answer, usage, latency }));

      return new Response(JSON.stringify({ success: true, answer, disclaimer: "This is assistive guidance, not legal advice." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (operation === "suggest_next_action") {
      const prompt =
        "Given the deal context below, suggest the single highest-impact next action. " +
        "State the action, who should do it, and why. Return 2-4 sentences and include an {audience: ...} tag.\n\n" +
        `Deal Context:\n${contextText}`;

      const { content: suggestion, usage, latency } = await callOpenAI([
        { role: "system", content: system },
        { role: "user", content: prompt },
      ]);

      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "assistant", operation, content: suggestion, usage, latency }));

      return new Response(JSON.stringify({ success: true, suggestion }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (operation === "generate_milestones") {
      const prompt =
        "Given the deal context, propose an ordered list of 4-8 milestones in plain text. " +
        "Only include titles.\n\n" +
        `Deal Context:\n${contextText}`;

      const { content: text, usage, latency } = await callOpenAI([
        { role: "system", content: system },
        { role: "user", content: prompt },
      ]);

      const lines = text.split("\n").map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
      const milestones = lines.map((t) => ({ title: t }));

      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "assistant", operation, content: text, usage, latency }));

      return new Response(JSON.stringify({ success: true, milestones }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (operation === "summarize_deal") {
      const prompt =
        "Summarize the current deal status for a non-lawyer. Include key obligations, dates, blockers, and health. " +
        "End with a short next step.\n\n" +
        `Deal Context:\n${contextText}`;

      const { content: summary, usage, latency } = await callOpenAI([
        { role: "system", content: system },
        { role: "user", content: prompt },
      ]);

      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "assistant", operation, content: summary, usage, latency }));

      return new Response(JSON.stringify({ success: true, summary }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid operation" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("Copilot function error", e);
    return new Response(JSON.stringify({ error: e.message ?? "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
