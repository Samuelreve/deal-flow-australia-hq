
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mammoth from "npm:mammoth@1.6.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Dynamic import to avoid initialization errors
let puppeteer: any = null;

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
        
        try {
          // Dynamically import Puppeteer only when needed
          if (!puppeteer) {
            puppeteer = await import("npm:puppeteer@22.0.0");
          }
          
          // Launch browser with minimal configuration
          const browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-extensions',
              '--no-first-run',
              '--disable-default-apps',
              '--disable-translate',
              '--disable-plugins-discovery',
              '--disable-plugins',
              '--disable-preconnect',
              '--disable-background-networking'
            ],
            // Don't let Puppeteer try to find config files
            ignoreDefaultArgs: ['--disable-extensions'],
            defaultViewport: { width: 794, height: 1123 }, // A4 size
            timeout: 30000
          });
          
          const page = await browser.newPage();
          
          // Set content with proper styling for A4
          const styledHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                @page { 
                  size: A4; 
                  margin: 20mm; 
                }
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  color: #333;
                  font-size: 12pt;
                }
                p { margin-bottom: 1em; }
                h1, h2, h3, h4, h5, h6 { 
                  margin-top: 1.5em; 
                  margin-bottom: 0.5em; 
                  page-break-after: avoid;
                }
                table { 
                  border-collapse: collapse; 
                  width: 100%; 
                  page-break-inside: avoid;
                }
                img { 
                  max-width: 100%; 
                  height: auto; 
                }
              </style>
            </head>
            <body>
              ${html}
            </body>
            </html>
          `;
          
          await page.setContent(styledHtml, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
          });
          
          // Generate PDF
          const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
              top: '20mm',
              right: '20mm',
              bottom: '20mm',
              left: '20mm'
            },
            printBackground: true,
            preferCSSPageSize: true,
            timeout: 30000
          });
          
          await browser.close();
          
          const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
          
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
          );
          
        } catch (puppeteerError) {
          console.error('Puppeteer error:', puppeteerError);
          
          // Fallback to HTML content if Puppeteer fails
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'PDF conversion failed with Puppeteer',
              fallback: true,
              htmlContent: html
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
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
