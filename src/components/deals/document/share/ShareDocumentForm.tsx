
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ShareDocumentFormProps {
  onGenerateLink: () => void;
  loading: boolean;
  error: string | null;
  allowDownload: boolean;
  setAllowDownload: (value: boolean) => void;
  expiryDate: Date | null;
  setExpiryDate: (date: Date | null) => void;
  recipients: string[];
  setRecipients: (recipients: string[]) => void;
  customMessage: string;
  setCustomMessage: (message: string) => void;
}

const ShareDocumentForm: React.FC<ShareDocumentFormProps> = ({
  onGenerateLink,
  loading,
  error,
  allowDownload,
  setAllowDownload,
  expiryDate,
  setExpiryDate,
  recipients,
  setRecipients,
  customMessage,
  setCustomMessage,
}) => {
  const [newRecipient, setNewRecipient] = useState('');
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = () => {
    const email = newRecipient.trim();
    
    // Skip if empty
    if (!email) return;
    
    // Validate email
    if (!validateEmail(email)) {
      setRecipientError('Please enter a valid email address');
      return;
    }
    
    // Check for duplicates
    if (recipients.includes(email)) {
      setRecipientError('This email has already been added');
      return;
    }
    
    // Add to list
    setRecipients([...recipients, email]);
    setNewRecipient('');
    setRecipientError(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRecipient();
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="allowDownload"
          checked={allowDownload}
          onCheckedChange={setAllowDownload}
        />
        <Label htmlFor="allowDownload">Allow recipients to download the document</Label>
      </div>

      <div className="space-y-1">
        <Label htmlFor="expiryDate">Link expiration (optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !expiryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiryDate ? format(expiryDate, "PPP") : "No expiration"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={expiryDate || undefined}
              onSelect={setExpiryDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1">
        <Label htmlFor="recipients">Share with (optional)</Label>
        <div className="flex">
          <Input
            id="recipients"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter email address"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addRecipient}
            className="ml-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {recipientError && <p className="text-sm text-red-500">{recipientError}</p>}
        
        {recipients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {recipients.map((email) => (
              <Badge key={email} variant="secondary" className="flex items-center gap-1">
                {email}
                <button 
                  type="button" 
                  onClick={() => removeRecipient(email)} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="customMessage">Add a message (optional)</Label>
        <Textarea
          id="customMessage"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Add a note for the recipients"
          className="resize-none"
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button 
        onClick={onGenerateLink} 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Share Link'}
      </Button>
    </>
  );
};

export default ShareDocumentForm;
