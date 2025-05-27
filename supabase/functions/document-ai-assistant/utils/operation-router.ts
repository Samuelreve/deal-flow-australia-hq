
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

async function handleAnalyzeContractDocument(
  content: string,
  analysisType: string,
  openai: any
) {
  try {
    if (!content || content.length < 50) {
      throw new Error("Insufficient document content for analysis. The document may be empty or the text extraction failed.");
    }

    let prompt = '';

    switch(analysisType) {
      case 'risks':
        prompt = `Analyze the following document for potential risks and provide your response in clean, plain text format. Do not use markdown, bullet points, or special formatting.

${content}

Provide your analysis in this exact structure:

RISK ASSESSMENT OVERVIEW
[Brief overview of the overall risk level]

HIGH-PRIORITY RISKS
[List and explain the most serious risks that need immediate attention]

MEDIUM-PRIORITY RISKS
[Moderate risks that should be addressed]

LOW-PRIORITY RISKS
[Minor risks or areas for improvement]

FINANCIAL RISKS
[Any risks related to money, payments, or financial obligations]

LEGAL AND COMPLIANCE RISKS
[Regulatory, legal, or compliance-related risks]

OPERATIONAL RISKS
[Risks that could affect day-to-day operations]

RECOMMENDED ACTIONS
[Specific steps to mitigate the identified risks]

Focus on practical, actionable insights that can help address potential issues.`;
        break;
      
      case 'obligations':
        prompt = `Review the following document and extract all obligations for all parties. Provide your response in clean, plain text format. Do not use markdown, bullet points, or special formatting.

${content}

Provide your analysis in this exact structure:

OBLIGATIONS SUMMARY
[Brief overview of the main types of obligations in the document]

PARTY A OBLIGATIONS
[List all obligations for the first party, including deadlines and conditions]

PARTY B OBLIGATIONS
[List all obligations for the second party, including deadlines and conditions]

ADDITIONAL PARTY OBLIGATIONS
[If there are more parties, list their obligations here]

MUTUAL OBLIGATIONS
[Obligations that apply to all parties]

PAYMENT AND FINANCIAL OBLIGATIONS
[All money-related obligations, including amounts and due dates]

PERFORMANCE DEADLINES
[Key dates and milestones that must be met]

CONSEQUENCES OF NON-COMPLIANCE
[What happens if obligations are not met]

Organize the information clearly and include any specific deadlines or conditions mentioned.`;
        break;
      
      case 'summary':
      default:
        prompt = `Analyze this document and provide a comprehensive summary in clean, plain text format. Do not use markdown, bullet points, or special formatting.

${content}

Provide your analysis in this exact structure:

DOCUMENT OVERVIEW
[Brief description of what this document is and its purpose]

MAIN SUBJECT MATTER
[The primary topic or transaction being addressed]

KEY PARTIES AND ROLES
[Who is involved and what their roles are]

IMPORTANT TERMS AND CONDITIONS
[The most significant terms, conditions, or requirements]

FINANCIAL ASPECTS
[Any money, pricing, or payment information]

TIMELINE AND DEADLINES
[Important dates, deadlines, or time periods]

SPECIAL PROVISIONS
[Any unusual, notable, or unique clauses or provisions]

AREAS OF ATTENTION
[Anything that stands out as particularly important or potentially problematic]

Keep the summary comprehensive but focused on the most essential information.`;
        break;
    }

    prompt += `\n\nImportant: Base your analysis strictly on the document provided. Do not speculate beyond the text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: "system", content: "You are a specialized legal document analysis assistant. Provide clear, structured analysis in plain text format without markdown or special formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const analysisContent = completion.choices[0]?.message?.content || "Analysis could not be generated.";
    
    return {
      analysis: analysisContent + "\n\nDISCLAIMER: This AI-generated analysis is for informational purposes only and should not be considered legal advice. Always consult with a qualified legal professional for specific guidance.",
      sources: ['AI Document Analysis']
    };
    
  } catch (error: any) {
    console.error('Error in handleAnalyzeContractDocument:', error);
    throw error;
  }
}

async function handleSummarizeContractContent(
  content: string,
  openai: any
) {
  try {
    if (!content || content.length < 50) {
      throw new Error('Insufficient document content for summarization');
    }

    const maxContentLength = 15000;
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + "... [CONTENT TRUNCATED]" 
      : content;

    // First, determine if this is a contract or non-contract document
    const classificationPrompt = `Analyze the following document and determine if it is a contract/legal agreement or another type of document. Respond with only "CONTRACT" or "NON-CONTRACT":

${truncatedContent.substring(0, 2000)}`;

    const classificationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a document classifier. Respond with only 'CONTRACT' or 'NON-CONTRACT'." },
        { role: "user", content: classificationPrompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const documentType = classificationResponse.choices[0]?.message?.content?.trim() || "NON-CONTRACT";

    let promptContent = '';

    if (documentType === "CONTRACT") {
      promptContent = `Analyze this contract and provide a comprehensive summary in clean, plain text format. Do not use markdown, bullet points, or special formatting.

${truncatedContent}

Provide your analysis in this exact structure:

CONTRACT TYPE AND PURPOSE
[Identify the type of contract and its main purpose]

KEY PARTIES
[List the main parties involved and their roles]

MAIN TERMS AND CONDITIONS
[Summarize the most important terms, obligations, and conditions]

FINANCIAL TERMS
[Detail any payments, pricing, or financial obligations]

KEY DATES AND DEADLINES
[Important dates, deadlines, or time periods]

TERMINATION CONDITIONS
[How and when the contract can be terminated]

POTENTIAL RISKS OR CONCERNS
[Any risks, ambiguous clauses, or areas of concern]

Keep each section concise but comprehensive. Use plain English and avoid legal jargon where possible.`;
    } else {
      promptContent = `Analyze this document and provide a summary in clean, plain text format. Do not use markdown, bullet points, or special formatting.

${truncatedContent}

Provide your analysis in this exact structure:

DOCUMENT TYPE
[Identify what type of document this is]

MAIN PURPOSE
[Explain the primary purpose or objective of the document]

KEY INFORMATION
[Summarize the most important information, data, or content]

MAIN SECTIONS OR TOPICS
[Overview of the major sections or topics covered]

IMPORTANT DETAILS
[Any specific details, numbers, dates, or requirements that stand out]

RECOMMENDATIONS OR NEXT STEPS
[If applicable, any suggested actions or next steps]

Keep the summary clear and focused on the most relevant information.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI document analysis assistant. Provide clear, structured analysis in plain text format without markdown or special formatting." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate summary';
    
    const disclaimer = documentType === "CONTRACT" 
      ? "DISCLAIMER: This AI-generated analysis is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for legal guidance."
      : "NOTE: This is an AI-generated summary for informational purposes. Please review the original document for complete and accurate information.";
    
    return {
      summary: summary + "\n\n" + disclaimer,
      keyPoints: [
        'Document successfully analyzed',
        'AI-powered analysis tools are available',
        'You can ask questions about specific clauses'
      ],
      documentType
    };
    
  } catch (error: any) {
    console.error('Error in handleSummarizeContractContent:', error);
    throw error;
  }
}
