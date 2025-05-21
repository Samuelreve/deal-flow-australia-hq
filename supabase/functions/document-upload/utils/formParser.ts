
// Helper function to handle multipart form data parsing
export async function parseMultipartFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const category = formData.get('category') as string;
  const documentId = formData.get('documentId') as string;
  const documentName = formData.get('documentName') as string;
  const dealId = formData.get('dealId') as string;

  if (!file) {
    throw new Error('Missing file in form data');
  }

  const fileBuffer = new Uint8Array(await file.arrayBuffer());
  
  return {
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: fileBuffer
    },
    category,
    documentId: documentId || undefined,
    documentName: documentName || file.name,
    dealId
  };
}
