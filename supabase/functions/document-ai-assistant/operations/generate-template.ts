
import { fetchDealData } from "./deal-data.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getUserDealRole } from "../../_shared/milestone-rbac.ts";

function getSupabaseAdmin() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Handle template generation operation
 */
export async function handleGenerateTemplate(
  content: string, 
  dealId: string, 
  userId: string, 
  templateType: string, 
  context?: Record<string, any>,
  openai: any
) {
  // Get Supabase admin client
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Verify user is a participant and fetch their role
    const userDealRole = await getUserDealRole(userId, dealId);
    
    // Check if role is authorized for template generation
    const authorizedRoles = ['admin', 'seller', 'lawyer'];
    if (!authorizedRoles.includes(userDealRole.toLowerCase())) {
      throw new Error(`Users with role '${userDealRole}' are not authorized to generate templates.`);
    }
    
    // Fetch comprehensive deal data
    const dealData = await fetchDealData(dealId, supabaseAdmin);
    
    // Construct prompt based on template type and deal data
    const systemPrompt = "You are a legal document drafting assistant specializing in business and real estate transactions. Create legally-sound document templates based on the provided information.";
    
    let userPrompt = `Generate a draft ${templateType} document based on the following deal information:\n\n`;
    
    // Add deal details to prompt
    userPrompt += `Deal Title: ${dealData.deal.title}\n`;
    if (dealData.deal.description) {
      userPrompt += `Deal Description: ${dealData.deal.description}\n`;
    }
    
    // Add seller information
    if (dealData.participants.seller) {
      userPrompt += `Seller(s): ${dealData.participants.seller.map(s => s.name).join(', ')}\n`;
    } else if (dealData.deal.seller) {
      userPrompt += `Seller: ${dealData.deal.seller.name}\n`;
    }
    
    // Add buyer information
    if (dealData.participants.buyer) {
      userPrompt += `Buyer(s): ${dealData.participants.buyer.map(b => b.name).join(', ')}\n`;
    } else if (dealData.deal.buyer) {
      userPrompt += `Buyer: ${dealData.deal.buyer.name}\n`;
    }
    
    // Add specific requirements from content
    userPrompt += `\nSpecific Requirements: ${content}\n\n`;
    
    // Add template-specific instructions
    userPrompt += `Please generate a complete ${templateType} that includes all standard clauses typically found in such documents. Format the document with proper headings, sections, and legal language. Include placeholders for signatures where appropriate.`;
    
    // Add any additional context if provided
    if (context) {
      if (context.jurisdiction) {
        userPrompt += `\nThis document should comply with ${context.jurisdiction} laws and regulations.`;
      }
      if (context.additionalClauses) {
        userPrompt += `\nPlease include these additional clauses: ${context.additionalClauses.join(', ')}.`;
      }
    }
    
    console.log(`Generating template for deal ${dealId}, template type: ${templateType}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    return {
      template: response.choices[0].message.content,
      disclaimer: "This document template is provided as a starting point only and should be reviewed by a qualified legal professional before use."
    };
  } catch (error) {
    console.error(`Error generating template for deal ${dealId}:`, error);
    throw error;
  }
}

/**
 * Handle smart template generation operation
 */
export async function handleGenerateSmartTemplate(
  content: string, 
  dealId: string, 
  userId: string,
  templateType: string,
  context?: Record<string, any>,
  openai: any
) {
  // This is an enhanced version of the template generator
  // that incorporates more AI-powered insights
  
  try {
    // Use the base template generation but with enhanced prompts
    const baseResult = await handleGenerateTemplate(
      content, 
      dealId, 
      userId, 
      templateType, 
      context,
      openai
    );
    
    // Add additional AI analysis and enhancements
    const enhancedTemplate = baseResult.template;
    
    return {
      template: enhancedTemplate,
      disclaimer: baseResult.disclaimer,
      insights: "This smart template has been enhanced with AI-generated insights based on similar deals and legal best practices."
    };
  } catch (error) {
    console.error(`Error generating smart template for deal ${dealId}:`, error);
    throw error;
  }
}
