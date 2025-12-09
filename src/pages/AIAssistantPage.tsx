import React from 'react';
import { Card } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AIAssistantHeader from '@/components/ai/AIAssistantHeader';
import EnhancedAIAssistantMessages from '@/components/ai/EnhancedAIAssistantMessages';
import EnhancedAIAssistantInput from '@/components/ai/EnhancedAIAssistantInput';
import { useDocumentUpload } from '@/hooks/ai/useDocumentUpload';
import { useEnhancedAIConversation } from '@/hooks/ai/useEnhancedAIConversation';
import { useAuth } from '@/contexts/AuthContext';

const AIAssistantPage = () => {
  const { isAuthenticated } = useAuth();
  const { uploadedDocument, handleFileUpload, removeDocument } = useDocumentUpload();
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    isLoading,
    isStreaming,
    handleSendMessage, 
    handleFeedback,
    cancelStream,
    clearHistory
  } = useEnhancedAIConversation(uploadedDocument?.content);

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-background dark:to-muted">
      {/* Header */}
      <AIAssistantHeader
        onFileUpload={handleFileUpload}
        uploadedDocument={uploadedDocument}
        onRemoveDocument={removeDocument}
      />

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-280px)]">
        <Card className="h-full flex flex-col shadow-lg overflow-hidden">
          {/* Messages Area */}
          <EnhancedAIAssistantMessages
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onFeedback={handleFeedback}
            onCancelStream={cancelStream}
            onClearHistory={clearHistory}
          />

          {/* Input Area */}
          <EnhancedAIAssistantInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onCancelStream={cancelStream}
            isLoading={isLoading}
            isStreaming={isStreaming}
            uploadedDocument={uploadedDocument}
          />
        </Card>
      </div>
    </div>
  );

  // Use sidebar layout for authenticated users, top navbar for guests
  if (isAuthenticated) {
    return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
  }

  return <AppLayout>{content}</AppLayout>;
};

export default AIAssistantPage;
