
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsResponse, createErrorResponse, createSuccessResponse } from "./utils/response-handler.ts";
import { handleGenerateTemplate } from "./operations/generate-template.ts";

export async function handleRequest(req: Request, openai: any, supabaseUrl: string, supabaseKey: string) {
  try {
    const { operation, content, context = {} } = await req.json();
    
    if (!operation || !content) {
      return createErrorResponse('Missing required fields: operation and content', 400);
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('Authorization header required', 401);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return createErrorResponse('Invalid authentication token', 401);
    }

    let result;
    
    switch (operation) {
      case 'generate_template':
        result = await handleGenerateTemplate(
          content,
          context.dealId || '',
          user.id,
          context.templateType || 'Contract',
          context,
          openai
        );
        break;
        
      case 'generate_smart_template':
        // For smart templates, we use enhanced context from the deal
        if (!context.dealId) {
          return createErrorResponse('Deal ID required for smart template generation', 400);
        }
        
        // Fetch deal data for enhanced context
        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .select('*')
          .eq('id', context.dealId)
          .single();
          
        if (dealError) {
          return createErrorResponse('Failed to fetch deal information', 404);
        }
        
        result = await handleGenerateTemplate(
          content || 'Generate a comprehensive contract template',
          context.dealId,
          user.id,
          context.templateType || 'Contract',
          { ...context, ...dealData },
          openai
        );
        break;
        
      default:
        return createErrorResponse(`Unknown operation: ${operation}`, 400);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}
