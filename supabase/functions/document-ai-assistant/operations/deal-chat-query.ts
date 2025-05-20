
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getUserDealRole } from "../../_shared/rbac.ts";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Fetch comprehensive deal data for the chat context
 */
async function fetchDealContextData(dealId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch basic deal information
    const { data: dealData, error: dealError } = await supabaseAdmin
      .from('deals')
      .select(`
        id, 
        title,
        business_legal_name,
        status,
        health_score,
        deal_type,
        asking_price,
        reason_for_selling,
        created_at,
        target_completion_date,
        seller:seller_id(name),
        buyer:buyer_id(name)
      `)
      .eq('id', dealId)
      .single();
      
    if (dealError) throw new Error(`Error fetching deal: ${dealError.message}`);
    if (!dealData) throw new Error("Deal not found");
    
    // Fetch milestones for this deal
    const { data: milestonesData, error: milestonesError } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
      
    if (milestonesError) throw new Error(`Error fetching milestones: ${milestonesError.message}`);
    
    // Fetch participants for this deal
    const { data: participantsData, error: participantsError } = await supabaseAdmin
      .from('deal_participants')
      .select(`
        role,
        profiles:user_id (
          name
        )
      `)
      .eq('deal_id', dealId);
      
    if (participantsError) throw new Error(`Error fetching participants: ${participantsError.message}`);
    
    // Fetch recent documents for this deal (last 5)
    const { data: documentsData, error: documentsError } = await supabaseAdmin
      .from('documents')
      .select(`
        id,
        name,
        type,
        status,
        created_at,
        profiles:uploaded_by (
          name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (documentsError) throw new Error(`Error fetching documents: ${documentsError.message}`);
    
    // Fetch recent comments for this deal (last 10)
    const { data: commentsData, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select(`
        content,
        created_at,
        profiles:user_id (
          name
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (commentsError) throw new Error(`Error fetching comments: ${commentsError.message}`);
    
    return {
      deal: dealData,
      milestones: milestonesData || [],
      participants: participantsData || [],
      documents: documentsData || [],
      comments: commentsData || []
    };
  } catch (error) {
    console.error("Error fetching deal context data:", error);
    throw error;
  }
}

/**
 * Format the deal data into a readable text format for the AI prompt
 */
function formatDealContextForPrompt(dealContext: any) {
  const { deal, milestones, participants, documents, comments } = dealContext;
  
  let formattedContext = `Current Deal Details:\n`;
  
  // Deal information
  formattedContext += `Deal Title: ${deal.title}\n`;
  formattedContext += `Business: ${deal.business_legal_name || 'Not specified'}\n`;
  formattedContext += `Status: ${deal.status} (Health Score: ${deal.health_score}%)\n`;
  formattedContext += `Type: ${deal.deal_type || 'Not specified'} | Asking Price: $${deal.asking_price || 'Not specified'}\n`;
  formattedContext += `Seller: ${deal.seller?.name || 'Unassigned'}\n`;
  formattedContext += `Buyer: ${deal.buyer?.name || 'Unassigned'}\n`;
  
  if (deal.reason_for_selling) {
    formattedContext += `Reason for Selling: ${deal.reason_for_selling}\n`;
  }
  
  const createdDate = new Date(deal.created_at).toLocaleDateString();
  const targetDate = deal.target_completion_date 
    ? new Date(deal.target_completion_date).toLocaleDateString() 
    : 'Not set';
  
  formattedContext += `Timeline: Created on ${createdDate} | Target Completion: ${targetDate}\n\n`;
  
  // Milestones information
  formattedContext += `Milestones (${milestones.length}):\n`;
  if (milestones.length > 0) {
    milestones.forEach(m => {
      const dueDate = m.due_date ? new Date(m.due_date).toLocaleDateString() : 'Not set';
      const completedDate = m.completed_at ? new Date(m.completed_at).toLocaleDateString() : '';
      
      formattedContext += `- ${m.title}: ${m.status} (Due: ${dueDate}${completedDate ? `, Completed: ${completedDate}` : ''})\n`;
      if (m.description) {
        formattedContext += `  Description: ${m.description}\n`;
      }
    });
  } else {
    formattedContext += `No milestones have been set for this deal.\n`;
  }
  formattedContext += '\n';
  
  // Participants information
  formattedContext += `Participants (${participants.length}):\n`;
  if (participants.length > 0) {
    participants.forEach(p => {
      formattedContext += `- ${p.profiles?.name || 'Unknown'} (${p.role})\n`;
    });
  } else {
    formattedContext += `No participants found for this deal.\n`;
  }
  formattedContext += '\n';
  
  // Documents information
  if (documents.length > 0) {
    formattedContext += `Recent Documents (${documents.length}):\n`;
    documents.forEach(doc => {
      const uploadDate = new Date(doc.created_at).toLocaleDateString();
      formattedContext += `- ${doc.name} (${doc.type || 'Unknown'}, Status: ${doc.status}) uploaded by ${doc.profiles?.name || 'Unknown'} on ${uploadDate}\n`;
    });
    formattedContext += '\n';
  }
  
  // Comments information
  if (comments.length > 0) {
    formattedContext += `Recent Comments (${comments.length}):\n`;
    comments.forEach(comment => {
      const commentDate = new Date(comment.created_at).toLocaleString();
      formattedContext += `- ${comment.profiles?.name || 'Unknown'} (${commentDate}): ${comment.content}\n`;
    });
    formattedContext += '\n';
  }
  
  return formattedContext;
}

/**
 * Handle deal chat query operation
 */
export async function handleDealChatQuery(
  dealId: string, 
  userId: string, 
  userQuery: string, 
  chatHistory: Array<{sender: string, content: string}> = [],
  openai: any
) {
  try {
    // Verify user is a participant in the deal
    try {
      await getUserDealRole(userId, dealId);
    } catch (error) {
      throw new Error(`Authorization error: ${error.message}`);
    }
    
    // Fetch comprehensive deal context
    const dealContext = await fetchDealContextData(dealId);
    
    // Format context for the AI prompt
    const formattedContext = formatDealContextForPrompt(dealContext);
    
    // Prepare messages for the OpenAI API
    const systemPrompt = `You are a helpful, deal-specific assistant for the DealPilot platform. Your goal is to answer user questions about the current deal based ONLY on the provided context.

**Important Rules:**
1. Answer the user's question concisely and directly.
2. Base your answer **ONLY** on the information provided in the 'Deal Context'.
3. If the answer is NOT explicitly available in the provided 'Deal Context', state clearly: 'I do not have enough information in the current deal context to answer that question.' Do NOT make up information or speculate.
4. Do NOT provide legal advice, financial advice, or personal opinions.
5. Keep your answer brief and to the point.`;

    // Start building the messages array
    const messages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add chat history for context if provided (limit to reasonable number)
    const recentHistory = chatHistory.slice(-4); // Only use the last 4 messages for context
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant', 
        content: msg.content
      });
    });
    
    // Add the current context and query
    messages.push({
      role: "user", 
      content: `Deal Context:\n${formattedContext}\n\nUser's Question: ${userQuery}`
    });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using more efficient model
      messages: messages,
      temperature: 0.1, // Keep temperature low for factual responses
      max_tokens: 500 // Reasonable limit for response length
    });
    
    const answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate an answer.";
    
    return {
      answer: answer,
      disclaimer: "This is an AI-generated response based on the information available about this deal. It should not be considered legal, financial, or professional advice."
    };
  } catch (error) {
    console.error("Error in deal chat query:", error);
    throw new Error(`Failed to process deal chat query: ${error.message}`);
  }
}
