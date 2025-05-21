
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Import operation handlers
import { handleExplainClause } from "./operations/explain-clause.ts";
import { handleSummarizeDocument } from "./operations/summarize-document.ts";
import { handleAnalyzeDocument } from "./operations/analyze-document.ts";
import { handleExplainMilestone } from "./operations/explain-milestone.ts";
import { handleSuggestNextAction } from "./operations/suggest-next-action.ts";
import { handleDealSummary } from "./operations/deal-summary.ts";
import { handleGenerateMilestones } from "./operations/generate-milestones.ts";
import { handleDealChat } from "./operations/deal-chat.ts";
import { handlePredictDealHealth } from "./operations/predict-deal-health.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openAIApiKey
    });
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { operation, dealId, documentId, documentVersionId, milestoneId, content, userId, context } = await req.json();
    
    // Validate required fields for all operations
    if (!operation) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameter: operation" 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate user ID
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameter: userId" 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate user's access to the deal
    if (dealId) {
      const { data: dealParticipant, error: participantError } = await supabase
        .from('deal_participants')
        .select('role')
        .eq('deal_id', dealId)
        .eq('user_id', userId)
        .single();
      
      if (participantError || !dealParticipant) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Permission denied: You are not a participant in this deal" 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Process operation
    let result;
    
    switch (operation) {
      case 'explain_clause':
        if (!content) {
          throw new Error("Missing required parameter for explain_clause: content");
        }
        result = await handleExplainClause(content, openai);
        break;
        
      case 'summarize_document':
        result = await handleSummarizeDocument(content, dealId, documentId, documentVersionId, openai);
        break;
        
      case 'analyze_document':
        if (!documentId || !documentVersionId) {
          throw new Error("Missing required parameters for analyze_document: documentId, documentVersionId");
        }
        if (!context || !context.analysisType) {
          throw new Error("Missing required parameter for analyze_document: context.analysisType");
        }
        result = await handleAnalyzeDocument(dealId, documentId, documentVersionId, context.analysisType, openai);
        
        // Save analysis result to database (if requested)
        if (result && context.saveAnalysis !== false) {
          try {
            await supabase
              .from('document_analyses')
              .insert({
                document_id: documentId,
                document_version_id: documentVersionId,
                analysis_type: context.analysisType,
                analysis_content: result.analysis.content,
                created_by: userId
              });
          } catch (saveError) {
            console.error("Error saving analysis:", saveError);
            // Continue anyway to return analysis to user
          }
        }
        break;
        
      case 'explain_milestone':
        if (!milestoneId) {
          throw new Error("Missing required parameter for explain_milestone: milestoneId");
        }
        result = await handleExplainMilestone(milestoneId, dealId, openai, supabase);
        break;
        
      case 'suggest_next_action':
        if (!dealId) {
          throw new Error("Missing required parameter for suggest_next_action: dealId");
        }
        result = await handleSuggestNextAction(dealId, openai, supabase);
        break;
        
      case 'summarize_deal':
        if (!dealId) {
          throw new Error("Missing required parameter for summarize_deal: dealId");
        }
        result = await handleDealSummary(dealId, openai);
        break;
        
      case 'generate_milestones':
        if (!dealId) {
          throw new Error("Missing required parameter for generate_milestones: dealId");
        }
        result = await handleGenerateMilestones(dealId, openai, supabase);
        break;
        
      case 'deal_chat':
        if (!dealId || !content) {
          throw new Error("Missing required parameters for deal_chat: dealId, content");
        }
        result = await handleDealChat(dealId, content, openai, supabase);
        break;
        
      case 'predict_deal_health':
        if (!dealId) {
          throw new Error("Missing required parameter for predict_deal_health: dealId");
        }
        result = await handlePredictDealHealth(dealId, openai, supabase);
        break;
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in document-ai-assistant function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
