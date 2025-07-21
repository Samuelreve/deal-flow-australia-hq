import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mammoth from "npm:mammoth@1.6.0"
import { jsPDF } from "npm:jspdf@2.5.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        // Convert DOCX to HTML first, then to PDF
        const result = await mammoth.convertToHtml({ buffer: binaryData })
        const html = result.value
        
        // Create PDF from HTML using jsPDF
        const doc = new jsPDF()
        
        // Simple text extraction and PDF generation
        // This is a basic implementation - for better formatting, you might need html2canvas
        const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        
        // Split text into lines that fit the page
        const lines = doc.splitTextToSize(textContent, 180)
        let yPosition = 20
        
        lines.forEach((line: string) => {
          if (yPosition > 280) { // Add new page if needed
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, 10, yPosition)
          yPosition += 7
        })
        
        const pdfArrayBuffer = doc.output('arraybuffer')
        const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))
        
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
      } else {
        // For RTF and other formats, return fallback for now
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'RTF conversion not yet implemented, PDF positioning not available',
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
    case 'rtf':
      return 'rtf'
    default:
      return 'txt'
  }
}