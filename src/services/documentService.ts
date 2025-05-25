
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/deal';

export class DocumentService {
  async uploadDocument(
    file: File,
    category: string,
    dealId: string,
    userId: string,
    documentId?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('dealId', dealId);
    
    if (documentId) {
      formData.append('documentId', documentId);
    } else {
      formData.append('documentName', file.name);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/document-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.document;
  }

  async getDocuments(dealId: string): Promise<Document[]> {
    // For now, return mock data since we don't have the full backend implementation
    return [
      {
        id: '1',
        name: 'Purchase Agreement.pdf',
        category: 'contract',
        uploadedBy: 'user1',
        createdAt: new Date(),
        type: 'application/pdf',
        latestVersionId: 'v1',
        latestVersion: {
          id: 'v1',
          versionNumber: 1,
          uploadedAt: new Date(),
          size: 245760,
          type: 'application/pdf',
          url: '#'
        }
      }
    ];
  }

  async deleteDocument(documentId: string): Promise<void> {
    // Mock implementation
    console.log('Deleting document:', documentId);
    // In a real implementation, this would call the backend API
    throw new Error('Document deletion not implemented yet');
  }

  async deleteDocumentVersion(versionId: string): Promise<void> {
    // Mock implementation
    console.log('Deleting document version:', versionId);
    // In a real implementation, this would call the backend API
    throw new Error('Document version deletion not implemented yet');
  }

  async getDocumentVersions(documentId: string): Promise<any[]> {
    // Mock implementation
    console.log('Getting document versions for:', documentId);
    // In a real implementation, this would call the backend API
    return [
      {
        id: 'v1',
        versionNumber: 1,
        uploadedAt: new Date(),
        size: 245760,
        type: 'application/pdf',
        url: '#'
      }
    ];
  }

  async getDocumentAccessControl(dealId: string, userId: string) {
    return {
      canUpload: true,
      canDelete: true,
      canAddVersions: true,
      userRole: 'admin'
    };
  }
}

export const documentService = new DocumentService();
