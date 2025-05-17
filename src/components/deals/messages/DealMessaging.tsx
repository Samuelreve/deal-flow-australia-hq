
import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import useMessages from '@/hooks/useMessages';

interface DealMessagingProps {
  dealId: string;
  isParticipant: boolean;
}

const DealMessaging: React.FC<DealMessagingProps> = ({ dealId, isParticipant }) => {
  const { messages, loading, sending, sendMessage } = useMessages(dealId);

  return (
    <div className="flex flex-col h-[600px] border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/20">
        <h3 className="text-lg font-medium">Deal Messages</h3>
      </div>
      <MessageList messages={messages} loading={loading} />
      <MessageInput 
        onSendMessage={sendMessage} 
        isLoading={sending}
        isParticipant={isParticipant} 
      />
    </div>
  );
};

export default DealMessaging;
