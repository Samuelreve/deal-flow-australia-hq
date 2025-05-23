
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const openai = new OpenAI({
  apiKey: openAIApiKey
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    const { analysisType, contractText, contractId, dealId } = await req.json();
    
    // Handle deal health predictions
    if (analysisType === 'dealHealth' && dealId) {
      return handleDealHealthPrediction(req, dealId);
    }
    
    // Handle contract analysis
    if (!analysisType || !contractText) {
      return new Response(
        JSON.stringify({ error: 'Analysis type and contract text are required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'summary':
        systemPrompt = `
          You are a legal contract analysis expert. Provide a comprehensive but concise summary of the contract.
          
          Include:
          1. Contract type and purpose
          2. Key parties involved
          3. Main obligations and responsibilities
          4. Important dates and timelines
          5. Financial terms (if any)
          6. Termination conditions
          
          Format your response in clear, structured sections with bullet points where appropriate.
        `;
        userPrompt = `Please provide a comprehensive summary of this contract:\n\n${contractText}`;
        break;

      case 'risks':
        systemPrompt = `
          You are a legal risk assessment specialist. Analyze the contract for potential risks and concerns.
          
          Focus on:
          1. Legal risks and liability issues
          2. Financial risks and exposure
          3. Operational risks and constraints
          4. Compliance and regulatory risks
          5. Unclear or ambiguous clauses
          6. Missing protections or clauses
          
          Rate each risk as High, Medium, or Low and explain the potential impact.
        `;
        userPrompt = `Please analyze this contract for potential risks and concerns:\n\n${contractText}`;
        break;

      case 'keyTerms':
        systemPrompt = `
          You are a contract terms extraction specialist. Extract and explain the most important terms and clauses.
          
          Focus on:
          1. Key definitions and terminology
          2. Important clauses and their implications
          3. Rights and obligations of each party
          4. Payment terms and conditions
          5. Intellectual property provisions
          6. Confidentiality and non-disclosure terms
          7. Dispute resolution mechanisms
          
          Present each term with a brief explanation of its significance.
        `;
        userPrompt = `Please extract and explain the key terms and clauses from this contract:\n\n${contractText}`;
        break;

      case 'suggestions':
        systemPrompt = `
          You are a contract improvement consultant. Provide constructive suggestions for improving the contract.
          
          Focus on:
          1. Missing clauses that should be included
          2. Unclear language that needs clarification
          3. Potential improvements to protect both parties
          4. Industry best practices that could be adopted
          5. Risk mitigation suggestions
          6. Compliance and legal improvements
          
          Provide practical, actionable recommendations with explanations.
        `;
        userPrompt = `Please provide suggestions for improving this contract:\n\n${contractText}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid analysis type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });
    
    const analysis = response.choices[0]?.message?.content || "Sorry, I couldn't generate an analysis.";
    
    // Create Supabase client for saving the analysis
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header and save analysis if available
    const authHeader = req.headers.get('Authorization');
    if (authHeader && contractId) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase.from('contract_questions').insert({
            contract_id: contractId,
            user_id: user.id,
            question: `${analysisType} analysis`,
            answer: analysis,
            sources: []
          });
        }
      } catch (error) {
        console.error("Error saving analysis:", error);
      }
    }
    
    return new Response(
      JSON.stringify({
        answer: analysis,
        analysisType: analysisType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Enhanced contract assistant error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process your request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to handle deal health prediction
async function handleDealHealthPrediction(req: Request, dealId: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get auth user if available
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    
    // 1. Fetch deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('title, status, description, created_at, asking_price, deal_type')
      .eq('id', dealId)
      .single();
    
    if (dealError || !deal) {
      throw new Error('Deal not found or access denied.');
    }

    // 2. Fetch milestones to assess progress
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('title, status, due_date, completed_at')
      .eq('deal_id', dealId);
    
    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
      // Continue without milestones data
    }

    // 3. Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from('deal_participants')
      .select('role, profiles:user_id(name, email)')
      .eq('deal_id', dealId);
    
    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      // Continue without participants data
    }

    // 4. Fetch document count
    const { count: documentCount, error: documentError } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('deal_id', dealId);
    
    if (documentError) {
      console.error('Error counting documents:', documentError);
      // Continue without document count
    }

    // 5. Calculate basic metrics
    const dealAgeInDays = Math.floor((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    const completedMilestones = milestones?.filter(m => m.status === 'completed') || [];
    const totalMilestones = milestones?.length || 0;
    const milestoneCompletionRate = totalMilestones > 0 ? (completedMilestones.length / totalMilestones) * 100 : 0;
    
    const overdueMilestones = milestones?.filter(m => {
      if (m.status !== 'completed' && m.due_date) {
        return new Date(m.due_date) < new Date();
      }
      return false;
    }) || [];

    // 6. Construct OpenAI prompt
    const promptContent = `You are a deal health prediction AI. Based on the following deal information, predict the health and likelihood of successful completion for this business transaction:
    
Deal Title: ${deal.title}
Deal Status: ${deal.status}
Deal Age: ${dealAgeInDays} days
Deal Type: ${deal.deal_type || 'Not specified'}
Asking Price: ${deal.asking_price ? '$' + deal.asking_price : 'Not specified'}
Description: ${deal.description || 'No description provided'}

Milestone Progress:
- Total Milestones: ${totalMilestones}
- Completed Milestones: ${completedMilestones.length} (${milestoneCompletionRate.toFixed(1)}%)
- Overdue Milestones: ${overdueMilestones.length}

Document Count: ${documentCount || 0}

Participants: ${participants?.length || 0} participants

Based on this information, provide:
1. A probability of success percentage from 0-100%
2. A confidence level for your prediction (low, medium, high)
3. Brief reasoning for your prediction (1-2 sentences)
4. 3-5 specific recommendations to improve the deal's success probability

Format your response as structured JSON with the following keys:
- probability_of_success_percentage: number (0-100)
- confidence_level: string (low, medium, or high)
- prediction_reasoning: string (1-2 sentences)
- suggested_improvements: array of objects with area, impact (high/medium/low), and recommendation
- disclaimer: string (a short legal disclaimer about the AI-generated prediction)`;

    // 7. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI deal health prediction assistant. Respond with valid JSON only." },
        { role: "user", content: promptContent }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // 8. Parse the response
    const responseContent = response.choices[0]?.message?.content || '{"error": "Failed to generate prediction"}';
    let prediction;
    
    try {
      prediction = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      prediction = {
        probability_of_success_percentage: 50,
        confidence_level: "low",
        prediction_reasoning: "Could not analyze deal health with available information",
        suggested_improvements: [
          { 
            area: "Data Quality", 
            impact: "high", 
            recommendation: "Provide more information about the deal" 
          }
        ],
        disclaimer: "This health prediction is inconclusive due to insufficient data"
      };
    }
    
    // 9. Save the prediction to the database if user is authenticated
    if (userId) {
      try {
        await supabase
          .from('deal_health_predictions')
          .insert({
            deal_id: dealId,
            user_id: userId,
            probability_percentage: prediction.probability_of_success_percentage,
            confidence_level: prediction.confidence_level,
            reasoning: prediction.prediction_reasoning,
            suggested_improvements: prediction.suggested_improvements,
            created_at: new Date().toISOString()
          })
          .select();
      } catch (saveError) {
        console.error('Error saving health prediction:', saveError);
        // Continue anyway to return prediction to user
      }
    }
    
    // 10. Return the prediction
    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in handleDealHealthPrediction:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process deal health prediction' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
