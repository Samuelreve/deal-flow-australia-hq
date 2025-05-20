
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ShareDocumentFormProps {
  onGenerateLink: () => void;
  loading: boolean;
  error: string | null;
  allowDownload: boolean;
  setAllowDownload: (value: boolean) => void;
  expiryDate: Date | null;
  setExpiryDate: (date: Date | null) => void;
}

const ShareDocumentForm: React.FC<ShareDocumentFormProps> = ({
  onGenerateLink,
  loading,
  error,
  allowDownload,
  setAllowDownload,
  expiryDate,
  setExpiryDate,
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
