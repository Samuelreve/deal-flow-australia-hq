
import React from 'react';
import { Card } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import AIAssistantHeader from '@/components/ai/AIAssistantHeader';
import AIAssistantMessages from '@/components/ai/AIAssistantMessages';
import AIAssistantInput from '@/components/ai/AIAssistantInput';
import { useDocumentUpload } from '@/hooks/ai/useDocumentUpload';
import { useAIConversation } from '@/hooks/ai/useAIConversation';

const AIAssistantPage = () => {
  const { uploadedDocument, handleFileUpload, removeDocument } = useDocumentUpload();
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    isLoading, 
    handleSendMessage, 
    handleFeedback 
  } = useAIConversation(uploadedDocument?.content);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <AIAssistantHeader
          onFileUpload={handleFileUpload}
          uploadedDocument={uploadedDocument}
          onRemoveDocument={removeDocument}
        />

        {/* Chat Container */}
        <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-280px)]">
          <Card className="h-full flex flex-col shadow-lg">
            {/* Messages Area */}
            <AIAssistantMessages
              messages={messages}
              isLoading={isLoading}
              onFeedback={handleFeedback}
            />

            {/* Input Area */}
            <AIAssistantInput
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              uploadedDocument={uploadedDocument}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistantPage;
