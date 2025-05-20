
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface RecipientInputProps {
  recipients: string[];
  setRecipients: (recipients: string[]) => void;
}

const RecipientInput: React.FC<RecipientInputProps> = ({ 
  recipients, 
  setRecipients 
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
  );
};

export default RecipientInput;
