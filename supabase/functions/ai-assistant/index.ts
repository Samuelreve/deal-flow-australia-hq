import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Enhanced AI Assistant System Prompt - Expert Level with Function Calling
const ENHANCED_SYSTEM_PROMPT = `
# IDENTITY & CORE EXPERTISE

You are **Trustroom AI Advisor** - the world's most knowledgeable AI advisor for mergers, acquisitions, business sales, and deal-making. You possess:

**Combined Expertise:**
- 20+ years of M&A advisory experience across thousands of successful transactions
- Investment banking knowledge from boutique to bulge-bracket firms
- Corporate law expertise in transactions from $100K to $1B+
- Financial analysis and valuation mastery (DCF, comparables, precedent transactions)
- Due diligence leadership across financial, legal, commercial, and operational workstreams
- Negotiation psychology and tactics that close deals

**Your Mission:** Help users successfully complete M&A transactions by providing expert guidance AND taking actions when requested.

---

# FUNCTION CALLING CAPABILITIES

You have access to powerful functions that allow you to take REAL ACTIONS on behalf of the user. When a user asks you to do something actionable, USE THE APPROPRIATE FUNCTION.

**Available Actions:**
1. **create_milestone** - Create a new milestone/task for a deal
2. **create_checklist_item** - Add a due diligence or task checklist item
3. **send_invitation** - Invite someone to join a deal
4. **update_milestone_status** - Update the status of an existing milestone
5. **get_deal_summary** - Retrieve deal details and current status
6. **get_milestones** - Get all milestones for a deal
7. **suggest_due_diligence** - Generate and create a due diligence checklist

**When to Use Functions:**
- User says "create a milestone for..." → use create_milestone
- User says "add a checklist item..." → use create_checklist_item
- User says "invite [email] to the deal..." → use send_invitation
- User says "mark [milestone] as complete..." → use update_milestone_status
- User says "what's the status of the deal..." → use get_deal_summary
- User says "create a due diligence checklist..." → use suggest_due_diligence

**Important Rules:**
- If you successfully execute a function, report what you did clearly
- If a function fails, explain the error and suggest alternatives
- If you need more information to execute a function, ask the user
- Always confirm what action you took after executing a function

---

# EXPERTISE MATRIX

## 1. DEAL STRATEGY & STRUCTURING

**Types of Transactions You Master:**
- Asset Purchase - Buying specific assets and liabilities
- Stock Purchase - Acquiring ownership shares
- Mergers - Two companies becoming one
- Acquisitions - Outright purchase of company
- Carve-outs - Selling division/business unit
- Management Buyouts (MBO) - Management acquiring company
- Leveraged Buyouts (LBO) - Debt-financed acquisitions

## 2. VALUATION EXPERTISE

**Valuation Methods:**
1. **EBITDA Multiple** - Enterprise Value = EBITDA × Multiple (2x-6x range)
2. **Discounted Cash Flow (DCF)** - For high-growth businesses
3. **Comparable Transactions** - Recent sales of similar businesses
4. **Asset-Based Valuation** - Fair market value of tangible assets

## 3. DUE DILIGENCE EXPERTISE

You can generate comprehensive checklists covering:
- Financial DD (statements, tax returns, AR/AP, customer concentration)
- Legal DD (corporate docs, contracts, IP, litigation)
- Commercial DD (customer interviews, market analysis)
- Operational DD (key employees, systems, supply chain)

## 4. DOCUMENT EXPERTISE

Documents you understand: NDA, LOI, Purchase Agreement, Employment Agreements, Non-Compete, Escrow Agreements, Bill of Sale

## 5. NEGOTIATION INTELLIGENCE

Tactics: Anchoring, BATNA Analysis, Concession Strategy, Issue Bundling, Deadline Management

---

# COMMUNICATION STYLE

- **First-Time Sellers**: Reassuring, educational, step-by-step
- **Experienced Buyers**: Efficient, strategic, high-level
- **Advisors**: Precise, technical, cite frameworks

**Response Structure:**
- Start with the answer
- Be specific with quantified guidance
- Provide clear next steps

---

# SAFETY & COMPLIANCE

**Boundaries:**
- "For legal advice specific to your situation, consult a qualified M&A attorney."
- "For formal valuations or tax advice, engage qualified professionals."

**Red Lines:**
❌ Never fabricate facts or numbers
❌ Never claim certainty when uncertainty exists
❌ Never provide specific legal interpretations

✅ Always state when information is missing
✅ Always quantify confidence when possible
✅ Always note when professional consultation is needed
`;

// OpenAI Function Definitions
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_milestone",
      description: "Create a new milestone/task for a deal. Use this when the user wants to add a new milestone, task, or phase to their deal.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal to add the milestone to"
          },
          title: {
            type: "string",
            description: "The title of the milestone (e.g., 'Complete Financial Due Diligence')"
          },
          description: {
            type: "string",
            description: "Detailed description of what needs to be done"
          },
          due_date: {
            type: "string",
            description: "Optional due date in ISO format (YYYY-MM-DD)"
          },
          order_index: {
            type: "number",
            description: "Optional order index for sorting (default: next available)"
          }
        },
        required: ["deal_id", "title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_checklist_item",
      description: "Create a checklist item (due diligence task, action item) for a deal. Use this for specific tasks that need to be tracked.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal"
          },
          title: {
            type: "string",
            description: "The title of the checklist item"
          },
          description: {
            type: "string",
            description: "Detailed description of the task"
          },
          due_date: {
            type: "string",
            description: "Optional due date in ISO format"
          },
          milestone_id: {
            type: "string",
            description: "Optional UUID of a milestone to associate with"
          }
        },
        required: ["deal_id", "title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_invitation",
      description: "Send an invitation to someone to join a deal. Use this when the user wants to invite a buyer, seller, lawyer, or advisor.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal"
          },
          email: {
            type: "string",
            description: "Email address of the person to invite"
          },
          role: {
            type: "string",
            enum: ["buyer", "seller", "lawyer", "advisor"],
            description: "The role of the invitee in the deal"
          }
        },
        required: ["deal_id", "email", "role"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_milestone_status",
      description: "Update the status of an existing milestone. Use this to mark milestones as in progress, completed, or blocked.",
      parameters: {
        type: "object",
        properties: {
          milestone_id: {
            type: "string",
            description: "The UUID of the milestone to update"
          },
          status: {
            type: "string",
            enum: ["not_started", "in_progress", "completed", "blocked", "pending_approval"],
            description: "The new status for the milestone"
          }
        },
        required: ["milestone_id", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_deal_summary",
      description: "Get a summary of a deal including its status, health score, and key information. Use this to understand the current state of a deal.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal"
          }
        },
        required: ["deal_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_milestones",
      description: "Get all milestones for a deal. Use this to see what tasks exist and their current status.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal"
          }
        },
        required: ["deal_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "suggest_due_diligence",
      description: "Generate and create a comprehensive due diligence checklist based on deal type. This will create multiple checklist items.",
      parameters: {
        type: "object",
        properties: {
          deal_id: {
            type: "string",
            description: "The UUID of the deal"
          },
          deal_type: {
            type: "string",
            enum: ["business_sale", "real_estate", "ip_transfer", "cross_border", "micro_deal"],
            description: "The type of deal to generate appropriate checklist items"
          },
          focus_areas: {
            type: "array",
            items: { type: "string" },
            description: "Optional specific areas to focus on (e.g., ['financial', 'legal', 'operational'])"
          }
        },
        required: ["deal_id", "deal_type"]
      }
    }
  }
];

// Category-specific enhancements
const CATEGORY_ENHANCEMENTS: Record<string, string> = {
  legal: `\n\n**LEGAL FOCUS:** Pay special attention to contractual terms, legal risks, and compliance issues.`,
  financial: `\n\n**FINANCIAL FOCUS:** Emphasize valuation, pricing, and financial analysis.`,
  strategy: `\n\n**STRATEGY FOCUS:** Focus on market positioning and strategic planning.`,
  negotiation: `\n\n**NEGOTIATION FOCUS:** Provide tactical advice on negotiation strategy.`,
  operations: `\n\n**OPERATIONS FOCUS:** Address operational efficiency and implementation.`,
  document: `\n\n**DOCUMENT ANALYSIS FOCUS:** Analyze the provided document and extract key insights.`
};

// Due diligence templates by deal type
const DD_TEMPLATES: Record<string, Array<{ title: string; description: string; category: string }>> = {
  business_sale: [
    { title: "Review 3 years of financial statements", description: "Obtain and analyze P&L, Balance Sheet, and Cash Flow statements for the past 3 years", category: "financial" },
    { title: "Verify tax returns", description: "Review business and personal tax returns for accuracy and compliance", category: "financial" },
    { title: "Analyze customer concentration", description: "Assess revenue dependency on top customers (flag if >20% from single customer)", category: "financial" },
    { title: "Review AR/AP aging", description: "Analyze accounts receivable and payable aging reports for cash flow health", category: "financial" },
    { title: "Verify corporate documents", description: "Review Articles of Incorporation, Operating Agreement, and bylaws", category: "legal" },
    { title: "Review all contracts", description: "Analyze customer contracts, vendor agreements, and leases", category: "legal" },
    { title: "Check for litigation", description: "Search for pending or threatened lawsuits and legal claims", category: "legal" },
    { title: "Verify IP ownership", description: "Confirm ownership of trademarks, patents, and domain names", category: "legal" },
    { title: "Assess key employee retention", description: "Identify critical employees and evaluate retention risk", category: "operational" },
    { title: "Review technology systems", description: "Evaluate IT infrastructure, software licenses, and data security", category: "operational" },
  ],
  real_estate: [
    { title: "Review property title", description: "Conduct title search and verify clear ownership", category: "legal" },
    { title: "Environmental assessment", description: "Complete Phase I environmental site assessment", category: "legal" },
    { title: "Property inspection", description: "Conduct comprehensive building inspection", category: "operational" },
    { title: "Review lease agreements", description: "Analyze all tenant leases and terms", category: "financial" },
    { title: "Verify property taxes", description: "Review property tax history and current obligations", category: "financial" },
    { title: "Zoning compliance", description: "Verify current use complies with zoning regulations", category: "legal" },
  ],
  ip_transfer: [
    { title: "Verify IP ownership", description: "Confirm ownership and chain of title for all IP assets", category: "legal" },
    { title: "Patent search", description: "Conduct freedom-to-operate analysis and prior art search", category: "legal" },
    { title: "Review license agreements", description: "Analyze all existing IP license agreements", category: "legal" },
    { title: "Assess IP valuation", description: "Obtain professional valuation of IP assets", category: "financial" },
    { title: "Check for infringement claims", description: "Review any pending or potential infringement issues", category: "legal" },
  ],
  cross_border: [
    { title: "Review foreign investment regulations", description: "Analyze applicable FIRB, CFIUS, or equivalent regulations", category: "legal" },
    { title: "Tax structure analysis", description: "Review cross-border tax implications and withholding requirements", category: "financial" },
    { title: "Currency hedging strategy", description: "Develop plan to manage currency exchange risk", category: "financial" },
    { title: "Employment law review", description: "Analyze employment obligations in all jurisdictions", category: "legal" },
    { title: "Regulatory approvals", description: "Identify all required regulatory approvals and timelines", category: "legal" },
  ],
  micro_deal: [
    { title: "Verify financials", description: "Review bank statements and basic financial records", category: "financial" },
    { title: "Asset inventory", description: "Create complete list of assets included in sale", category: "operational" },
    { title: "Customer list review", description: "Verify customer base and recurring revenue", category: "financial" },
    { title: "Basic legal review", description: "Review business registration and any contracts", category: "legal" },
  ]
};

// Function to determine if complex model is needed
function needsComplexModel(message: string, hasDocument: boolean, hasDealContext: boolean): boolean {
  const complexPatterns = [
    /valuation|dcf|discounted cash flow/i,
    /negotiate|negotiation strategy/i,
    /structure.*deal|deal.*structure/i,
    /risk.*analysis|analyze.*risk/i,
    /due diligence.*checklist|checklist.*due diligence/i,
    /contract.*review|review.*contract/i,
    /compare.*option|which.*better/i,
    /complex|complicated|sophisticated/i,
    /create.*milestone|add.*task/i,
    /invite.*to.*deal/i,
  ];
  
  if (hasDocument && message.length > 100) return true;
  if (hasDealContext) return true; // Use better model when dealing with actual deal context
  return complexPatterns.some(pattern => pattern.test(message));
}

// Execute AI function calls
async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  console.log(`Executing function: ${functionName}`, args);

  try {
    switch (functionName) {
      case "create_milestone": {
        // Get the next order index
        const { data: existingMilestones } = await supabase
          .from("milestones")
          .select("order_index")
          .eq("deal_id", args.deal_id)
          .order("order_index", { ascending: false })
          .limit(1);

        const nextOrderIndex = existingMilestones?.[0]?.order_index 
          ? existingMilestones[0].order_index + 1 
          : 1;

        const { data, error } = await supabase
          .from("milestones")
          .insert({
            deal_id: args.deal_id,
            title: args.title,
            description: args.description || null,
            due_date: args.due_date || null,
            order_index: args.order_index || nextOrderIndex,
            status: "not_started"
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, result: { message: `Created milestone: "${args.title}"`, milestone: data } };
      }

      case "create_checklist_item": {
        const { data, error } = await supabase
          .from("checklist_items")
          .insert({
            deal_id: args.deal_id,
            title: args.title,
            description: args.description || null,
            due_date: args.due_date || null,
            milestone_id: args.milestone_id || null,
            created_by: userId,
            source: "copilot",
            status: "open"
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, result: { message: `Created checklist item: "${args.title}"`, item: data } };
      }

      case "send_invitation": {
        const { data, error } = await supabase.rpc("create_deal_invitation", {
          p_deal_id: args.deal_id,
          p_invitee_email: args.email,
          p_invitee_role: args.role
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.message || "Failed to create invitation");
        
        return { success: true, result: { message: `Invitation sent to ${args.email} as ${args.role}` } };
      }

      case "update_milestone_status": {
        const updateData: any = { status: args.status };
        if (args.status === "completed") {
          updateData.completed_at = new Date().toISOString();
        } else if (args.status === "not_started" || args.status === "in_progress") {
          updateData.completed_at = null;
        }

        const { data, error } = await supabase
          .from("milestones")
          .update(updateData)
          .eq("id", args.milestone_id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, result: { message: `Updated milestone status to: ${args.status}`, milestone: data } };
      }

      case "get_deal_summary": {
        const { data: deal, error } = await supabase
          .from("deals")
          .select(`
            id, title, description, status, health_score, 
            created_at, target_completion_date, price, currency,
            deal_category, deal_type
          `)
          .eq("id", args.deal_id)
          .single();

        if (error) throw error;

        const { data: milestones } = await supabase
          .from("milestones")
          .select("id, title, status")
          .eq("deal_id", args.deal_id);

        const { data: participants } = await supabase
          .from("deal_participants")
          .select("role, user_id")
          .eq("deal_id", args.deal_id);

        const completedMilestones = milestones?.filter((m: any) => m.status === "completed").length || 0;
        const totalMilestones = milestones?.length || 0;

        return { 
          success: true, 
          result: { 
            deal,
            progress: `${completedMilestones}/${totalMilestones} milestones completed`,
            participantCount: participants?.length || 0,
            milestones: milestones?.slice(0, 5) // First 5 milestones
          } 
        };
      }

      case "get_milestones": {
        const { data, error } = await supabase
          .from("milestones")
          .select("id, title, description, status, due_date, order_index, completed_at")
          .eq("deal_id", args.deal_id)
          .order("order_index", { ascending: true });

        if (error) throw error;
        return { success: true, result: { milestones: data, count: data?.length || 0 } };
      }

      case "suggest_due_diligence": {
        const template = DD_TEMPLATES[args.deal_type] || DD_TEMPLATES.business_sale;
        let itemsToCreate = template;
        
        // Filter by focus areas if provided
        if (args.focus_areas && args.focus_areas.length > 0) {
          itemsToCreate = template.filter(item => 
            args.focus_areas.includes(item.category)
          );
        }

        // Create all checklist items
        const createdItems: any[] = [];
        for (const item of itemsToCreate) {
          const { data, error } = await supabase
            .from("checklist_items")
            .insert({
              deal_id: args.deal_id,
              title: item.title,
              description: item.description,
              created_by: userId,
              source: "copilot",
              status: "open"
            })
            .select()
            .single();

          if (!error && data) {
            createdItems.push(data);
          }
        }

        return { 
          success: true, 
          result: { 
            message: `Created ${createdItems.length} due diligence checklist items for ${args.deal_type}`,
            items: createdItems
          } 
        };
      }

      default:
        return { success: false, error: `Unknown function: ${functionName}` };
    }
  } catch (error: any) {
    console.error(`Error executing ${functionName}:`, error);
    return { success: false, error: error.message || "Function execution failed" };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { 
      message, 
      category, 
      documentContext, 
      chatHistory = [], 
      stream = false,
      dealId,
      enableFunctions = true 
    } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    // Get auth header and create Supabase client
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    let supabase: any = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      supabase = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );
      
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log('Processing AI assistant request:', { 
      message: message.substring(0, 100), 
      category, 
      hasDocument: !!documentContext,
      historyLength: chatHistory.length,
      stream,
      dealId,
      enableFunctions,
      hasAuth: !!userId
    });

    // Build system prompt with category enhancement
    let systemPrompt = ENHANCED_SYSTEM_PROMPT;
    if (category && CATEGORY_ENHANCEMENTS[category]) {
      systemPrompt += CATEGORY_ENHANCEMENTS[category];
    }

    // Add deal context if provided
    if (dealId) {
      systemPrompt += `\n\n**ACTIVE DEAL CONTEXT:** The user is currently working on deal ID: ${dealId}. When they refer to "the deal" or "this deal", use this ID for any function calls.`;
    }

    // Add document context if provided
    let userMessage = message;
    if (documentContext) {
      userMessage = `Based on the following document content:

---DOCUMENT CONTENT---
${documentContext.slice(0, 15000)}
---END DOCUMENT---

User Question: ${message}`;
      
      systemPrompt += `\n\n**Document Context Active:** Analyze the provided document and apply your expertise.`;
    }

    // Build messages array with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10).map((m: any) => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      })),
      { role: 'user', content: userMessage }
    ];

    // Select model based on complexity
    const useComplexModel = needsComplexModel(message, !!documentContext, !!dealId);
    const model = useComplexModel ? 'gpt-4o' : 'gpt-4o-mini';
    
    console.log(`Using model: ${model} (complex: ${useComplexModel}, functions: ${enableFunctions && !!userId})`);

    // Prepare request body
    const requestBody: any = {
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    };

    // Only include tools if functions are enabled AND user is authenticated
    if (enableFunctions && userId && dealId) {
      requestBody.tools = AI_TOOLS;
      requestBody.tool_choice = "auto";
    }

    // Make initial OpenAI request
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    let data = await response.json();
    let assistantMessage = data.choices[0]?.message;
    
    // Handle function calls (tool calls)
    let functionResults: any[] = [];
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (assistantMessage?.tool_calls && iterations < maxIterations && supabase && userId) {
      iterations++;
      console.log(`Processing ${assistantMessage.tool_calls.length} tool calls (iteration ${iterations})`);
      
      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        // If deal_id is not provided but we have dealId context, use it
        if (!args.deal_id && dealId) {
          args.deal_id = dealId;
        }
        
        const result = await executeFunctionCall(functionName, args, supabase, userId);
        functionResults.push({
          function: functionName,
          args,
          result
        });
        
        // Add function result to messages
        messages.push({
          role: 'assistant',
          content: null,
          tool_calls: [toolCall]
        } as any);
        
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        } as any);
      }

      // Get next response from OpenAI with function results
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2000,
          tools: AI_TOOLS,
          tool_choice: "auto"
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error on continuation:', response.status, errorData);
        break;
      }

      data = await response.json();
      assistantMessage = data.choices[0]?.message;
    }

    const aiResponse = assistantMessage?.content;

    if (!aiResponse && functionResults.length === 0) {
      throw new Error('No response from AI');
    }

    console.log('AI assistant response generated successfully', {
      hasContent: !!aiResponse,
      functionCallCount: functionResults.length
    });

    // For streaming responses (not supported with function calling currently)
    if (stream && !functionResults.length) {
      // Make a new streaming request without tools
      const streamResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2000,
          stream: true
        }),
      });

      if (!streamResponse.ok) {
        throw new Error(`OpenAI streaming error: ${streamResponse.status}`);
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const transformStream = new ReadableStream({
        async start(controller) {
          const reader = streamResponse.body!.getReader();
          let buffer = '';
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                  const lineData = line.slice(6).trim();
                  if (lineData === '[DONE]') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    continue;
                  }
                  controller.enqueue(encoder.encode(`data: ${lineData}\n\n`));
                }
              }
            }
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(transformStream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse || "I executed the requested actions. Here's what I did:",
        success: true,
        category: category,
        model: model,
        tokens_used: data.usage?.total_tokens || 0,
        functionCalls: functionResults.length > 0 ? functionResults : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process AI request',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
