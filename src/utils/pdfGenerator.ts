
import { DealCreationData } from '@/components/deals/deal-creation/types';
import { sanitizeFilename } from '@/utils/fileUtils';

/**
 * Generate and download a PDF summary of deal creation data
 */
export const generateDealSummaryPDF = (data: DealCreationData) => {
  // Create a simple text-based summary for now
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

  // Create and download the file
  const blob = new Blob([summaryContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(
    `deal-summary-${
      data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'untitled'
    }.txt`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
