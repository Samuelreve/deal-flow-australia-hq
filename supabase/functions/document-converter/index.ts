import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mammoth from "npm:mammoth@1.6.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, referer, user-agent',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { fileData, mimeType, filename } = await req.json()

    if (!fileData || !mimeType || !filename) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileData, mimeType, filename' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert base64 to Uint8Array
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))

    try {
      const extension = getInputFormat(filename)
      
      if (extension === 'docx') {
        // Convert DOCX to HTML using mammoth
        const result = await mammoth.convertToHtml({ buffer: binaryData })
        const html = result.value
        
        // Since Puppeteer has file system access restrictions in Supabase Edge Functions,
        // we'll return the HTML content for now and handle PDF conversion differently
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'PDF conversion temporarily unavailable due to runtime restrictions',
            htmlContent: html,
            fallback: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        // Only DOCX conversion is supported
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Only DOCX conversion is supported, PDF positioning not available',
            fallback: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } catch (parseError) {
      console.error('Document parsing failed:', parseError)
      
      // Fallback: return original file if conversion fails
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Document conversion failed, PDF positioning not available',
          fallback: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Document conversion error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error during document conversion',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getInputFormat(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'docx':
      return 'docx'
    case 'doc':
      return 'doc'
    default:
      return 'unknown'
  }
}