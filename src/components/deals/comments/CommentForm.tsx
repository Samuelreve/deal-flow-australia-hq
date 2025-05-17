
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  submitting 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3 pt-3 border-t">
      <Textarea
        placeholder="Write a comment..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={submitting}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button 
          type="submit"
          disabled={!value.trim() || submitting}
          size="sm"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
