import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mammoth from "npm:mammoth@1.6.0"
import puppeteer from "npm:puppeteer@21.7.0"

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
        
        // Launch Puppeteer to convert HTML to PDF
        const browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        
        try {
          const page = await browser.newPage()
          
          // Set content with proper styling
          const styledHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 40px;
                  color: #333;
                }
                p { margin-bottom: 1em; }
                h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
              </style>
            </head>
            <body>
              ${html}
            </body>
            </html>
          `
          
          await page.setContent(styledHtml, { waitUntil: 'networkidle0' })
          
          // Generate PDF
          const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            },
            printBackground: true
          })
          
          const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
          
          return new Response(
            JSON.stringify({ 
              success: true,
              pdfData: pdfBase64,
              originalFilename: filename
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } finally {
          await browser.close()
        }
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