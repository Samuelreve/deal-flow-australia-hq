
/**
 * Validate the request body for the document-ai-assistant endpoint
 */
export function validateRequest(body: any) {
  if (!body) {
    throw new Error("Missing required fields: request body is empty");
  }
  
  const { operation, dealId, userId } = body;
  
  if (!operation || !dealId || !userId) {
    throw new Error("Missing required fields: operation, dealId, userId");
  }

  // Optional fields with defaults
  const content = body.content || "";
  const documentId = body.documentId || null;
  const documentVersionId = body.documentVersionId || null;
  const milestoneId = body.milestoneId || null;
  const context = body.context || {};
  
  // Additional validations based on operation type
  if (operation === "explain_clause" && !content) {
    throw new Error("Missing required fields: content is required for explain_clause operation");
  }
  
  if (operation === "explain_milestone" && !milestoneId) {
    throw new Error("Missing required fields: milestoneId is required for explain_milestone operation");
  }
  
  if (operation === "summarize_document" && (!documentId || !documentVersionId)) {
    throw new Error("Missing required fields: documentId and documentVersionId are required for summarize_document operation");
  }
  
  if (operation === "analyze_document" && (!documentId || !documentVersionId || !context.analysisType)) {
    throw new Error("Missing required fields: documentId, documentVersionId, and analysisType are required for analyze_document operation");
  }

  if (operation === "summarize_contract" && (!documentId || !documentVersionId)) {
    throw new Error("Missing required fields: documentId and documentVersionId are required for summarize_contract operation");
  }

  if (operation === "explain_contract_clause" && (!content || !documentId || !documentVersionId)) {
    throw new Error("Missing required fields: content, documentId, and documentVersionId are required for explain_contract_clause operation");
  }
  
  return { operation, dealId, userId, content, documentId, documentVersionId, milestoneId, context };
}
