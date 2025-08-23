import { DealCreationData } from '@/components/deals/deal-creation/types';

/**
 * Escape special characters for PDF text objects.
 */
const escapePdfText = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/**
 * Concatenate multiple Uint8Arrays into a single array.
 */
const concatUint8Arrays = (arrays: Uint8Array[]): Uint8Array => {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

/**
 * Generate and download a PDF summary of deal creation data.
 */
export const generateDealSummaryPDF = (data: DealCreationData) => {
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
    `- Asking Price: ${
      data.askingPrice ? `$${data.askingPrice}` : 'Not specified'
    }`,
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
    ...data.uploadedDocuments.map(
      (doc) => `- ${doc.filename} (${doc.category})`
    ),
    '',
    `Generated on: ${new Date().toLocaleDateString()}`
  ];

  // Build the PDF content stream with basic text positioning.
  let contentStream = 'BT\n/F1 12 Tf\n72 720 Td\n';
  lines.forEach((line, idx) => {
    contentStream += `(${escapePdfText(line)}) Tj`;
    if (idx !== lines.length - 1) {
      contentStream += '\nT*\n';
    }
  });
  contentStream += '\nET';

  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(contentStream);

  // Create PDF objects and encode them to byte arrays.
  const objects: Uint8Array[] = [];
  const encode = (s: string) => encoder.encode(s);

  objects.push(
    encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  );
  objects.push(
    encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  );
  objects.push(
    encode(
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
    )
  );
  objects.push(
    encode(
      `4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
    )
  );
  objects.push(
    encode(
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
    )
  );

  const header = encode('%PDF-1.4\n');

  // Build body and cross-reference table using byte lengths.
  let offset = header.length;
  const bodyParts: Uint8Array[] = [];
  const xrefEntries: string[] = ['0000000000 65535 f \n'];
  objects.forEach((obj, index) => {
    bodyParts.push(obj);
    xrefEntries.push(`${offset.toString().padStart(10, '0')} 00000 n \n`);
    offset += obj.length;
  });

  const startXref = offset;
  const xref = encode(`xref\n0 ${objects.length + 1}\n${xrefEntries.join('')}`);
  const trailer = encode(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`
  );

  const pdfBytes = concatUint8Arrays([header, ...bodyParts, xref, trailer]);

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deal-summary-${
    data.dealTitle?.replace(/\s+/g, '-').toLowerCase() || 'untitled'
  }.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

