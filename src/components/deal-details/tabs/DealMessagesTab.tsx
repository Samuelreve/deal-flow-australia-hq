import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePrivateMessages } from "@/hooks/usePrivateMessages";
import { useDealParticipants } from "@/hooks/useDealParticipants";
import { useUnreadMessageCounts } from "@/hooks/useUnreadMessageCounts";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactsList from "./components/ContactsList";
import MessageItem from "@/components/deals/messages/MessageItem";

interface DealMessagesTabProps {
  dealId: string;
  selectedParticipantId?: string;
}

const DealMessagesTab: React.FC<DealMessagesTabProps> = ({ dealId, selectedParticipantId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>(undefined);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { participants, loadingParticipants, fetchParticipants } = useDealParticipants({ id: dealId } as any);
  const { messages, loading, sending, sendMessage: sendMessageHook } = usePrivateMessages(dealId, selectedContactId);
  const { unreadCounts, markAsRead } = useUnreadMessageCounts(dealId);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedParticipantId && selectedContactId === undefined) {
      setSelectedContactId(selectedParticipantId);
      if (isMobile) setShowChat(true);
    }
  }, [selectedParticipantId]);

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead(selectedContactId);
    }
  }, [messages, selectedContactId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessageHook(newMessage);
      setNewMessage('');
    } catch (error) {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContactSelect = (contactId: string | undefined) => {
    setSelectedContactId(contactId);
    if (isMobile) setShowChat(true);
  };

  const handleDealChatSelect = () => {
    setSelectedContactId(undefined);
    if (isMobile) setShowChat(true);
  };

  const handleBackToContacts = () => {
    setShowChat(false);
  };

  const getHeaderTitle = () => {
    if (!selectedContactId) return "Deal Chat";
    const selectedParticipant = participants.find(p => p.user_id === selectedContactId);
    return selectedParticipant?.profiles?.name || selectedParticipant?.profile_name || 'Unknown User';
  };

  const getHeaderSubtitle = () => {
    if (!selectedContactId) return `${participants.length} participants`;
    const selectedParticipant = participants.find(p => p.user_id === selectedContactId);
    return selectedParticipant?.role || '';
  };

  const getHeaderIcon = () => {
    if (!selectedContactId) return <Users className="h-5 w-5" />;
    return <MessageSquare className="h-5 w-5" />;
  };

  if (loadingParticipants) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mobile layout: show contacts OR chat, not both
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-220px)] flex flex-col border rounded-lg overflow-hidden">
        {!showChat ? (
          // Mobile contacts view
          <ContactsList
            participants={participants}
            currentUserId={user?.id}
            selectedContactId={selectedContactId}
            onContactSelect={handleContactSelect}
            onDealChatSelect={handleDealChatSelect}
            unreadCounts={unreadCounts}
          />
        ) : (
          // Mobile chat view
          <>
            {/* Chat Header with back button */}
            <div className={`p-3 border-b flex items-center gap-3 ${
              selectedContactId 
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
                : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
            }`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={handleBackToContacts}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getHeaderIcon()}
                <div className="min-w-0">
                  <h3 className={`font-semibold text-sm truncate ${
                    selectedContactId ? 'text-blue-800 dark:text-blue-200' : 'text-green-800 dark:text-green-200'
                  }`}>
                    {getHeaderTitle()}
                  </h3>
                  <p className={`text-xs truncate ${
                    selectedContactId ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {getHeaderSubtitle()}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-1">No messages yet</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedContactId ? "Start a private conversation" : "Start the conversation"}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageItem 
                      key={message.id} 
                      message={{
                        ...message,
                        profiles: message.profiles || { name: 'Unknown', avatar_url: null }
                      }}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className={`p-3 border-t ${
              selectedContactId 
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedContactId ? "Private message..." : "Message team..."}
                  className="flex-1 text-sm"
                  disabled={sending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop layout: side-by-side
  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <ContactsList
          participants={participants}
          currentUserId={user?.id}
          selectedContactId={selectedContactId}
          onContactSelect={handleContactSelect}
          onDealChatSelect={handleDealChatSelect}
          unreadCounts={unreadCounts}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className={`p-4 border-b ${
          selectedContactId 
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {getHeaderIcon()}
            <h3 className={`font-semibold text-lg ${
              selectedContactId ? 'text-blue-800 dark:text-blue-200' : 'text-green-800 dark:text-green-200'
            }`}>
              {selectedContactId ? `Chat with ${getHeaderTitle()}` : getHeaderTitle()}
            </h3>
            {!selectedContactId && (
              <span className="text-sm text-green-600 dark:text-green-400">
                • {participants.length} participants
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                {selectedContactId ? "Start a private conversation" : "Start the conversation with your deal team"}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageItem 
                  key={message.id} 
                  message={{
                    ...message,
                    profiles: message.profiles || { name: 'Unknown', avatar_url: null }
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className={`p-4 border-t ${
          selectedContactId 
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedContactId ? "Type a private message..." : "Type a message to the team..."}
              className="flex-1"
              disabled={sending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealMessagesTab;
