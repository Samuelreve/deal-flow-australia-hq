import OpenAI from "https://esm.sh/openai@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { fetchDocumentContent } from "./document-content.ts";

/**
 * Handler for summarizing deal details using AI
 */
export async function handleDealSummary(
  dealId: string,
  openai: OpenAI,
  supabase?: ReturnType<typeof createClient>
) {
  try {
    // Initialize Supabase client if not provided
    if (!supabase) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    // 1. Fetch deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, description, status, type, asking_price, created_at')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error('Deal not found or access denied.');
    }

    // 2. Fetch deal participants
    const { data: participants, error: participantsError } = await supabase
      .from('deal_participants')
      .select('user_id, role, profiles(name, email)')
      .eq('deal_id', dealId);
    
    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      // Continue without participants data
    }

    // 3. Fetch deal milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('title, description, status, due_date')
      .eq('deal_id', dealId)
      .order('order_index', { ascending: true });
    
    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      // Continue without milestones data
    }

    // 4. Fetch recent documents (limit to 5 most recent)
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id, name, category, created_at')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      // Continue without documents data
    }

    // 5. Construct deal context for OpenAI
    const dealContext = {
      title: deal.title,
      description: deal.description || 'No description provided',
      status: deal.status,
      type: deal.type,
      askingPrice: deal.asking_price ? `$${deal.asking_price.toLocaleString()}` : 'Not specified',
      createdAt: new Date(deal.created_at).toLocaleDateString(),
      participants: participants?.map(p => ({
        role: p.role,
        name: p.profiles?.name || 'Unknown',
      })) || [],
      milestones: milestones?.map(m => ({
        title: m.title,
        status: m.status,
        dueDate: m.due_date ? new Date(m.due_date).toLocaleDateString() : 'No due date',
      })) || [],
      documents: documents?.map(d => ({
        name: d.name,
        category: d.category || 'Uncategorized',
      })) || [],
    };

    // 6. Construct OpenAI prompt
    const promptContent = `You are a business deal advisor. Please provide a comprehensive summary of the following business deal:
    
Deal Title: ${dealContext.title}
Deal Type: ${dealContext.type}
Status: ${dealContext.status}
Asking Price: ${dealContext.askingPrice}
Created: ${dealContext.createdAt}
Description: ${dealContext.description}

${dealContext.participants.length > 0 ? `Participants:
${dealContext.participants.map(p => `- ${p.name} (${p.role})`).join('\n')}` : 'No participants recorded.'}

${dealContext.milestones.length > 0 ? `Milestones:
${dealContext.milestones.map(m => `- ${m.title} (${m.status}${m.dueDate !== 'No due date' ? `, Due: ${m.dueDate}` : ''})`).join('\n')}` : 'No milestones recorded.'}

${dealContext.documents.length > 0 ? `Recent Documents:
${dealContext.documents.map(d => `- ${d.name} (${d.category})`).join('\n')}` : 'No documents recorded.'}

Please provide:
1. A concise executive summary of the deal (2-3 sentences)
2. Current status assessment
3. Key participants and their roles
4. Progress overview based on milestones
5. Next steps recommendation

Format your response in clear sections with headings.`;

    // 7. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI business advisor specializing in deal analysis and summaries." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const summary = response.choices[0]?.message?.content || 'Failed to generate deal summary';
    
    // 8. Return the summary with disclaimer
    return {
      summary,
      dealTitle: deal.title,
      dealStatus: deal.status,
      disclaimer: "This summary is AI-generated based on available deal information and is provided for informational purposes only. It should not be considered professional advice."
    };
    
  } catch (error: any) {
    console.error('Error in handleDealSummary:', error);
    throw error;
  }
}
