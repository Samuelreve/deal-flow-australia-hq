
import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { RequestPayload } from "./types.ts";
import { validateRequest, validateOperationSpecificFields } from "./utils/request-validator.ts";
import { validateDealAccess } from "./utils/auth-validator.ts";
import { createSuccessResponse, createErrorResponse } from "./utils/response-handler.ts";
import { routeOperation } from "./utils/operation-router.ts";
import { saveAnalysisResult } from "./utils/analysis-saver.ts";

export async function handleRequest(
  req: Request,
  openai: OpenAI,
  supabaseUrl: string,
  supabaseKey: string
): Promise<Response> {
  try {
    // Parse request
    const payload: RequestPayload = await req.json();
    
    // Validate basic request structure
    const basicValidation = validateRequest(payload);
    if (!basicValidation.isValid) {
      return createErrorResponse(basicValidation.error!, 400);
    }
    
    // Validate operation-specific fields
    const operationValidation = validateOperationSpecificFields(payload);
    if (!operationValidation.isValid) {
      return createErrorResponse(operationValidation.error!, 400);
    }
    
    // Validate user's access to the deal
    try {
      await validateDealAccess(payload.dealId!, payload.userId, supabaseUrl, supabaseKey);
    } catch (error) {
      return createErrorResponse(error.message, 403);
    }
    
    // Route to appropriate operation handler
    const result = await routeOperation(payload, openai);
    
    // Save analysis result if it's an analyze_document operation
    if (payload.operation === 'analyze_document' && result && payload.context?.saveAnalysis !== false) {
      await saveAnalysisResult(
        payload.documentId!,
        payload.documentVersionId!,
        payload.context!.analysisType,
        result.analysis?.content,
        payload.userId,
        supabaseUrl,
        supabaseKey
      );
    }
    
    return createSuccessResponse(result);
    
  } catch (error) {
    console.error("Error in document-ai-assistant function:", error);
    return createErrorResponse(error.message || "An unexpected error occurred");
  }
}
