import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mammoth from "https://esm.sh/mammoth@1.6.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
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
        
        // Split HTML into pages (simple approach - split by page breaks or every ~1000 words)
        const pages = splitHtmlIntoPages(html)
        
        return new Response(
          JSON.stringify({ 
            success: true,
            pages: pages,
            totalPages: pages.length,
            originalFilename: filename
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Only DOCX conversion is supported',
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
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Document conversion failed',
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

function splitHtmlIntoPages(html: string): string[] {
  // Simple page splitting - you can enhance this logic
  const words = html.split(/\s+/)
  const wordsPerPage = 500 // Approximate words per page
  const pages: string[] = []
  
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageWords = words.slice(i, i + wordsPerPage)
    const pageHtml = pageWords.join(' ')
    
    // Wrap in proper HTML structure
    const styledPage = `
      <div style="
        width: 794px; 
        min-height: 1123px; 
        padding: 40px; 
        font-family: Arial, sans-serif; 
        font-size: 12pt; 
        line-height: 1.6; 
        color: #333;
        background: white;
        border: 1px solid #ddd;
        margin: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        ${pageHtml}
      </div>
    `
    pages.push(styledPage)
  }
  
  return pages.length > 0 ? pages : [html]
}