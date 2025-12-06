import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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
  const [
    dealRes, 
    milestonesRes, 
    partsRes, 
    sigsRes, 
    documentsRes, 
    commentsRes, 
    checklistRes
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(`
        id, title, status, health_score, deal_type, price, currency, 
        created_at, updated_at, description, asking_price, closing_date,
        target_completion_date, business_industry, business_legal_name,
        business_trading_names, reason_for_selling, cross_border,
        counterparty_name, counterparty_country
      `)
      .eq("id", dealId)
      .maybeSingle(),
      
    supabase
      .from("milestones")
      .select("id, title, status, order_index, assigned_to, due_date, description")
      .eq("deal_id", dealId)
      .order("order_index", { ascending: true }),
      
    supabase
      .from("deal_participants")
      .select(`
        user_id, role, joined_at,
        profiles:user_id(name, email, professional_headline)
      `)
      .eq("deal_id", dealId),
      
    supabase
      .from("document_signatures")
      .select("status, signer_email, signer_role, signed_at, created_at")
      .eq("deal_id", dealId),
      
    supabase
      .from("documents")
      .select(`
        id, name, type, category, status, size, created_at, updated_at,
        description, version, uploaded_by,
        profiles:uploaded_by(name, email)
      `)
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false }),
      
    supabase
      .from("comments")
      .select(`
        id, content, created_at, user_id, milestone_id, document_id,
        profiles:user_id(name, email)
      `)
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })
      .limit(10),
      
    supabase
      .from("checklist_items")
      .select("id, title, status, due_date, assigned_to, description, source")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })
  ]);

  const deal = dealRes.data ?? null;
  const milestones = milestonesRes.data ?? [];
  const participants = partsRes.data ?? [];
  const signatures = sigsRes.data ?? [];
  const documents = documentsRes.data ?? [];
  const comments = commentsRes.data ?? [];
  const checklist = checklistRes.data ?? [];

  // Calculate milestone statistics
  const blocked = milestones.filter((m: any) => m.status === "blocked").map((m: any) => m.title);
  const inProgress = milestones.filter((m: any) => m.status === "in_progress").map((m: any) => m.title);
  const completed = milestones.filter((m: any) => m.status === "completed").map((m: any) => m.title);

  // Calculate document statistics
  const documentStats = {
    total: documents.length,
    by_type: documents.reduce((acc: any, doc: any) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {}),
    by_category: documents.reduce((acc: any, doc: any) => {
      const cat = doc.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}),
    by_status: documents.reduce((acc: any, doc: any) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {}),
    total_size_mb: Math.round(documents.reduce((acc: any, doc: any) => acc + (doc.size || 0), 0) / (1024 * 1024) * 100) / 100
  };

  // Calculate signature statistics  
  const signatureStats = {
    total: signatures.length,
    completed: signatures.filter((s: any) => s.status === 'signed').length,
    pending: signatures.filter((s: any) => s.status === 'sent').length,
    by_role: signatures.reduce((acc: any, sig: any) => {
      acc[sig.signer_role] = (acc[sig.signer_role] || 0) + 1;
      return acc;
    }, {})
  };

  // Calculate checklist statistics
  const checklistStats = {
    total: checklist.length,
    completed: checklist.filter((c: any) => c.status === 'completed').length,
    open: checklist.filter((c: any) => c.status === 'open').length,
    in_progress: checklist.filter((c: any) => c.status === 'in_progress').length
  };

  const context = {
    deal,
    milestones,
    participants,
    signatures,
    documents,
    comments,
    checklist,
    stats: {
      milestone_counts: {
        total: milestones.length,
        completed: completed.length,
        in_progress: inProgress.length,
        blocked: blocked.length,
      },
      document_stats: documentStats,
      signature_stats: signatureStats,
      checklist_stats: checklistStats,
      participant_count: participants.length
    },
    summary: {
      blocked,
      in_progress: inProgress,
      completed,
    },
  };

  // Build comprehensive context text for AI
  const contextText = [
    `=== DEAL OVERVIEW ===`,
    `Title: ${deal?.title ?? "N/A"}`,
    `Status: ${deal?.status ?? "N/A"} | Health Score: ${deal?.health_score ?? "N/A"}%`,
    `Type: ${deal?.deal_type ?? "N/A"} | Industry: ${deal?.business_industry ?? "N/A"}`,
    `Price: ${deal?.price ?? deal?.asking_price ?? "N/A"} ${deal?.currency ?? ""}`,
    `Description: ${deal?.description ?? "N/A"}`,
    deal?.target_completion_date ? `Target Date: ${deal.target_completion_date}` : "",
    deal?.cross_border ? "Cross-border transaction: Yes" : "",
    deal?.counterparty_name ? `Counterparty: ${deal.counterparty_name}` : "",
    
    `\n=== PARTICIPANTS (${participants.length}) ===`,
    ...participants.map((p: any) => `${(p.profiles as any)?.name || 'Unknown'} (${p.role})`),
    
    `\n=== MILESTONES (${milestones.length} total) ===`,
    `Completed: ${completed.length} | In Progress: ${inProgress.length} | Blocked: ${blocked.length}`,
    blocked.length ? `🚫 Blocked: ${blocked.join(", ")}` : "",
    inProgress.length ? `🔄 In Progress: ${inProgress.join(", ")}` : "",
    completed.length ? `✅ Completed: ${completed.slice(0, 3).join(", ")}${completed.length > 3 ? ` +${completed.length - 3} more` : ""}` : "",
    
    `\n=== DOCUMENTS (${documents.length} total, ${documentStats.total_size_mb}MB) ===`,
    Object.keys(documentStats.by_category).length ? `By Category: ${Object.entries(documentStats.by_category).map(([cat, count]) => `${cat}: ${count}`).join(", ")}` : "",
    Object.keys(documentStats.by_type).length ? `By Type: ${Object.entries(documentStats.by_type).map(([type, count]) => `${type}: ${count}`).join(", ")}` : "",
    Object.keys(documentStats.by_status).length ? `By Status: ${Object.entries(documentStats.by_status).map(([status, count]) => `${status}: ${count}`).join(", ")}` : "",
    documents.length ? `Recent: ${documents.slice(0, 3).map((d: any) => d.name).join(", ")}${documents.length > 3 ? ` +${documents.length - 3} more` : ""}` : "No documents uploaded",
    
    `\n=== SIGNATURES (${signatures.length} total) ===`,
    signatureStats.completed ? `✅ Signed: ${signatureStats.completed}` : "",
    signatureStats.pending ? `⏳ Pending: ${signatureStats.pending}` : "",
    
    `\n=== CHECKLIST (${checklist.length} items) ===`,
    `Completed: ${checklistStats.completed} | Open: ${checklistStats.open} | In Progress: ${checklistStats.in_progress}`,
    
    comments.length ? `\n=== RECENT ACTIVITY ===` : "",
    comments.length ? `${comments.length} recent comments/updates` : "",
  ].filter(Boolean).join("\n");

  return { context, contextText };
}

import { COPILOT_SYSTEM_PROMPT } from "../_shared/ai-prompts.ts";

function buildSystemPrompt() {
  return COPILOT_SYSTEM_PROMPT;
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
    const { operation, dealId, userId, content, chatHistory = [], items, context: requestContext } = payload || {};
    const uploadedDocument = requestContext?.uploadedDocument;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (["deal_chat_query", "suggest_next_action", "generate_milestones", "summarize_deal", "predict_deal_health", "create_checklist_items"].includes(operation) && !dealId) {
      return new Response(JSON.stringify({ error: "Missing dealId" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // RBAC check for deal-scoped ops
    if (["deal_chat_query", "suggest_next_action", "generate_milestones", "summarize_deal", "predict_deal_health", "create_checklist_items"].includes(operation)) {
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
    const { context: dealContext, contextText } = dealId ? await getDealContext(dealId) : { context: {}, contextText: "" } as any;

    const system = buildSystemPrompt();

    if (operation === "deal_chat_query") {
      if (!content) {
        return new Response(JSON.stringify({ error: "Missing content" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let systemPrompt = system;
      let userPrompt = `Deal Context:\n${contextText}\n\nUser Question: ${content}`;
      
      // If there's an uploaded document, include it in the context
      if (uploadedDocument) {
        systemPrompt += `\n\nYou have access to an uploaded document "${uploadedDocument.name}" with the following content:\n\n${uploadedDocument.content.slice(0, 8000)}\n\nWhen answering questions, prioritize information from this document and reference it when relevant.`;
        userPrompt = `User Question: ${content}`;  // Simplify when document is present
      }

      const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-6).map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        { role: "user", content: userPrompt },
      ];

      const { content: answer, usage, latency } = await callOpenAI(messages);

      // Background logging
      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "user", operation, content, metadata: uploadedDocument ? { documentName: uploadedDocument.name } : {} }));
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

    if (operation === "predict_deal_health") {
      const d = (dealContext as any)?.deal || null;
      const counts = (dealContext as any)?.summary?.milestone_counts || { total: 0, completed: 0, in_progress: 0, blocked: 0 };
      let score: number;
      if (typeof d?.health_score === "number") {
        score = d.health_score;
      } else if (counts.total === 0) {
        score = 50;
      } else {
        score = Math.round(
          Math.min(100, Math.max(0,
            (counts.completed / counts.total) * 70 +
            (counts.in_progress / counts.total) * 20 -
            (counts.blocked / counts.total) * 30
          ))
        );
      }
      const confidenceVal = counts.total > 0 ? Math.min(1, 0.5 + (counts.completed / counts.total) * 0.5) : 0.6;
      const confidence = `${Math.round(confidenceVal * 100)}%`;
      const suggestions: Array<{area:string; recommendation:string; impact:string}> = [];
      if (counts.blocked > 0) suggestions.push({ area: "Milestones", recommendation: "Resolve blocked milestones first", impact: "high" });
      if (counts.in_progress === 0 && counts.total > 0) suggestions.push({ area: "Momentum", recommendation: "Start the next priority milestone", impact: "medium" });
      if (d?.status === "draft") suggestions.push({ area: "Status", recommendation: "Move deal from Draft to Active to kick off workflows", impact: "medium" });

      const msg = `Predicted health score: ${score}% (confidence ${confidence}). Blocked=${counts.blocked}, In progress=${counts.in_progress}, Completed=${counts.completed}.`;
      (self as any).EdgeRuntime?.waitUntil?.(logCopilot({ dealId, userId, role: "assistant", operation, content: msg, metadata: { counts } }));

      return new Response(JSON.stringify({ success: true, probability_of_success_percentage: score, confidence_level: confidence, suggested_improvements: suggestions }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid operation" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("Copilot function error", e);
    return new Response(JSON.stringify({ error: e.message ?? "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
