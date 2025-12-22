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
  formatAnswersForGeneration,
  matchDocumentType,
  DOCUMENT_TYPE_ALIASES
} from '../../_shared/conversational-questions.ts';
import { 
  DOCUMENT_GENERATION_SYSTEM_PROMPT, 
  AUSTRALIAN_LEGAL_CONTEXT,
  CLAUSE_LIBRARY,
  DOCUMENT_EXAMPLES,
  IP_CLAUSE_LIBRARY,
  IP_AUSTRALIA_CONTEXT
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
  disclaimer?: string;
  error?: string;
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

      // Check if user selected a document type using alias matching first
      const matchedDocType = matchDocumentType(rawLastUserMessage);
      let selectedType = matchedDocType 
        ? documentTypes.find(dt => dt.type === matchedDocType) 
        : null;
      
      // Fallback to substring matching if alias didn't match
      if (!selectedType) {
        selectedType = documentTypes.find((dt) => {
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
      }

      if (selectedType) {
        state.documentType = selectedType.type;
        state.phase = 'gathering';
        state.currentQuestionIndex = 0;

        const flow = getQuestionFlow(selectedType.type);
        const firstQuestion = flow?.questions[0];

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
        };
      }

      // Show document type selection
      return {
        success: true,
        message: `Welcome! I'll help you create a professional legal document for this deal.\n\n**What type of document do you need?**`,
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

            return {
              success: true,
              message: `Got it! *${selectedOption.label}*\n\n*(${progress})* ${nextQuestion.helpText || ''}\n\n**${nextQuestion.question}**`,
              state,
              options: nextQuestion.options.map(o => ({
                label: o.label,
                value: o.value,
                description: o.description
              })),
              isComplete: false
            };
          } else {
            // All questions answered, move to confirmation
            state.phase = 'confirming';
            
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
              isComplete: false
            };
          }
        }
      }

      // If no match, re-ask the current question
      if (currentQuestion) {
        return {
          success: true,
          message: `I didn't quite catch that. Please select one of the options below.\n\n**${currentQuestion.question}**`,
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
 * Generate the actual document from gathered answers
 */
async function generateDocumentFromAnswers(
  documentType: string,
  answers: Record<string, any>,
  dealContext: Record<string, any>,
  openai: any
): Promise<{ content: string; disclaimer: string }> {
  
  const formattedRequirements = formatAnswersForGeneration(documentType, answers, dealContext);
  
  // Check if this is an IP document type that needs IP-specific clauses
  const isIPDocument = ['Patent Assignment Agreement', 'Trademark Assignment Agreement', 'IP License Agreement'].includes(documentType);
  
  const systemPrompt = `${DOCUMENT_GENERATION_SYSTEM_PROMPT}

${AUSTRALIAN_LEGAL_CONTEXT}

CLAUSE LIBRARY FOR REFERENCE:
${CLAUSE_LIBRARY}

${isIPDocument ? `
IP-SPECIFIC CLAUSE LIBRARY:
${IP_CLAUSE_LIBRARY}

AUSTRALIAN IP REGULATORY CONTEXT:
${IP_AUSTRALIA_CONTEXT}
` : ''}

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
7. Make it ready for immediate use with minimal editing${isIPDocument ? `
8. Include IP Australia recordation provisions where applicable
9. Reference the Patents Act 1990 (Cth) or Trade Marks Act 1995 (Cth) as appropriate
10. Include chain of title warranties and further assurance clauses` : ''}`;

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
