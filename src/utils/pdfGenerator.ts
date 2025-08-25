
import { DealCreationData } from '@/components/deals/deal-creation/types';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Generate and download a PDF summary of deal creation data
 */
export const generateDealSummaryPDF = (data: DealCreationData) => {
  const summaryContent = `
DEAL SUMMARY
============

Business Information:
- Legal Name: ${data.businessLegalName || 'Not specified'}
- Trading Name: ${data.businessTradingName || 'Not specified'}
- Industry: ${data.businessIndustry || 'Not specified'}
- Years in Operation: ${data.yearsInOperation || 'Not specified'}
- Legal Entity: ${data.legalEntityType || 'Not specified'}
- ABN: ${data.abn || 'Not specified'}
- ACN: ${data.acn || 'Not specified'}

Deal Information:
- Title: ${data.dealTitle || 'Not specified'}
- Description: ${data.dealDescription || 'Not specified'}
- Asking Price: ${data.askingPrice ? `$${data.askingPrice}` : 'Not specified'}
- Deal Type: ${data.dealType || 'Not specified'}
- Target Completion: ${data.targetCompletionDate || 'Not specified'}

Assets:
- Included: ${data.keyAssetsIncluded || 'Not specified'}
- Excluded: ${data.keyAssetsExcluded || 'Not specified'}

Seller Information:
- Primary Contact: ${data.primarySellerName || 'Not specified'}
- Reason for Selling: ${data.reasonForSelling || 'Not specified'}

Documents Uploaded: ${data.uploadedDocuments.length}
${data.uploadedDocuments.map(doc => `- ${doc.filename} (${doc.category})`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
  `.trim();

  generateTextFile(summaryContent, `deal-summary-${data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}`);
};

/**
 * Generate and download a PDF from text content
 */
export const generatePDF = (content: string, filename: string = 'document') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margins = 20;
  const maxLineWidth = pageWidth - (margins * 2);
  
  // Split content into lines and handle text wrapping
  const lines = content.split('\n');
  let yPosition = margins;
  const lineHeight = 7;
  
  doc.setFontSize(10);
  
  lines.forEach((line) => {
    if (yPosition > doc.internal.pageSize.getHeight() - margins) {
      doc.addPage();
      yPosition = margins;
    }
    
    if (line.trim() === '') {
      yPosition += lineHeight;
      return;
    }
    
    // Handle long lines by splitting them
    const wrappedLines = doc.splitTextToSize(line, maxLineWidth);
    wrappedLines.forEach((wrappedLine: string) => {
      if (yPosition > doc.internal.pageSize.getHeight() - margins) {
        doc.addPage();
        yPosition = margins;
      }
      doc.text(wrappedLine, margins, yPosition);
      yPosition += lineHeight;
    });
  });
  
  doc.save(`${filename}.pdf`);
};

/**
 * Generate and download a DOCX from text content
 */
export const generateDocx = async (content: string, filename: string = 'document') => {
  // Parse content into paragraphs and apply basic formatting
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];
  
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      paragraphs.push(new Paragraph({ text: '' }));
      return;
    }
    
    // Check if it's a heading (all caps or numbered section)
    const isHeading = /^[A-Z\s]+$/.test(trimmedLine) || /^\d+\.\s+[A-Z]/.test(trimmedLine);
    
    if (isHeading && trimmedLine.length < 100) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else {
      // Regular paragraph
      const textRuns: TextRun[] = [];
      
      // Handle bold terms (all caps terms like BUYER, SELLER)
      const parts = trimmedLine.split(/(\b[A-Z]{2,}\b)/);
      parts.forEach((part) => {
        if (/^[A-Z]{2,}$/.test(part)) {
          textRuns.push(new TextRun({ text: part, bold: true }));
        } else {
          textRuns.push(new TextRun({ text: part }));
        }
      });
      
      paragraphs.push(
        new Paragraph({
          children: textRuns,
        })
      );
    }
  });
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });
  
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download a text file
 */
export const generateTextFile = (content: string, filename: string = 'document') => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
