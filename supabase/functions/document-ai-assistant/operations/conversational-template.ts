/**
 * Conversational Template Generation Operation
 * Handles multi-turn conversations for document requirement gathering
 */

import { 
  QUESTION_FLOWS, 
  getQuestionFlow, 
  getAvailableDocumentTypes,
  buildConversationalPrompt,
  isReadyToGenerate,
  formatAnswersForGeneration
} from '../../_shared/conversational-questions.ts';
import { 
  DOCUMENT_GENERATION_SYSTEM_PROMPT, 
  AUSTRALIAN_LEGAL_CONTEXT,
  CLAUSE_LIBRARY,
  DOCUMENT_EXAMPLES
} from '../../_shared/ai-prompts.ts';

interface ConversationalMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationalState {
  phase: 'select_type' | 'gathering' | 'confirming' | 'generating' | 'complete';
  documentType: string | null;
  gatheredAnswers: Record<string, any>;
  currentQuestionIndex: number;
}

interface ConversationalRequest {
  dealId: string;
  userId: string;
  messages: ConversationalMessage[];
  state?: ConversationalState;
  dealContext?: Record<string, any>;
}

interface ConversationalResponse {
  success: boolean;
  message: string;
  state: ConversationalState;
  options?: Array<{ label: string; value: string; description?: string }>;
  isComplete: boolean;
  generatedDocument?: string;
  partialDocument?: string;
  disclaimer?: string;
  error?: string;
}

/**
 * Build a smart welcome message based on deal context
 */
function buildSmartWelcome(dealContext: Record<string, any>): string {
  const parts: string[] = [];
  
  // Personalized greeting
  if (dealContext.title || dealContext.businessName) {
    const dealName = dealContext.title || dealContext.businessName;
    parts.push(`Welcome! I'll help you create professional documents for **${dealName}**.`);
  } else {
    parts.push(`Welcome! I'll help you create professional legal documents for this deal.`);
  }
  
  // Smart recommendations based on deal type and stage
  const recommendations: string[] = [];
  const dealType = dealContext.dealType?.toLowerCase() || '';
  const dealCategory = dealContext.dealCategory?.toLowerCase() || '';
  const status = dealContext.status?.toLowerCase() || '';
  
  // Early stage deals - recommend NDA first
  if (status === 'draft' || status === 'active') {
    recommendations.push('**Non-Disclosure Agreement (NDA)** - Protect confidential information before sharing sensitive details');
  }
  
  // Based on deal type
  if (dealType.includes('asset') || dealCategory === 'business_sale') {
    recommendations.push('**Asset Purchase Agreement** - Define what assets are being transferred');
    recommendations.push('**Letter of Intent (LOI)** - Outline key terms before formal negotiations');
  } else if (dealType.includes('share') || dealType.includes('equity')) {
    recommendations.push('**Share Purchase Agreement** - Structure equity transfer terms');
  } else if (dealCategory === 'ip_transfer') {
    recommendations.push('**IP Assignment Agreement** - Transfer intellectual property rights');
  }
  
  // Add service agreement for consulting/service deals
  if (dealType.includes('service') || dealType.includes('consult')) {
    recommendations.push('**Service Agreement** - Define scope, deliverables, and payment terms');
  }
  
  // Build the recommendation section
  if (recommendations.length > 0) {
    parts.push('\n\n📋 **Recommended for your deal:**');
    recommendations.slice(0, 3).forEach(rec => {
      parts.push(`• ${rec}`);
    });
  }
  
  parts.push('\n\n**What type of document would you like to create?**');
  
  return parts.join('\n');
}

/**
 * Build a partial document preview based on current answers
 */
function buildPartialDocumentPreview(
  documentType: string,
  answers: Record<string, any>,
  dealContext: Record<string, any>
): string {
  const flow = getQuestionFlow(documentType);
  if (!flow) return '';
  
  const docTypeDisplay = flow.displayName || documentType.replace(/_/g, ' ').toUpperCase();
  const businessName = dealContext?.dealContext?.businessName || dealContext?.businessName || '[BUSINESS NAME]';
  const counterparty = dealContext?.dealContext?.counterpartyName || dealContext?.counterpartyName || '[COUNTERPARTY]';
  const dealTitle = dealContext?.dealContext?.title || dealContext?.title || '';
  
  const lines: string[] = [];
  
  // Document Header
  lines.push(`${'═'.repeat(50)}`);
  lines.push(`${docTypeDisplay}`);
  lines.push(`${'═'.repeat(50)}`);
  lines.push('');
  lines.push(`THIS AGREEMENT is made on [DATE]`);
  lines.push('');
  lines.push('BETWEEN:');
  lines.push(`(1) ${businessName} ("Party A")`);
  lines.push(`(2) ${counterparty} ("Party B")`);
  lines.push('');
  
  // Recitals based on document type
  lines.push('RECITALS:');
  if (documentType.includes('nda') || documentType.includes('confidentiality')) {
    lines.push('A. The parties wish to explore a potential business relationship.');
    lines.push('B. In connection with this, confidential information may be disclosed.');
  } else if (documentType.includes('purchase') || documentType.includes('sale')) {
    lines.push('A. Party A wishes to sell and Party B wishes to purchase certain assets/interests.');
    lines.push('B. The parties have agreed to the terms set out in this Agreement.');
  } else if (documentType.includes('service')) {
    lines.push('A. Party A provides certain services.');
    lines.push('B. Party B wishes to engage Party A to provide such services.');
  } else {
    lines.push('A. The parties wish to enter into a business arrangement.');
    lines.push('B. The parties have agreed to the terms set out below.');
  }
  lines.push('');
  
  // Build sections from gathered answers
  lines.push('AGREED TERMS:');
  lines.push('');
  
  let clauseNum = 1;
  
  // Add answered sections with visual styling
  Object.entries(answers).forEach(([questionId, value]) => {
    const question = flow.questions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.value === value);
    
    if (question && option) {
      const sectionTitle = question.id
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      lines.push(`${clauseNum}. ${sectionTitle.toUpperCase()}`);
      lines.push('');
      
      // Generate clause content based on the answer
      const clauseContent = generateClauseContent(documentType, questionId, value, option.label);
      lines.push(`   ${clauseNum}.1 ${clauseContent}`);
      lines.push('');
      clauseNum++;
    }
  });
  
  // Add placeholder for remaining sections
  const answeredIds = Object.keys(answers);
  const remainingQuestions = flow.questions.filter(q => !answeredIds.includes(q.id));
  
  if (remainingQuestions.length > 0) {
    lines.push('');
    lines.push('┌─────────────────────────────────────────────┐');
    lines.push('│  📝 PENDING SECTIONS                        │');
    lines.push('├─────────────────────────────────────────────┤');
    remainingQuestions.forEach(q => {
      const title = q.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      lines.push(`│  ○ ${title.padEnd(40)}│`);
    });
    lines.push('└─────────────────────────────────────────────┘');
  }
  
  // Signature block placeholder
  lines.push('');
  lines.push('─'.repeat(50));
  lines.push('');
  lines.push('EXECUTED as an agreement:');
  lines.push('');
  lines.push(`For ${businessName}:`);
  lines.push('');
  lines.push('_________________________');
  lines.push('Signature');
  lines.push('');
  lines.push(`For ${counterparty}:`);
  lines.push('');
  lines.push('_________________________');
  lines.push('Signature');
  
  return lines.join('\n');
}

/**
 * Generate clause content based on question and answer
 */
function generateClauseContent(documentType: string, questionId: string, value: string, label: string): string {
  // Map common question patterns to clause language
  const clauseTemplates: Record<string, Record<string, string>> = {
    // Confidentiality/NDA clauses
    scope: {
      broad: 'This Agreement covers all Confidential Information disclosed by either party, whether oral, written, electronic, or in any other form.',
      specific: 'This Agreement covers only the specific Confidential Information identified in Schedule 1.',
      mutual: 'Both parties shall protect the confidential information of the other party with the same degree of care used to protect their own confidential information.',
    },
    duration: {
      '1_year': 'The confidentiality obligations under this Agreement shall remain in effect for a period of one (1) year from the date of disclosure.',
      '2_years': 'The confidentiality obligations under this Agreement shall remain in effect for a period of two (2) years from the date of disclosure.',
      '3_years': 'The confidentiality obligations under this Agreement shall remain in effect for a period of three (3) years from the date of disclosure.',
      '5_years': 'The confidentiality obligations under this Agreement shall remain in effect for a period of five (5) years from the date of disclosure.',
      perpetual: 'The confidentiality obligations under this Agreement shall continue indefinitely and survive termination of this Agreement.',
    },
    // Payment terms
    payment_terms: {
      upfront: 'Payment shall be made in full upon execution of this Agreement.',
      milestone: 'Payment shall be made in instalments upon completion of agreed milestones.',
      monthly: 'Payment shall be made monthly in arrears within 14 days of invoice.',
      completion: 'Payment shall be made upon satisfactory completion of all deliverables.',
    },
    // Dispute resolution
    dispute_resolution: {
      mediation: 'Any dispute shall first be referred to mediation in accordance with the Resolution Institute Mediation Rules.',
      arbitration: 'Any dispute shall be finally resolved by arbitration in accordance with the ACICA Arbitration Rules.',
      litigation: 'Any dispute shall be resolved by the courts of the relevant Australian jurisdiction.',
    },
    // Governing law
    governing_law: {
      nsw: 'This Agreement is governed by the laws of New South Wales, Australia.',
      vic: 'This Agreement is governed by the laws of Victoria, Australia.',
      qld: 'This Agreement is governed by the laws of Queensland, Australia.',
      wa: 'This Agreement is governed by the laws of Western Australia.',
      sa: 'This Agreement is governed by the laws of South Australia.',
    },
    // Termination
    termination: {
      notice_30: 'Either party may terminate this Agreement by giving 30 days written notice to the other party.',
      notice_60: 'Either party may terminate this Agreement by giving 60 days written notice to the other party.',
      notice_90: 'Either party may terminate this Agreement by giving 90 days written notice to the other party.',
      immediate: 'Either party may terminate this Agreement immediately upon material breach by the other party.',
    },
  };
  
  // Try to find a matching template
  const questionTemplates = clauseTemplates[questionId.toLowerCase()];
  if (questionTemplates && questionTemplates[value.toLowerCase()]) {
    return questionTemplates[value.toLowerCase()];
  }
  
  // Fallback: generate generic clause from label
  return `The parties agree that ${label.toLowerCase()} shall apply to this Agreement.`;
}

/**
 * Handle conversational template generation
 */
export async function handleConversationalTemplate(
  payload: ConversationalRequest,
  openai: any
): Promise<ConversationalResponse> {
  const { dealId, userId, messages, dealContext = {} } = payload;
  
  // Initialize or restore state
  let state: ConversationalState = payload.state || {
    phase: 'select_type',
    documentType: null,
    gatheredAnswers: {},
    currentQuestionIndex: 0
  };

  const rawLastUserMessage = messages[messages.length - 1]?.content ?? '';
  const lastUserMessage = rawLastUserMessage.toLowerCase().trim();

  const normalizeText = (input: string) =>
    input
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\([^)]*\)/g, ' ') // remove parenthetical acronyms like (NDA)
      .replace(/[^a-z0-9\s]/g, ' ') // strip punctuation
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedLastUserMessage = normalizeText(rawLastUserMessage);
  try {
    // Phase: Select Document Type
    if (state.phase === 'select_type') {
      const documentTypes = getAvailableDocumentTypes();

      // Check if user selected a document type (robust matching)
      const selectedType = documentTypes.find((dt) => {
        const typeNorm = normalizeText(dt.type);
        const displayNorm = normalizeText(dt.displayName);

        if (!typeNorm && !displayNorm) return false;

        // exact / substring matches
        if (normalizedLastUserMessage === typeNorm) return true;
        if (typeNorm && normalizedLastUserMessage.includes(typeNorm)) return true;
        if (typeNorm && typeNorm.includes(normalizedLastUserMessage)) return true;

        if (normalizedLastUserMessage === displayNorm) return true;
        if (displayNorm && normalizedLastUserMessage.includes(displayNorm)) return true;

        // acronym match, e.g. "NDA"
        const acronym = dt.displayName.match(/\(([^)]+)\)/)?.[1];
        if (acronym) {
          const acronymNorm = normalizeText(acronym);
          if (acronymNorm && normalizedLastUserMessage === acronymNorm) return true;
        }

        return false;
      });

      if (selectedType) {
        state.documentType = selectedType.type;
        state.phase = 'gathering';
        state.currentQuestionIndex = 0;

        const flow = getQuestionFlow(selectedType.type);
        const firstQuestion = flow?.questions[0];
        
        // Generate initial partial document preview
        const partialDoc = buildPartialDocumentPreview(selectedType.type, {}, dealContext);

        return {
          success: true,
          message: `Great choice! Let's create your **${selectedType.displayName}**.\n\n${firstQuestion?.helpText || ''}\n\n**${firstQuestion?.question}**`,
          state,
          options: firstQuestion?.options.map((o) => ({
            label: o.label,
            value: o.value,
            description: o.description,
          })),
          isComplete: false,
          partialDocument: partialDoc,
        };
      }

      // If user typed something but didn't match a document type, use AI to understand
      if (rawLastUserMessage && rawLastUserMessage.toLowerCase() !== 'start') {
        const aiDocTypeResponse = await handleDocumentTypeChat(
          rawLastUserMessage,
          documentTypes,
          dealContext,
          openai
        );
        
        if (aiDocTypeResponse.matchedType) {
          // AI understood and matched to a document type
          const matchedDocType = documentTypes.find(dt => dt.type === aiDocTypeResponse.matchedType);
          if (matchedDocType) {
            state.documentType = matchedDocType.type;
            state.phase = 'gathering';
            state.currentQuestionIndex = 0;

            const flow = getQuestionFlow(matchedDocType.type);
            const firstQuestion = flow?.questions[0];
            const partialDoc = buildPartialDocumentPreview(matchedDocType.type, {}, dealContext);

            return {
              success: true,
              message: `${aiDocTypeResponse.message}\n\n${firstQuestion?.helpText || ''}\n\n**${firstQuestion?.question}**`,
              state,
              options: firstQuestion?.options.map((o) => ({
                label: o.label,
                value: o.value,
                description: o.description,
              })),
              isComplete: false,
              partialDocument: partialDoc,
            };
          }
        }
        
        // AI provided helpful response but no match
        return {
          success: true,
          message: `${aiDocTypeResponse.message}\n\n**What type of document would you like to create?**`,
          state,
          options: documentTypes.map((dt) => ({
            label: dt.displayName,
            value: dt.type,
            description: dt.description,
          })),
          isComplete: false,
        };
      }

      // Show document type selection with smart welcome
      const welcomeMessage = buildSmartWelcome(dealContext?.dealContext || dealContext || {});
      
      return {
        success: true,
        message: welcomeMessage,
        state,
        options: documentTypes.map((dt) => ({
          label: dt.displayName,
          value: dt.type,
          description: dt.description,
        })),
        isComplete: false,
      };
    }

    // Phase: Gathering Requirements
    if (state.phase === 'gathering' && state.documentType) {
      const flow = getQuestionFlow(state.documentType);
      if (!flow) {
        return {
          success: false,
          message: 'Invalid document type selected.',
          state,
          isComplete: false,
          error: 'Invalid document type'
        };
      }

      const currentQuestion = flow.questions[state.currentQuestionIndex];

      // Try to match user's response to an option
      if (currentQuestion && lastUserMessage) {
        const matchedOption = currentQuestion.options.find(o => 
          lastUserMessage.includes(o.label.toLowerCase()) ||
          lastUserMessage.includes(o.value.toLowerCase()) ||
          lastUserMessage === o.value
        );

        // Also check for numbered responses
        const numberMatch = lastUserMessage.match(/^(\d+)\.?$/);
        let selectedOption = matchedOption;
        if (!selectedOption && numberMatch) {
          const index = parseInt(numberMatch[1]) - 1;
          if (index >= 0 && index < currentQuestion.options.length) {
            selectedOption = currentQuestion.options[index];
          }
        }

        if (selectedOption) {
          // Store the answer
          state.gatheredAnswers[currentQuestion.id] = selectedOption.value;
          state.currentQuestionIndex++;

          // Check if we have more questions
          if (state.currentQuestionIndex < flow.questions.length) {
            const nextQuestion = flow.questions[state.currentQuestionIndex];
            const progress = `${state.currentQuestionIndex + 1}/${flow.questions.length}`;
            
            // Generate updated partial document preview with new answer
            const partialDoc = buildPartialDocumentPreview(state.documentType!, state.gatheredAnswers, dealContext);

            return {
              success: true,
              message: `Got it! *${selectedOption.label}*\n\n*(${progress})* ${nextQuestion.helpText || ''}\n\n**${nextQuestion.question}**`,
              state,
              options: nextQuestion.options.map(o => ({
                label: o.label,
                value: o.value,
                description: o.description
              })),
              isComplete: false,
              partialDocument: partialDoc
            };
          } else {
            // All questions answered, move to confirmation
            state.phase = 'confirming';
            
            // Generate complete partial preview before final generation
            const partialDoc = buildPartialDocumentPreview(state.documentType!, state.gatheredAnswers, dealContext);
            
            const summary = Object.entries(state.gatheredAnswers).map(([key, value]) => {
              const question = flow.questions.find(q => q.id === key);
              const option = question?.options.find(o => o.value === value);
              return `• **${question?.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**: ${option?.label || value}`;
            }).join('\n');

            return {
              success: true,
              message: `Excellent! I have all the information I need.\n\n**Document Summary:**\n${summary}\n\n**Ready to generate your ${flow.displayName}?**`,
              state,
              options: [
                { label: 'Generate Document', value: 'generate', description: 'Create the document now' },
                { label: 'Modify Answers', value: 'modify', description: 'Go back and change something' }
              ],
              isComplete: false,
              partialDocument: partialDoc
            };
          }
        }
      }

      // If no match, use AI to understand the user's intent and respond intelligently
      if (currentQuestion) {
        const aiResponse = await handleFreeFormChat(
          rawLastUserMessage,
          state,
          currentQuestion,
          dealContext,
          openai
        );
        
        if (aiResponse.matchedOption) {
          // AI understood the user's intent and matched it to an option
          state.gatheredAnswers[currentQuestion.id] = aiResponse.matchedOption;
          state.currentQuestionIndex++;

          const flow = getQuestionFlow(state.documentType!);
          if (flow && state.currentQuestionIndex < flow.questions.length) {
            const nextQuestion = flow.questions[state.currentQuestionIndex];
            const progress = `${state.currentQuestionIndex + 1}/${flow.questions.length}`;
            const partialDoc = buildPartialDocumentPreview(state.documentType!, state.gatheredAnswers, dealContext);

            return {
              success: true,
              message: `${aiResponse.message}\n\n*(${progress})* ${nextQuestion.helpText || ''}\n\n**${nextQuestion.question}**`,
              state,
              options: nextQuestion.options.map(o => ({
                label: o.label,
                value: o.value,
                description: o.description
              })),
              isComplete: false,
              partialDocument: partialDoc
            };
          } else if (flow) {
            // All questions answered
            state.phase = 'confirming';
            const partialDoc = buildPartialDocumentPreview(state.documentType!, state.gatheredAnswers, dealContext);
            const summary = Object.entries(state.gatheredAnswers).map(([key, value]) => {
              const question = flow.questions.find(q => q.id === key);
              const option = question?.options.find(o => o.value === value);
              return `• **${question?.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**: ${option?.label || value}`;
            }).join('\n');

            return {
              success: true,
              message: `${aiResponse.message}\n\n**Document Summary:**\n${summary}\n\n**Ready to generate your ${flow.displayName}?**`,
              state,
              options: [
                { label: 'Generate Document', value: 'generate', description: 'Create the document now' },
                { label: 'Modify Answers', value: 'modify', description: 'Go back and change something' }
              ],
              isComplete: false,
              partialDocument: partialDoc
            };
          }
        }
        
        // AI provided a helpful response but didn't match an option
        return {
          success: true,
          message: `${aiResponse.message}\n\n**${currentQuestion.question}**`,
          state,
          options: currentQuestion.options.map(o => ({
            label: o.label,
            value: o.value,
            description: o.description
          })),
          isComplete: false
        };
      }
    }

    // Phase: Confirming
    if (state.phase === 'confirming') {
      if (lastUserMessage.includes('generate') || lastUserMessage.includes('yes') || lastUserMessage.includes('create')) {
        state.phase = 'generating';
        
        // Generate the document
        const generatedDoc = await generateDocumentFromAnswers(
          state.documentType!,
          state.gatheredAnswers,
          dealContext,
          openai
        );

        state.phase = 'complete';

        return {
          success: true,
          message: `Your **${state.documentType}** is ready! You can review and edit it below.`,
          state,
          isComplete: true,
          generatedDocument: generatedDoc.content,
          disclaimer: generatedDoc.disclaimer
        };
      }

      if (lastUserMessage.includes('modify') || lastUserMessage.includes('change') || lastUserMessage.includes('back')) {
        // Reset to gathering phase
        state.phase = 'gathering';
        state.currentQuestionIndex = 0;
        state.gatheredAnswers = {};

        const flow = getQuestionFlow(state.documentType!);
        const firstQuestion = flow?.questions[0];

        return {
          success: true,
          message: `No problem! Let's start over.\n\n**${firstQuestion?.question}**`,
          state,
          options: firstQuestion?.options.map(o => ({
            label: o.label,
            value: o.value,
            description: o.description
          })),
          isComplete: false
        };
      }

      // Re-ask for confirmation
      return {
        success: true,
        message: `Would you like me to generate the document now, or would you like to modify your answers?`,
        state,
        options: [
          { label: 'Generate Document', value: 'generate', description: 'Create the document now' },
          { label: 'Modify Answers', value: 'modify', description: 'Go back and change something' }
        ],
        isComplete: false
      };
    }

    // Fallback
    return {
      success: true,
      message: `I'm here to help you create legal documents. What type of document would you like to generate?`,
      state: {
        phase: 'select_type',
        documentType: null,
        gatheredAnswers: {},
        currentQuestionIndex: 0
      },
      options: getAvailableDocumentTypes().map(dt => ({
        label: dt.displayName,
        value: dt.type,
        description: dt.description
      })),
      isComplete: false
    };

  } catch (error) {
    console.error('Conversational template error:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
      state,
      isComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handle free-form chat for document type selection
 */
async function handleDocumentTypeChat(
  userMessage: string,
  documentTypes: Array<{ type: string; displayName: string; description: string }>,
  dealContext: Record<string, any>,
  openai: any
): Promise<{ message: string; matchedType?: string }> {
  try {
    const typesDescription = documentTypes
      .map(dt => `- "${dt.type}": ${dt.displayName} - ${dt.description}`)
      .join('\n');

    const systemPrompt = `You are a helpful legal document assistant. The user wants to create a document but you need to understand which type.

Available document types:
${typesDescription}

Your task:
1. If the user clearly indicates what document they need, respond with: {"matchedType": "document_type_value", "message": "Great choice! Let's create your [document name]."}
2. If the user asks what documents are available or needs help choosing, explain the options briefly. Respond with: {"matchedType": null, "message": "Your helpful explanation of options"}
3. If ambiguous, ask what they're trying to accomplish. Respond with: {"matchedType": null, "message": "Your clarifying question"}

Context about the deal: ${JSON.stringify(dealContext?.dealContext || dealContext || {})}

Always respond with valid JSON only. Be concise and helpful.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const aiContent = response.choices[0]?.message?.content || '';
    
    try {
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedContent);
      return {
        message: parsed.message || "I'd be happy to help you create a document.",
        matchedType: parsed.matchedType || undefined
      };
    } catch {
      return {
        message: aiContent || "I can help you create various legal documents. Which type would you like?"
      };
    }
  } catch (error) {
    console.error('Document type chat AI error:', error);
    return {
      message: "I can help you create NDAs, contracts, agreements, and more. Please select a document type from the options above."
    };
  }
}

/**
 * Handle free-form chat messages using AI
 * This enables users to type natural language instead of just clicking buttons
 */
async function handleFreeFormChat(
  userMessage: string,
  state: ConversationalState,
  currentQuestion: { id: string; question: string; options: Array<{ label: string; value: string; description?: string }> },
  dealContext: Record<string, any>,
  openai: any
): Promise<{ message: string; matchedOption?: string }> {
  try {
    const optionsDescription = currentQuestion.options
      .map(o => `- "${o.value}": ${o.label}${o.description ? ` (${o.description})` : ''}`)
      .join('\n');

    const systemPrompt = `You are a helpful legal document assistant. The user is creating a ${state.documentType} document.

Current question: "${currentQuestion.question}"

Available options:
${optionsDescription}

Your task:
1. If the user's message clearly indicates a preference that matches one of the available options, respond with a JSON object: {"matchedOption": "option_value", "message": "Your friendly acknowledgment"}
2. If the user is asking a question about the options or needs clarification, provide a helpful explanation and end with asking them to choose an option. Respond with: {"matchedOption": null, "message": "Your helpful response"}
3. If the user's response is ambiguous, ask a clarifying question. Respond with: {"matchedOption": null, "message": "Your clarifying question"}

Always respond with valid JSON only. Be concise and helpful.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const aiContent = response.choices[0]?.message?.content || '';
    
    try {
      // Try to parse JSON response
      const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedContent);
      return {
        message: parsed.message || "I understand. Let me help you with that.",
        matchedOption: parsed.matchedOption || undefined
      };
    } catch {
      // If not valid JSON, treat as a plain message
      return {
        message: aiContent || "I'm here to help! Please select one of the options above, or ask me any questions about them."
      };
    }
  } catch (error) {
    console.error('Free-form chat AI error:', error);
    return {
      message: "I'd be happy to help clarify the options. Could you please select one of the choices above, or let me know what you'd like to understand better?"
    };
  }
}

/**
 * Generate the actual document from gathered answers
 */
async function generateDocumentFromAnswers(
  documentType: string,
  answers: Record<string, any>,
  dealContext: Record<string, any>,
  openai: any
): Promise<{ content: string; disclaimer: string }> {
  
  const formattedRequirements = formatAnswersForGeneration(documentType, answers, dealContext);
  
  const systemPrompt = `${DOCUMENT_GENERATION_SYSTEM_PROMPT}

${AUSTRALIAN_LEGAL_CONTEXT}

CLAUSE LIBRARY FOR REFERENCE:
${CLAUSE_LIBRARY}

EXAMPLE DOCUMENTS FOR QUALITY REFERENCE:
${DOCUMENT_EXAMPLES}

DEAL CONTEXT:
${JSON.stringify(dealContext, null, 2)}

USER REQUIREMENTS FROM CONVERSATION:
${formattedRequirements}

GENERATION INSTRUCTIONS:
1. Generate a complete, professional ${documentType} based on the user's specific requirements
2. Use Australian legal standards and terminology
3. Include all standard clauses for this document type
4. Tailor clauses based on the user's answers
5. Use proper legal formatting with numbered clauses
6. Include schedules if appropriate
7. Make it ready for immediate use with minimal editing`;

  const userPrompt = `Generate a complete ${documentType} document based on the requirements gathered during our conversation. The document should be professional, comprehensive, and ready for use.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 8000,
    temperature: 0.3
  });

  const generatedContent = response.choices[0]?.message?.content || '';

  // Clean up the content
  let cleanedContent = generatedContent
    .replace(/```[\w]*\n?/g, '')
    .replace(/\*\*/g, '')
    .trim();

  const disclaimer = `IMPORTANT DISCLAIMER: This document was generated by AI based on your inputs and is provided for informational purposes only. It does not constitute legal advice. This document should be reviewed by a qualified Australian legal professional before use. Laws and regulations may have changed since this document was generated. The accuracy, completeness, and applicability of this document to your specific situation cannot be guaranteed.`;

  return {
    content: cleanedContent,
    disclaimer
  };
}
