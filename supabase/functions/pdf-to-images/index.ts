import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pdfUrl, scale = 2 } = await req.json()

    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'PDF URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Converting PDF to images:', pdfUrl)

    // Use ConvertAPI service for PDF to image conversion
    // This is a reliable external service that handles PDF rendering
    const convertApiKey = Deno.env.get('CONVERT_API_KEY')
    
    if (!convertApiKey) {
      // Fallback: Try using a public PDF-to-image API or return structured data
      console.log('No ConvertAPI key found, attempting alternative approach...')
      
      // Try using PDF-lib just to get page count, then call a different service
      try {
        // Fetch the PDF to determine page count
        const pdfResponse = await fetch(pdfUrl)
        if (!pdfResponse.ok) {
          throw new Error('Failed to fetch PDF file')
        }
        
        // For now, return the PDF URL back to frontend and let it handle conversion
        // This is a temporary solution until we set up proper PDF rendering
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'PDF rendering service not configured',
            suggestion: 'Frontend should handle PDF rendering or configure external service',
            pdfUrl: pdfUrl,
            message: 'Please configure CONVERT_API_KEY or use frontend PDF.js rendering'
          }),
          { 
            status: 422,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (err) {
        throw new Error('PDF processing failed: ' + err.message)
      }
    }

    // Use ConvertAPI to convert PDF to images
    const formData = new FormData()
    
    // Fetch the PDF file and add it to form data
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF file')
    }
    
    const pdfBlob = await pdfResponse.blob()
    formData.append('File', pdfBlob, 'document.pdf')
    formData.append('ImageResolution', String(scale * 150)) // Higher resolution
    formData.append('ImageFormat', 'png')

    const convertResponse = await fetch(`https://v2.convertapi.com/convert/pdf/to/png?Secret=${convertApiKey}`, {
      method: 'POST',
      body: formData
    })

    if (!convertResponse.ok) {
      throw new Error(`ConvertAPI failed: ${convertResponse.status} ${convertResponse.statusText}`)
    }

    const convertResult = await convertResponse.json()
    
    if (!convertResult.Files || convertResult.Files.length === 0) {
      throw new Error('No images generated from PDF')
    }

    // Download and convert images to base64
    const images: string[] = []
    
    for (const file of convertResult.Files) {
      const imageResponse = await fetch(file.Url)
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Convert to base64
        const base64String = btoa(String.fromCharCode(...uint8Array))
        const dataUrl = `data:image/png;base64,${base64String}`
        
        images.push(dataUrl)
      }
    }

    console.log(`Successfully converted ${images.length} pages to images`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        images,
        totalPages: images.length,
        message: `Converted ${images.length} pages successfully`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error converting PDF to images:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to convert PDF to images', 
        details: error.message,
        suggestion: 'Consider setting up CONVERT_API_KEY environment variable for PDF rendering'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 