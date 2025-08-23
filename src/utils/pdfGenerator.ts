import { DealCreationData } from '@/components/deals/deal-creation/types';

// Helper to escape text before inserting into the PDF
const escape = (value: unknown): string =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

/**
 * Generate and download a PDF summary of deal creation data
 */
export const generateDealSummaryPDF = (data: DealCreationData) => {
  // Create a simple text-based summary for now
  const summaryContent = `
DEAL SUMMARY
============

Business Information:
- Legal Name: ${escape(data.businessLegalName || 'Not specified')}
- Trading Name: ${escape(data.businessTradingName || 'Not specified')}
- Industry: ${escape(data.businessIndustry || 'Not specified')}
- Years in Operation: ${escape(data.yearsInOperation || 'Not specified')}
- Legal Entity: ${escape(data.legalEntityType || 'Not specified')}
- ABN: ${escape(data.abn || 'Not specified')}
- ACN: ${escape(data.acn || 'Not specified')}

Deal Information:
- Title: ${escape(data.dealTitle || 'Not specified')}
- Description: ${escape(data.dealDescription || 'Not specified')}
- Asking Price: ${escape(data.askingPrice ? `$${data.askingPrice}` : 'Not specified')}
- Deal Type: ${escape(data.dealType || 'Not specified')}
- Target Completion: ${escape(data.targetCompletionDate || 'Not specified')}

Assets:
- Included: ${escape(data.keyAssetsIncluded || 'Not specified')}
- Excluded: ${escape(data.keyAssetsExcluded || 'Not specified')}

Seller Information:
- Primary Contact: ${escape(data.primarySellerName || 'Not specified')}
- Reason for Selling: ${escape(data.reasonForSelling || 'Not specified')}

Documents Uploaded: ${escape(data.uploadedDocuments.length)}
${data.uploadedDocuments
  .map(doc => `- ${escape(doc.filename)} (${escape(doc.category)})`)
  .join('\\n')}

Generated on: ${escape(new Date().toLocaleDateString())}
  `.trim();

  // Create and download the file
  const blob = new Blob([summaryContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deal-summary-${escape(data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'untitled')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
