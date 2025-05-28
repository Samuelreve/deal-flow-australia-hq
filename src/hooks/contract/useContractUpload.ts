
import { useCallback, useState } from 'react';
import { DocumentMetadata } from '@/types/contract';
import { toast } from 'sonner';

// Mock contract text for demo purposes
const sampleContractText = `
MASTER SERVICE AGREEMENT

This Master Service Agreement ("Agreement") is entered into on [Date] between:

Company A ("Provider")
- Address: 123 Business St, City, State 12345
- Contact: contracts@companya.com

Company B ("Client") 
- Address: 456 Corporate Ave, City, State 67890
- Contact: legal@companyb.com

1. SCOPE OF SERVICES
The Provider agrees to deliver professional consulting services as outlined in individual Statements of Work ("SOW") that reference this Agreement.

2. PAYMENT TERMS
- Invoices due within 30 days of receipt
- Late payment penalty: 1.5% per month
- Payment method: Wire transfer or ACH

3. INTELLECTUAL PROPERTY
All work product created under this Agreement shall be owned by the Client upon full payment.

4. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality of all proprietary information shared during the engagement.

5. TERM AND TERMINATION
This Agreement is effective for 2 years from the execution date and may be terminated by either party with 30 days written notice.

6. LIABILITY AND WARRANTIES
Provider's liability shall not exceed the total amount paid under this Agreement. Services are provided "as-is" without warranties.

7. GOVERNING LAW
This Agreement shall be governed by the laws of [State].

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.

Provider: _________________ Date: _________
Client: _________________ Date: _________
`;

export const useContractUpload = (
  setDocuments: (docs: DocumentMetadata[]) => void,
  setSelectedDocument: (doc: DocumentMetadata | null) => void,
  setContractText: (text: string) => void
) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File upload started:', file.name);
    setUploading(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create document metadata
      const newDocument: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/pdf',
        uploadDate: new Date().toISOString(),
        status: 'completed',
        version: '1.0',
        versionDate: new Date().toISOString(),
        size: file.size,
        category: 'contract'
      };

      console.log('Document created:', newDocument);

      // Update state with new document
      setDocuments([newDocument]);
      setSelectedDocument(newDocument);
      setContractText(sampleContractText);

      toast.success('Contract uploaded successfully!', {
        description: `${file.name} has been uploaded and is ready for AI analysis.`
      });

      console.log('Contract upload completed successfully');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: 'There was an error uploading your contract. Please try again.'
      });
    } finally {
      setUploading(false);
      
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  }, [setDocuments, setSelectedDocument, setContractText]);

  return {
    uploading,
    handleFileUpload
  };
};
