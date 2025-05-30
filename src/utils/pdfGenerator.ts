
import { DealCreationData } from '@/components/deals/deal-creation/types';

/**
 * Generate a PDF summary of the deal information
 */
export const generateDealSummaryPDF = (data: DealCreationData): void => {
  // Create HTML content for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deal Summary - ${data.dealTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-left: 4px solid #007bff; padding-left: 10px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; display: inline-block; width: 200px; }
        .field-value { display: inline-block; }
        .documents-list { margin-top: 10px; }
        .document-item { margin-bottom: 5px; padding: 5px; background-color: #f8f9fa; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Deal Summary</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Deal Information</div>
        <div class="field">
          <span class="field-label">Title:</span>
          <span class="field-value">${data.dealTitle || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Description:</span>
          <span class="field-value">${data.dealDescription || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Deal Type:</span>
          <span class="field-value">${data.dealType || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Asking Price:</span>
          <span class="field-value">${data.askingPrice ? `$${data.askingPrice}` : 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Target Completion:</span>
          <span class="field-value">${data.targetCompletionDate || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Business Information</div>
        <div class="field">
          <span class="field-label">Legal Name:</span>
          <span class="field-value">${data.businessLegalName || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Trading Name:</span>
          <span class="field-value">${data.businessTradingName || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Industry:</span>
          <span class="field-value">${data.businessIndustry || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Legal Entity Type:</span>
          <span class="field-value">${data.legalEntityType || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">ABN:</span>
          <span class="field-value">${data.abn || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Years in Operation:</span>
          <span class="field-value">${data.yearsInOperation || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Registered Address:</span>
          <span class="field-value">${data.registeredAddress || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Principal Address:</span>
          <span class="field-value">${data.principalAddress || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Seller Information</div>
        <div class="field">
          <span class="field-label">Primary Contact:</span>
          <span class="field-value">${data.primarySellerName || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Reason for Selling:</span>
          <span class="field-value">${data.reasonForSelling || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Assets</div>
        <div class="field">
          <span class="field-label">Assets Included:</span>
          <span class="field-value">${data.keyAssetsIncluded || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Assets Excluded:</span>
          <span class="field-value">${data.keyAssetsExcluded || 'N/A'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Documents (${data.uploadedDocuments.length})</div>
        <div class="documents-list">
          ${data.uploadedDocuments.map(doc => `
            <div class="document-item">
              <strong>${doc.filename}</strong> - ${doc.category} (${(doc.size / 1024).toFixed(1)} KB)
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    // Fallback: create downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-summary-${data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
