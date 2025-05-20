
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpiryDateSelectorProps {
  expiryDate: Date | null;
  setExpiryDate: (date: Date | null) => void;
  disabled?: boolean;
}

const ExpiryDateSelector: React.FC<ExpiryDateSelectorProps> = ({ 
  expiryDate, 
  setExpiryDate,
  disabled = false
}) => {
  return (
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
            disabled={disabled}
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
  );
};

export default ExpiryDateSelector;
