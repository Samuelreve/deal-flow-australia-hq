
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )
    
    // Get the authorization data to check if the request is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request data
    const { method } = req
    let requestData = {}
    
    if (req.method !== 'GET') {
      requestData = await req.json()
    }

    // For GET requests, we'll use URL parameters
    const url = new URL(req.url)
    
    // Process based on HTTP method
    if (method === 'GET') {
      const versionId = url.searchParams.get('versionId') || 
                       (requestData as any).versionId
      
      if (!versionId) {
        return new Response(
          JSON.stringify({ error: 'Missing versionId parameter' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Get all comments for this document version
      const { data, error } = await supabaseClient
        .from('document_comments')
        .select(`
          *,
          user:profiles(id, name, email, avatar_url),
          replies:document_comments(
            *,
            user:profiles(id, name, email, avatar_url)
          )
        `)
        .eq('document_version_id', versionId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching comments:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify(data),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else if (method === 'POST') {
      const { 
        content, 
        page_number, 
        location_data, 
        parent_comment_id, 
        selected_text,
        versionId 
      } = requestData as any
      
      if (!versionId || !content) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields (versionId, content)' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Insert the new comment
      const { data, error } = await supabaseClient
        .from('document_comments')
        .insert({
          document_version_id: versionId,
          user_id: user.id,
          content,
          page_number,
          location_data,
          parent_comment_id,
          selected_text: selected_text || (location_data?.selectedText || null)
        })
        .select('*, user:profiles(id, name, email, avatar_url)')
        .single()
      
      if (error) {
        console.error('Error creating comment:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify(data),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
