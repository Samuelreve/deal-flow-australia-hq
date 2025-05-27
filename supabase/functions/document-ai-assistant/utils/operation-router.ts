
import { RequestPayload } from "../types.ts";
import { 
  handleExplainClause, 
  handleGenerateTemplate, 
  handleSummarizeDocument,
  handleExplainMilestone,
  handleSuggestNextAction,
  handleGenerateMilestones,
  handleAnalyzeDocument,
  handleSummarizeDeal,
  handleGetDealInsights,
  handleDealChatQuery,
  handlePredictDealHealth,
  handleSummarizeContract,
  handleExplainContractClause
} from "../operations/index.ts";

/**
 * Route the request to the appropriate handler based on the operation type
 */
export async function routeOperation(payload: RequestPayload, openai: any): Promise<Record<string, any>> {
  const { 
    operation, 
    content, 
    context, 
    dealId, 
    userId, 
    documentId, 
    documentVersionId, 
    milestoneId,
    chatHistory = [],
    selectedText = ""
  } = payload;

  switch (operation) {
    case "explain_clause":
      // For contract analysis, handle directly with content
      if (dealId === 'contract-analysis') {
        return await handleExplainContractClause(dealId, userId, content, openai);
      }
      return await handleExplainClause(content, context, openai);
    case "generate_template":
      const templateType = context?.templateType || "Agreement";
      return await handleGenerateTemplate(content, dealId, userId, templateType, context, openai);
    case "summarize_document":
      return await handleSummarizeDocument(content, dealId, documentId, documentVersionId, openai);
    case "explain_milestone":
      return await handleExplainMilestone(dealId, milestoneId as string, openai);
    case "suggest_next_action":
      return await handleSuggestNextAction(dealId, openai);
    case "generate_milestones":
      return await handleGenerateMilestones(dealId, userId, context, openai);
    case "analyze_document":
      // For contract analysis, handle directly with content
      if (dealId === 'contract-analysis') {
        return await handleAnalyzeContractDocument(content, context?.analysisType || "general", openai);
      }
      return await handleAnalyzeDocument(dealId, documentId, documentVersionId, context?.analysisType || "general", openai);
    case "summarize_deal":
      return await handleSummarizeDeal(dealId, openai);
    case "get_deal_insights":
      return await handleGetDealInsights(userId, openai);
    case "deal_chat_query":
      return await handleDealChatQuery(dealId, userId, content, chatHistory, openai);
    case "predict_deal_health":
      return await handlePredictDealHealth(dealId, userId, openai);
    case "summarize_contract":
      // For contract analysis, handle directly with content
      if (dealId === 'contract-analysis') {
        return await handleSummarizeContractContent(content, openai);
      }
      return await handleSummarizeContract(dealId, documentId, documentVersionId, userId, openai);
    case "explain_contract_clause":
      return await handleExplainContractClause(dealId, userId, selectedText || content, openai);
    default:
      throw new Error("Invalid operation type");
  }
}

/**
 * Handle contract document analysis for contract analysis flow
 */
async function handleAnalyzeContractDocument(
  content: string,
  analysisType: string,
  openai: any
) {
  try {
    if (!content || content.length < 50) {
      throw new Error("Insufficient document content for analysis. The document may be empty or the text extraction failed.");
    }

    // Define prompt based on analysis type
    let prompt = '';

    switch(analysisType) {
      case 'risks':
        prompt = `You are a legal document analysis assistant. Analyze the following document and identify potential risks, issues, or concerns:

${content}

Provide a structured analysis that includes:
1. Key risks identified
2. Severity of each risk (High, Medium, Low)
3. Brief explanation for each risk
4. Suggested mitigations where applicable

Focus on legal, financial, and compliance risks that could affect the parties involved.`;
        break;
      
      case 'obligations':
        prompt = `You are a legal document analysis assistant. Review the following document and extract all obligations for all parties:

${content}

For each obligation, provide:
1. The party responsible
2. The nature of the obligation
3. Any deadlines or conditions
4. The consequences of non-compliance (if specified)

Organize obligations by party and present in a clear, structured format.`;
        break;
      
      case 'summary':
      default:
        prompt = `You are a legal document analysis assistant. Provide a concise summary of the following document:

${content}

Your summary should:
1. Identify the type of document
2. Outline its main purpose
3. Summarize key provisions
4. Highlight important terms or conditions
5. Note any unusual or noteworthy elements

Keep your summary clear, objective, and focused on the most essential information.`;
        break;
    }

    // Add disclaimer to the prompt
    prompt += `\n\nImportant: Base your analysis strictly on the document provided. Do not speculate beyond the text. End your response with this disclaimer: "This AI-generated analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific guidance."`;

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: "system", content: "You are a specialized legal document analysis assistant with expertise in contract review and risk assessment." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const analysisContent = completion.choices[0]?.message?.content || "Analysis could not be generated.";
    
    return {
      analysis: analysisContent,
      sources: ['AI Document Analysis']
    };
    
  } catch (error: any) {
    console.error('Error in handleAnalyzeContractDocument:', error);
    throw error;
  }
}

/**
 * Handle contract summarization for contract analysis flow
 */
async function handleSummarizeContractContent(
  content: string,
  openai: any
) {
  try {
    if (!content || content.length < 50) {
      throw new Error('Insufficient document content for summarization');
    }

    // Truncate content if too large
    const maxContentLength = 15000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : content;

    // Construct OpenAI prompt for summarization
    const promptContent = `You are a legal document summarization assistant. Please provide a comprehensive summary of the following document:

${truncatedContent}

Your summary should include:
1. The main purpose of the document
2. Key parties involved and their roles
3. Important terms and conditions
4. Significant obligations for each party
5. Any notable deadlines or dates
6. Potential risks or areas of concern

Format your response in clear sections with headings. Be concise but thorough.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI legal assistant specializing in document summarization." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate summary';
    
    return {
      summary,
      keyPoints: [
        'Document successfully analyzed',
        'AI-powered analysis tools are available',
        'You can ask questions about specific clauses'
      ],
      disclaimer: "This summary is AI-generated and provided for informational purposes only. It is not legal advice and may not capture all important details of the document. Always review the full document or consult a qualified professional."
    };
    
  } catch (error: any) {
    console.error('Error in handleSummarizeContractContent:', error);
    throw error;
  }
}
