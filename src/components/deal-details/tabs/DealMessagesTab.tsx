import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePrivateMessages } from "@/hooks/usePrivateMessages";
import { useDealParticipants } from "@/hooks/useDealParticipants";
import { useUnreadMessageCounts } from "@/hooks/useUnreadMessageCounts";
import ContactsList from "./components/ContactsList";
import MessageItem from "@/components/deals/messages/MessageItem";

interface DealMessagesTabProps {
  dealId: string;
  selectedParticipantId?: string;
}

const DealMessagesTab: React.FC<DealMessagesTabProps> = ({ dealId, selectedParticipantId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get deal participants for contact list
  const { participants, loadingParticipants, fetchParticipants } = useDealParticipants({ id: dealId } as any);
  
  // Use private messages hook with selected contact
  const { messages, loading, sending, sendMessage: sendMessageHook } = usePrivateMessages(dealId, selectedContactId);
  
  // Use unread counts hook
  const { unreadCounts, markAsRead } = useUnreadMessageCounts(dealId);

  // Fetch participants when component mounts
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select participant when coming from participant tab (only on initial load)
  useEffect(() => {
    if (selectedParticipantId && selectedContactId === undefined) {
      setSelectedContactId(selectedParticipantId);
    }
  }, [selectedParticipantId]); // Remove selectedContactId from dependencies to prevent re-triggering

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (messages.length > 0) {
      console.log('🔔 Marking messages as read for:', selectedContactId || 'deal chat');
      markAsRead(selectedContactId);
    }
  }, [messages, selectedContactId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessageHook(newMessage);
      setNewMessage('');
    } catch (error) {
      // Error handling is already done in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-AU', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleContactSelect = (contactId: string | undefined) => {
    setSelectedContactId(contactId);
  };

  const handleDealChatSelect = () => {
    setSelectedContactId(undefined);
  };

  const getHeaderTitle = () => {
    if (!selectedContactId) {
      return "Deal Chat";
    }
    const selectedParticipant = participants.find(p => p.user_id === selectedContactId);
    const displayName = selectedParticipant?.profiles?.name || selectedParticipant?.profile_name || 'Unknown User';
    return `Chat with ${displayName}`;
  };

  const getHeaderIcon = () => {
    if (!selectedContactId) {
      return <Users className="h-5 w-5" />;
    }
    return <MessageSquare className="h-5 w-5" />;
  };

  if (loadingParticipants) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Contacts List */}
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

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4 border-b ${
          selectedContactId 
            ? 'bg-blue-50 border-blue-200' // Private chat styling
            : 'bg-green-50 border-green-200' // Deal chat styling
        }`}>
          <div className="flex items-center gap-2">
            {getHeaderIcon()}
            <h3 className={`font-semibold text-lg ${
              selectedContactId ? 'text-blue-800' : 'text-green-800'
            }`}>
              {getHeaderTitle()}
            </h3>
            {!selectedContactId && (
              <span className="text-sm text-green-600">
                • {participants.length} participants
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
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
                {selectedContactId 
                  ? "Start a private conversation" 
                  : "Start the conversation with your deal team"
                }
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
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${
          selectedContactId 
            ? 'bg-blue-50 border-blue-200' // Private chat styling
            : 'bg-green-50 border-green-200' // Deal chat styling
        }`}>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedContactId 
                  ? "Type a private message..." 
                  : "Type a message to the team..."
              }
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