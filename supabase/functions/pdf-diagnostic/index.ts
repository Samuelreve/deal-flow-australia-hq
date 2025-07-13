import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { fileBase64, fileName } = await req.json();
    
    console.log('🔍 Starting PDF diagnostic for:', fileName);

    if (!fileBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing file content.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert base64 to buffer
    let fileBuffer: Uint8Array;
    try {
      const binaryString = atob(fileBase64);
      fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const diagnostics = await diagnosePdf(fileBuffer, fileName);

    return new Response(
      JSON.stringify({
        success: true,
        diagnostics,
        recommendations: generateRecommendations(diagnostics)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ PDF diagnostic error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during PDF diagnosis' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function diagnosePdf(fileBuffer: Uint8Array, fileName: string) {
  const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
  const pdfContent = decoder.decode(fileBuffer);
  
  const diagnostics = {
    fileName,
    fileSize: fileBuffer.length,
    isPdfValid: false,
    pdfVersion: '',
    hasTextStreams: false,
    hasImages: false,
    isEncrypted: false,
    compressionMethods: [] as string[],
    pageCount: 0,
    textStreamCount: 0,
    imageCount: 0,
    fontCount: 0,
    metadata: {} as Record<string, string>,
    sampleContent: '',
    structureAnalysis: {
      hasXref: false,
      hasTrailer: false,
      hasStartxref: false,
      objectCount: 0,
      streamCount: 0
    }
  };

  try {
    // Check PDF header
    if (pdfContent.startsWith('%PDF-')) {
      diagnostics.isPdfValid = true;
      const versionMatch = pdfContent.match(/%PDF-(\d+\.\d+)/);
      if (versionMatch) {
        diagnostics.pdfVersion = versionMatch[1];
      }
    }

    // Check for encryption
    if (pdfContent.includes('/Encrypt') || pdfContent.includes('/Filter/Standard')) {
      diagnostics.isEncrypted = true;
    }

    // Count pages
    const pageMatches = pdfContent.match(/\/Type\s*\/Page\b/g);
    diagnostics.pageCount = pageMatches ? pageMatches.length : 0;

    // Check compression methods
    const compressionMethods: string[] = [];
    if (pdfContent.includes('/FlateDecode')) compressionMethods.push('FlateDecode');
    if (pdfContent.includes('/ASCIIHexDecode')) compressionMethods.push('ASCIIHexDecode');
    if (pdfContent.includes('/ASCII85Decode')) compressionMethods.push('ASCII85Decode');
    if (pdfContent.includes('/LZWDecode')) compressionMethods.push('LZWDecode');
    if (pdfContent.includes('/RunLengthDecode')) compressionMethods.push('RunLengthDecode');
    if (pdfContent.includes('/CCITTFaxDecode')) compressionMethods.push('CCITTFaxDecode');
    if (pdfContent.includes('/JBIG2Decode')) compressionMethods.push('JBIG2Decode');
    if (pdfContent.includes('/DCTDecode')) compressionMethods.push('DCTDecode (JPEG)');
    if (pdfContent.includes('/JPXDecode')) compressionMethods.push('JPXDecode (JPEG2000)');
    diagnostics.compressionMethods = compressionMethods;

    // Count different object types
    const streamMatches = pdfContent.match(/\bstream\b/g);
    diagnostics.structureAnalysis.streamCount = streamMatches ? streamMatches.length : 0;

    const objMatches = pdfContent.match(/\d+\s+\d+\s+obj/g);
    diagnostics.structureAnalysis.objectCount = objMatches ? objMatches.length : 0;

    // Check PDF structure
    diagnostics.structureAnalysis.hasXref = pdfContent.includes('xref');
    diagnostics.structureAnalysis.hasTrailer = pdfContent.includes('trailer');
    diagnostics.structureAnalysis.hasStartxref = pdfContent.includes('startxref');

    // Look for text content indicators
    const textIndicators = [
      '/Subtype/Text',
      '/Type/Font',
      'BT ', // Begin Text
      'ET ', // End Text
      'Tj ', // Show text
      'TJ ', // Show text with individual positioning
      '('    // Text in parentheses
    ];

    for (const indicator of textIndicators) {
      if (pdfContent.includes(indicator)) {
        diagnostics.hasTextStreams = true;
        break;
      }
    }

    // Count text streams more precisely
    const textOperators = pdfContent.match(/\b(Tj|TJ)\b/g);
    diagnostics.textStreamCount = textOperators ? textOperators.length : 0;

    // Look for images
    const imageIndicators = ['/Subtype/Image', '/Type/XObject', '/Filter/DCTDecode'];
    for (const indicator of imageIndicators) {
      if (pdfContent.includes(indicator)) {
        diagnostics.hasImages = true;
        diagnostics.imageCount++;
      }
    }

    // Count fonts
    const fontMatches = pdfContent.match(/\/Type\s*\/Font/g);
    diagnostics.fontCount = fontMatches ? fontMatches.length : 0;

    // Extract metadata
    const metadataPatterns = {
      title: /\/Title\s*\(([^)]+)\)/,
      author: /\/Author\s*\(([^)]+)\)/,
      subject: /\/Subject\s*\(([^)]+)\)/,
      creator: /\/Creator\s*\(([^)]+)\)/,
      producer: /\/Producer\s*\(([^)]+)\)/,
      creationDate: /\/CreationDate\s*\(([^)]+)\)/,
      modDate: /\/ModDate\s*\(([^)]+)\)/
    };

    for (const [key, pattern] of Object.entries(metadataPatterns)) {
      const match = pdfContent.match(pattern);
      if (match) {
        diagnostics.metadata[key] = match[1];
      }
    }

    // Get sample content (first 500 chars of readable content)
    const readableContent = pdfContent
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    diagnostics.sampleContent = readableContent.substring(0, 500);

  } catch (error) {
    console.error('Error in PDF diagnosis:', error);
  }

  return diagnostics;
}

function generateRecommendations(diagnostics: Record<string, any>): string[] {
  const recommendations: string[] = [];

  if (!diagnostics.isPdfValid) {
    recommendations.push("❌ File is not a valid PDF - check file format");
    return recommendations;
  }

  if (diagnostics.isEncrypted) {
    recommendations.push("🔒 PDF is encrypted/password protected - requires decryption first");
  }

  if (diagnostics.pageCount === 0) {
    recommendations.push("📄 No pages detected - PDF structure may be corrupted");
  }

  if (!diagnostics.hasTextStreams && diagnostics.textStreamCount === 0) {
    recommendations.push("📝 No text content detected - likely a scanned PDF requiring OCR");
    recommendations.push("💡 Recommend using OCR (Optical Character Recognition) to extract text");
  }

  if (diagnostics.hasImages && !diagnostics.hasTextStreams) {
    recommendations.push("🖼️ PDF contains only images - definitely needs OCR processing");
  }

  if (diagnostics.compressionMethods.length > 0) {
    recommendations.push(`🗜️ PDF uses compression: ${diagnostics.compressionMethods.join(', ')} - may require specialized decompression`);
  }

  if (diagnostics.fontCount === 0 && diagnostics.hasTextStreams) {
    recommendations.push("🔤 No fonts detected but text streams present - unusual PDF structure");
  }

  if (diagnostics.structureAnalysis.streamCount > 10 && diagnostics.textStreamCount === 0) {
    recommendations.push("📊 Many streams but no text operators - likely contains graphics/images only");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ PDF structure looks normal - text extraction should work with standard methods");
    recommendations.push("🔧 If extraction is still failing, try different PDF parsing libraries");
  }

  return recommendations;
} 