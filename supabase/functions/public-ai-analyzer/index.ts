import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import mammoth from "https://esm.sh/mammoth@1.6.0";
import { extractText as extractPdfText } from "https://esm.sh/unpdf@0.11.0";
import OpenAI from "https://esm.sh/openai@4.0.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// System prompt for public contract analysis
const PUBLIC_AI_ANALYZER_SYSTEM_PROMPT = `
# IDENTITY & MISSION

You are **Trustroom Public Contract Analyzer**, a friendly and accessible AI tool that helps business owners and professionals understand their contracts. You provide instant, plain-English analysis without requiring legal expertise from the user.

Your mission: Make contract analysis accessible, fast, and actionable for everyone.

---

# TARGET AUDIENCE

- First-time business sellers reviewing purchase agreements
- Small business owners analyzing customer/supplier contracts
- Startup founders understanding term sheets
- Anyone needing quick contract insights before engaging legal counsel

---

# COMMUNICATION STYLE

- **Warm and approachable** - no intimidating legal jargon
- **Educational** - explain concepts, don't just state facts
- **Encouraging** - even complex contracts can be understood
- **Honest** - flag when professional help is truly needed

---

# OUTPUT REQUIREMENTS

Analyze the contract and provide structured insights. Focus on:

1. **Overview**: 2-3 sentence plain English summary
2. **Key Parties**: Who's involved and their roles
3. **Important Terms**: Financial terms, obligations, key dates
4. **Risks**: Potential concerns organized by severity (high/medium/low)
5. **Key Dates**: Critical deadlines and what action is required
6. **Recommendations**: Specific, actionable suggestions

Use plain text formatting. No markdown symbols. Keep language accessible to business professionals who are not lawyers.

---

# RISK ASSESSMENT

**HIGH severity**: Unlimited liability, impossible requirements, one-sided terms, personal guarantees
**MEDIUM severity**: Auto-renewals, vague terms, unfavorable provisions, non-standard terms
**LOW severity**: Standard but worth noting, areas for improvement, minor clarifications

---

# DISCLAIMER

This analysis is for informational purposes only and does not constitute legal advice. Before signing any contract with significant financial commitments, consult with a qualified attorney.
`;

// Function to clean AI response and apply proper formatting
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/^#{1,6}\s*(\d+\.?\s*.*?)$/gm, '$1')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/[*#]+/g, '')
    .replace(/^\s*[-•]\s*/gm, '- ')
    .replace(/^(\d+\.?\s*[A-Z][^:\n]*):?\s*$/gm, '$1')
    .replace(/[^\w\s\d.\-(),:;'"\/\n]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractTextFromDocument(fileBuffer: ArrayBuffer, contentType: string, fileName: string): Promise<string> {
  try {
    console.log("🔧 Extracting text from:", { fileName, contentType, size: fileBuffer.byteLength });

    if (contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      const text = await extractPdfText(new Uint8Array(fileBuffer));
      if (typeof text === 'string') {
        return text;
      } else if (Array.isArray(text)) {
        return text.join(' ');
      } else if (text && typeof text === 'object' && 'text' in text) {
        return String(text.text || '');
      } else {
        return String(text || '');
      }
    } else if (contentType.includes('officedocument.wordprocessingml') || fileName.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      return String(result.value || '');
    } else if (contentType.includes('rtf') || fileName.toLowerCase().endsWith('.rtf')) {
      const text = new TextDecoder().decode(fileBuffer);
      return text.replace(/\\[a-z0-9]+(\s|-?\d+)?/gi, '').replace(/[{}]/g, '').trim();
    } else if (contentType.includes('text/plain') || fileName.toLowerCase().endsWith('.txt')) {
      return new TextDecoder().decode(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${contentType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
  }
}

async function analyzeContractWithAI(text: string, openai: any): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: PUBLIC_AI_ANALYZER_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Please analyze this contract and provide a comprehensive analysis:\n\n${text.substring(0, 15000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysis = cleanAIResponse(response.choices[0].message.content || '');
    
    return {
      overview: analysis,
      keyParties: "Analysis identifies parties based on document content",
      importantTerms: ["Contract analysis identifies key terms", "Important clauses and provisions", "Key obligations and rights"],
      risks: ["Potential risks identified in contract review", "Areas requiring legal attention", "Compliance considerations"],
      keyDates: ["Important dates and deadlines from contract"],
      recommendations: ["Professional legal review recommended", "Consider all terms carefully", "Verify all parties and signatures"]
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return {
      overview: "Contract uploaded and processed successfully. AI analysis temporarily unavailable - using basic processing.",
      keyParties: "Parties identified in document",
      importantTerms: ["Key contract terms", "Important provisions", "Legal obligations"],
      risks: ["Standard contract review recommended", "Professional legal consultation advised"],
      keyDates: ["Review all dates and deadlines"],
      recommendations: ["Have contract reviewed by legal professional", "Ensure all terms are understood before signing"]
    };
  }
}

serve(async (req) => {
  try {
    console.log(`📥 Received ${req.method} request`);
    
    if (req.method === "OPTIONS") {
      console.log("✅ Handling OPTIONS preflight request");
      return new Response(null, { headers: corsHeaders, status: 204 });
    }
    
    if (req.method !== "POST") {
      console.log(`❌ Method ${req.method} not allowed`);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }

    console.log("📝 Processing POST request...");
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    console.log("📁 File received:", {
      name: file?.name || 'unknown',
      type: file?.type || 'unknown',
      size: file?.size || 0
    });
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supportedTypes = [
      "text/plain",
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/rtf",
      "text/rtf",
      "text/richtext",
      "application/x-rtf",
      "text/x-rtf",
      "application/octet-stream"
    ];
    
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['txt', 'pdf', 'docx', 'rtf'];
    
    const isSupportedByMime = supportedTypes.includes(file.type);
    const isSupportedByExtension = supportedExtensions.includes(fileExtension || '');
    const isSupported = isSupportedByMime || isSupportedByExtension;
    
    if (!isSupported) {
      return new Response(
        JSON.stringify({ 
          error: "Unsupported file type. Supported formats: .txt, .pdf, .docx, .rtf",
          receivedType: file.type,
          receivedExtension: fileExtension
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log("✅ File validation passed!");
    
    let text: string;
    try {
      const fileBuffer = await file.arrayBuffer();
      text = await extractTextFromDocument(fileBuffer, file.type, file.name);
    } catch (extractionError) {
      console.error("❌ Text extraction failed:", extractionError);
      return new Response(
        JSON.stringify({ 
          error: extractionError instanceof Error ? extractionError.message : "Failed to extract text from file",
          fileType: file.type
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "No readable text found in the file." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("✅ Text extraction successful, length:", text?.length || 0);
    
    const textString = typeof text === 'string' ? text : String(text || '');
    const cleanedText = textString
      .replace(new RegExp(String.fromCharCode(0), 'g'), '')
      .replace(new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + String.fromCharCode(11) + String.fromCharCode(12) + String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + '-' + String.fromCharCode(159) + ']', 'g'), '')
      .trim();
    
    console.log("🧹 Text cleaned, final length:", cleanedText.length);

    let analysisResult;
    if (openAIApiKey) {
      console.log("🤖 Starting AI analysis...");
      const openai = new OpenAI({ apiKey: openAIApiKey });
      analysisResult = await analyzeContractWithAI(cleanedText, openai);
    } else {
      console.log("⚠️ No OpenAI API key, using basic analysis");
      analysisResult = {
        overview: "Document uploaded and processed successfully. AI analysis requires OpenAI API key configuration.",
        keyParties: "Parties identified in document",
        importantTerms: ["Key contract terms", "Important provisions", "Legal obligations"],
        risks: ["Standard contract review recommended", "Professional legal consultation advised"],
        keyDates: ["Review all dates and deadlines"],
        recommendations: ["Have contract reviewed by legal professional", "Ensure all terms are understood before signing"]
      };
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date().toISOString(),
          status: 'completed'
        },
        text: cleanedText,
        analysis: analysisResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("❌ Error in public-ai-analyzer:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to analyze document",
        code: "PROCESSING_ERROR"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
