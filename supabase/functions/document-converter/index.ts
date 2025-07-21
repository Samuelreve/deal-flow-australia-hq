import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Use LibreOffice headless for conversion
    const tempDir = await Deno.makeTempDir()
    const inputPath = `${tempDir}/input${getExtension(filename)}`
    const outputPath = `${tempDir}/output.pdf`

    try {
      // Write input file
      await Deno.writeFile(inputPath, binaryData)

      // Convert to PDF using LibreOffice
      const process = new Deno.Command("libreoffice", {
        args: [
          "--headless",
          "--convert-to", "pdf",
          "--outdir", tempDir,
          inputPath
        ],
        stdout: "piped",
        stderr: "piped"
      })

      const { code, stdout, stderr } = await process.output()

      if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr)
        console.error('LibreOffice conversion failed:', errorText)
        
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

      // Read converted PDF
      const pdfData = await Deno.readFile(outputPath)
      const pdfBase64 = btoa(String.fromCharCode(...pdfData))

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
      // Clean up temp files
      try {
        await Deno.remove(tempDir, { recursive: true })
      } catch (e) {
        console.warn('Failed to clean up temp directory:', e)
      }
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

function getExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'docx':
    case 'doc':
      return '.docx'
    case 'rtf':
      return '.rtf'
    default:
      return '.txt'
  }
}