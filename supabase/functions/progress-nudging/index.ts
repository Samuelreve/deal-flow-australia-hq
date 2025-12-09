
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

// Define types
type DealAlert = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  participants: {
    user_id: string;
    role: string;
  }[];
}

type MilestoneAlert = {
  id: string;
  title: string;
  status: string;
  due_date: string;
  deal_id: string;
  deal_title: string;
  assigned_to: {
    user_id: string;
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

function getSupabaseClient() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Find deals with no activity for a certain period (e.g., 7 days)
async function findStalledDeals(supabase: any, inactiveDays = 7): Promise<DealAlert[]> {
  console.log(`Checking for deals with no activity in the last ${inactiveDays} days`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
  const cutoffDateString = cutoffDate.toISOString();
  
  // Only check active and pending deals
  const { data, error } = await supabase
    .from('deals')
    .select(`
      id,
      title,
      status,
      updated_at,
      deal_participants(user_id, role)
    `)
    .in('status', ['active', 'pending'])
    .lt('updated_at', cutoffDateString);
  
  if (error) {
    console.error("Error finding stalled deals:", error);
    throw error;
  }
  
  return data.map((deal: any) => ({
    id: deal.id,
    title: deal.title,
    status: deal.status,
    updated_at: deal.updated_at,
    participants: deal.deal_participants || []
  }));
}

// Find overdue milestones (due date is in the past and status is not completed)
async function findOverdueMilestones(supabase: any): Promise<MilestoneAlert[]> {
  console.log("Checking for overdue milestones");
  
  const today = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('milestones')
    .select(`
      id,
      title,
      status,
      due_date,
      deal_id,
      deals(title),
      milestone_assignments(user_id)
    `)
    .not('status', 'eq', 'completed')
    .lt('due_date', today);
  
  if (error) {
    console.error("Error finding overdue milestones:", error);
    throw error;
  }
  
  return data.map((milestone: any) => ({
    id: milestone.id,
    title: milestone.title,
    status: milestone.status,
    due_date: milestone.due_date,
    deal_id: milestone.deal_id,
    deal_title: milestone.deals?.title || "Unknown Deal",
    assigned_to: milestone.milestone_assignments || []
  }));
}

// Send notifications for stalled deals
async function sendDealNotifications(supabase: any, stalledDeals: DealAlert[]): Promise<void> {
  console.log(`Sending notifications for ${stalledDeals.length} stalled deals`);
  
  for (const deal of stalledDeals) {
    // For each participant in the deal
    for (const participant of deal.participants) {
      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: participant.user_id,
          deal_id: deal.id,
          title: 'Deal Needs Attention',
          message: `The deal "${deal.title}" has not had any activity for over a week. Consider taking action to move it forward.`,
          type: 'warning',
          category: 'deal_update',
          link: `/deals/${deal.id}`
        });
      
      if (error) {
        console.error(`Error creating notification for user ${participant.user_id}:`, error);
      }
    }
  }
}

// Send notifications for overdue milestones
async function sendMilestoneNotifications(supabase: any, overdueMilestones: MilestoneAlert[]): Promise<void> {
  console.log(`Sending notifications for ${overdueMilestones.length} overdue milestones`);
  
  for (const milestone of overdueMilestones) {
    // Format due date for display
    const dueDate = new Date(milestone.due_date);
    const formattedDate = dueDate.toLocaleDateString();
    
    // First, notify assigned users
    if (milestone.assigned_to && milestone.assigned_to.length > 0) {
      for (const assignment of milestone.assigned_to) {
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: assignment.user_id,
            deal_id: milestone.deal_id,
            title: 'Milestone Overdue',
            message: `The milestone "${milestone.title}" in deal "${milestone.deal_title}" was due on ${formattedDate} and is now overdue.`,
            type: 'error',
            category: 'deal_update',
            link: `/deals/${milestone.deal_id}`,
            related_entity_id: milestone.id,
            related_entity_type: 'milestone'
          });
        
        if (error) {
          console.error(`Error creating notification for assigned user ${assignment.user_id}:`, error);
        }
      }
    } else {
      // If no specific assignments, notify all deal participants
      const { data: participants, error } = await supabase
        .from('deal_participants')
        .select('user_id, role')
        .eq('deal_id', milestone.deal_id);
      
      if (error) {
        console.error(`Error fetching participants for deal ${milestone.deal_id}:`, error);
        continue;
      }
      
      // Notify all participants (could be refined to only notify sellers/admins)
      for (const participant of participants) {
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: participant.user_id,
            deal_id: milestone.deal_id,
            title: 'Milestone Overdue',
            message: `The milestone "${milestone.title}" in deal "${milestone.deal_title}" was due on ${formattedDate} and is now overdue.`,
            type: 'error',
            category: 'deal_update',
            link: `/deals/${milestone.deal_id}`,
            related_entity_id: milestone.id,
            related_entity_type: 'milestone'
          });
        
        if (error) {
          console.error(`Error creating notification for participant ${participant.user_id}:`, error);
        }
      }
    }
  }
}

// Check for inactivity in deals or messages (more advanced version)
async function checkDealActivity(supabase: any, inactiveDays = 7): Promise<void> {
  console.log("Running advanced deal activity check");
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
  const cutoffDateString = cutoffDate.toISOString();
  
  // Get all active deals
  const { data: activeDeals, error } = await supabase
    .from('deals')
    .select(`
      id, 
      title,
      updated_at,
      deal_participants(user_id, role)
    `)
    .in('status', ['active', 'pending']);
  
  if (error) {
    console.error("Error fetching active deals:", error);
    return;
  }
  
  // For each deal, check for recent activity
  for (const deal of activeDeals) {
    // Check for recent document uploads
    const { data: recentDocs, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('deal_id', deal.id)
      .gt('created_at', cutoffDateString)
      .limit(1);
      
    if (docError) {
      console.error(`Error checking documents for deal ${deal.id}:`, docError);
      continue;
    }
    
    // Check for recent comments
    const { data: recentComments, error: commentError } = await supabase
      .from('comments')
      .select('id')
      .eq('deal_id', deal.id)
      .gt('created_at', cutoffDateString)
      .limit(1);
      
    if (commentError) {
      console.error(`Error checking comments for deal ${deal.id}:`, commentError);
      continue;
    }
    
    // Check for milestone updates
    const { data: recentMilestones, error: milestoneError } = await supabase
      .from('milestones')
      .select('id')
      .eq('deal_id', deal.id)
      .gt('updated_at', cutoffDateString)
      .limit(1);
      
    if (milestoneError) {
      console.error(`Error checking milestones for deal ${deal.id}:`, milestoneError);
      continue;
    }
    
    // If no recent activity at all, notify participants
    if ((!recentDocs || recentDocs.length === 0) && 
        (!recentComments || recentComments.length === 0) &&
        (!recentMilestones || recentMilestones.length === 0)) {
      
      // Only notify if deal itself hasn't been updated recently
      if (new Date(deal.updated_at) < cutoffDate) {
        console.log(`No activity detected for deal ${deal.id} "${deal.title}" since ${cutoffDateString}`);
        
        // Notify participants (could filter by role)
        if (deal.deal_participants) {
          for (const participant of deal.deal_participants) {
            // Only notify sellers and buyers
            if (['seller', 'buyer'].includes(participant.role)) {
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: participant.user_id,
                  deal_id: deal.id,
                  title: 'Deal Needs Your Attention',
                  message: `There has been no activity on the deal "${deal.title}" for over ${inactiveDays} days. Consider checking its status and taking action.`,
                  type: 'info',
                  category: 'deal_update',
                  link: `/deals/${deal.id}`
                });
              
              if (notifError) {
                console.error(`Error creating notification for user ${participant.user_id}:`, notifError);
              }
            }
          }
        }
      }
    }
  }
}

// Main handler function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Progress nudging function started");
    const supabase = getSupabaseClient();
    
    // Process overdue milestones
    const overdueMilestones = await findOverdueMilestones(supabase);
    console.log(`Found ${overdueMilestones.length} overdue milestones`);
    await sendMilestoneNotifications(supabase, overdueMilestones);
    
    // Process stalled deals (simple version)
    const stalledDeals = await findStalledDeals(supabase);
    console.log(`Found ${stalledDeals.length} stalled deals`);
    await sendDealNotifications(supabase, stalledDeals);
    
    // Run more comprehensive activity check
    await checkDealActivity(supabase);
    
    return new Response(JSON.stringify({ 
      success: true,
      processedAt: new Date().toISOString(),
      stats: {
        overdueMilestones: overdueMilestones.length,
        stalledDeals: stalledDeals.length
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("Error in progress nudging function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
