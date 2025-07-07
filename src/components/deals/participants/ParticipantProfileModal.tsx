import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MessageCircle,
  X
} from "lucide-react";

interface ParticipantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: {
    user_id: string;
    role: string;
    joined_at: string;
    profile_name: string | null;
    profile_avatar_url: string | null;
    profiles?: {
      name?: string;
      avatar_url?: string;
      email?: string;
      phone?: string;
      company_name?: string;
    };
  };
  onMessageClick: () => void;
}

const ParticipantProfileModal: React.FC<ParticipantProfileModalProps> = ({
  isOpen,
  onClose,
  participant,
  onMessageClick
}) => {
  const displayName = participant.profile_name || participant.profiles?.name || 'Unknown User';
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'seller':
        return 'default';
      case 'buyer':
        return 'secondary';
      case 'lawyer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMessageClick = () => {
    onMessageClick();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Participant Profile</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={participant.profile_avatar_url || participant.profiles?.avatar_url} 
                alt={displayName} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <Badge variant={getRoleBadgeVariant(participant.role)} className="mt-1">
                {participant.role.charAt(0).toUpperCase() + participant.role.slice(1)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            
            <div className="space-y-3">
              {(participant.profiles?.email || participant.profile_name) && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {participant.profiles?.email || 'No email provided'}
                  </span>
                </div>
              )}

              {participant.profiles?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{participant.profiles.phone}</span>
                </div>
              )}

              {participant.profiles?.company_name && (
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{participant.profiles.company_name}</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {formatDate(participant.joined_at)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantProfileModal;