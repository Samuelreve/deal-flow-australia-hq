
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createCorsResponse, createErrorResponse, createSuccessResponse } from "./utils/response-handler.ts";
import { handleGenerateTemplate } from "./operations/generate-template.ts";
import { routeOperation } from "./utils/operation-router.ts";
import { RequestPayload } from "./types.ts";

export async function handleRequest(req: Request, openai: any, supabaseUrl: string, supabaseKey: string) {
  try {
    const requestBody = await req.json();
    const { operation, content = "", context = {}, dealId, userId, documentId, documentVersionId, milestoneId, chatHistory } = requestBody;
    
    if (!operation) {
      return createErrorResponse('Missing required field: operation', 400);
    }

    // Create payload for operation router
    const payload: RequestPayload = {
      operation,
      content: content || "", // Allow empty content for some operations
      context,
      dealId: dealId || context.dealId,
      userId: userId || context.userId,
      documentId,
      documentVersionId,
      milestoneId,
      chatHistory
    };

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

    // Set user ID in payload for operations that need it
    payload.userId = user.id;

    // Route the operation using the comprehensive operation router
    let result;
    
    // Handle special cases that need additional context or different handling
    if (operation === 'generate_template' || operation === 'generate_smart_template') {
      // Keep existing template generation logic for backward compatibility
      if (operation === 'generate_smart_template') {
        if (!payload.dealId) {
          return createErrorResponse('Deal ID required for smart template generation', 400);
        }
        
        // Fetch deal data for enhanced context
        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .select('*')
          .eq('id', payload.dealId)
          .single();
          
        if (dealError) {
          return createErrorResponse('Failed to fetch deal information', 404);
        }
        
        result = await handleGenerateTemplate(
          content || 'Generate a comprehensive contract template',
          payload.dealId,
          user.id,
          context.templateType || 'Contract',
          { ...context, ...dealData },
          openai
        );
      } else {
        result = await handleGenerateTemplate(
          content,
          payload.dealId || '',
          user.id,
          context.templateType || 'Contract',
          context,
          openai
        );
      }
    } else {
      // Use the operation router for all other operations including generate_milestones
      result = await routeOperation(payload, openai);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error('Error in handleRequest:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}
