
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ExpiryDateSelector from './ExpiryDateSelector';
import RecipientInput from './RecipientInput';

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

      <ExpiryDateSelector 
        expiryDate={expiryDate} 
        setExpiryDate={setExpiryDate} 
      />

      <RecipientInput 
        recipients={recipients} 
        setRecipients={setRecipients} 
      />

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
