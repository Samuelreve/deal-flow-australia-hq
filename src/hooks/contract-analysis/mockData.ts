
import { DocumentMetadata, SummaryData } from './types';

// Mock document metadata for demonstration
export const mockDocumentMetadata: DocumentMetadata = {
  name: 'Sample Contract.pdf',
  type: 'PDF Document',
  uploadDate: new Date().toLocaleDateString(),
  status: 'Analyzed',
  version: '1.0',
  versionDate: new Date().toLocaleDateString(),
};

// Mock summary data for demonstration
export const mockSummaryData: SummaryData = {
  summary: [
    {
      title: 'Contract Overview',
      content: 'This is a non-disclosure agreement (NDA) between Company A and Company B, effective as of the date of signing.'
    },
    {
      title: 'Key Parties',
      content: 'Company A (Disclosing Party) and Company B (Receiving Party)'
    },
    {
      title: 'Term and Duration',
      content: 'The agreement is effective for 3 years from the date of signing, with automatic renewal unless terminated.'
    },
    {
      title: 'Confidentiality Obligations',
      content: 'The receiving party must protect the confidential information with the same degree of care as their own confidential information.'
    },
    {
      title: 'Termination Provisions',
      content: 'Either party may terminate this agreement with 30 days written notice.'
    }
  ],
  disclaimer: 'This AI-generated summary is for informational purposes only and should not be considered legal advice. Always consult a qualified legal professional before making decisions based on this information.'
};

// Sample contract text for demonstration
export const sampleContractText = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into between:

Company A, with its principal place of business at 123 Business Ave, City, State ("Disclosing Party")

and

Company B, with its principal place of business at 456 Corporate Blvd, Town, State ("Receiving Party")

WHEREAS, the Disclosing Party possesses certain ideas and information relating to [business purpose] that is confidential and proprietary to the Disclosing Party (hereinafter referred to as "Confidential Information"); and

WHEREAS, the Receiving Party is willing to receive disclosure of the Confidential Information for the purpose of [stated purpose] (the "Purpose").

NOW THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. Definition of Confidential Information
   For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged.

2. Obligations of Receiving Party
   The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.

3. Term
   This Agreement shall remain in effect for a period of 3 years from the date of signing.

4. Termination
   This Agreement may be terminated by either party with thirty (30) days written notice to the other party.

5. Governing Law
   This Agreement shall be governed by the laws of the State of [State].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Company A
By: ____________________
Name: _________________
Title: __________________

Company B
By: ____________________
Name: _________________
Title: __________________`;
