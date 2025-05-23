
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Save, MessageSquare } from 'lucide-react';
import { Highlight } from '@/hooks/contract-analysis/types';

interface HighlightNoteEditorProps {
  highlight: Highlight;
  note: string;
  onNoteChange: (note: string) => void;
  onSave: (id: string, note: string) => void;
  onClose: () => void;
}

const HighlightNoteEditor: React.FC<HighlightNoteEditorProps> = ({
  highlight,
  note,
  onNoteChange,
  onSave,
  onClose
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Add Note
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-3 p-2 rounded bg-muted border text-sm">
          <span 
            style={{ backgroundColor: highlight.color + '40' }}
            className="inline-block px-1 py-0.5 rounded"
          >
            {highlight.text.length > 100 
              ? highlight.text.substring(0, 100) + '...' 
              : highlight.text}
          </span>
        </div>
        <Textarea
          placeholder="Add notes about this highlighted text..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="min-h-[100px]"
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="default"
          onClick={() => onSave(highlight.id, note)}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          Save Note
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HighlightNoteEditor;
