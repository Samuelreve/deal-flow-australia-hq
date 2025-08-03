
import { DealCreationData } from '@/components/deals/deal-creation/types';

/**
 * Generate and download a PDF summary of deal creation data
 */
export const generateDealSummaryPDF = (data: DealCreationData) => {
  const encoder = new TextEncoder();
  const lines = [
    'DEAL SUMMARY',
    '============',
    '',
    'Business Information:',
    `- Legal Name: ${data.businessLegalName || 'Not specified'}`,
    `- Trading Name: ${data.businessTradingName || 'Not specified'}`,
    `- Industry: ${data.businessIndustry || 'Not specified'}`,
    `- Years in Operation: ${data.yearsInOperation || 'Not specified'}`,
    `- Legal Entity: ${data.legalEntityType || 'Not specified'}`,
    `- ABN: ${data.abn || 'Not specified'}`,
    `- ACN: ${data.acn || 'Not specified'}`,
    '',
    'Deal Information:',
    `- Title: ${data.dealTitle || 'Not specified'}`,
    `- Description: ${data.dealDescription || 'Not specified'}`,
    `- Asking Price: ${data.askingPrice ? `$${data.askingPrice}` : 'Not specified'}`,
    `- Deal Type: ${data.dealType || 'Not specified'}`,
    `- Target Completion: ${data.targetCompletionDate || 'Not specified'}`,
    '',
    'Assets:',
    `- Included: ${data.keyAssetsIncluded || 'Not specified'}`,
    `- Excluded: ${data.keyAssetsExcluded || 'Not specified'}`,
    '',
    'Seller Information:',
    `- Primary Contact: ${data.primarySellerName || 'Not specified'}`,
    `- Reason for Selling: ${data.reasonForSelling || 'Not specified'}`,
    '',
    `Documents Uploaded: ${data.uploadedDocuments.length}`,
    ...data.uploadedDocuments.map(doc => `- ${doc.filename} (${doc.category})`),
    '',
    `Generated on: ${new Date().toLocaleDateString()}`
  ];

  const escape = (text: string) =>
    text
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const pdfLines = lines
    .map((line, index) => (index === 0 ? `(${escape(line)}) Tj` : `T* (${escape(line)}) Tj`))
    .join('\n');

  const contentStream = `BT\n/F1 12 Tf\n72 720 Td\n${pdfLines}\nET`;
  const contentLength = encoder.encode(contentStream).length;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];

  let offset = encoder.encode('%PDF-1.1\n').length;
  const xref: string[] = ['0000000000 65535 f \n'];
  let body = '';
  for (const obj of objects) {
    xref.push(String(offset).padStart(10, '0') + ' 00000 n \n');
    body += obj;
    offset += encoder.encode(obj).length;
  }

  const xrefStart = offset;
  const xrefTable =
    `xref\n0 ${objects.length + 1}\n` +
    xref.join('') +
    `trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefStart}\n%%EOF`;

  const pdf = `%PDF-1.1\n${body}${xrefTable}`;

  const blob = new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitize = (name: string) =>
    name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
  link.download = `deal-summary-${
    data.dealTitle ? sanitize(data.dealTitle.toLowerCase()) : 'untitled'
  }.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
