
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentThreadTabProps {
  documentId: string;
  versionId: string;
  isDemoMode?: boolean;
}

// Sample comments for demo
const sampleComments = [
  {
    id: "c1",
    content: "We should clarify the confidentiality term length in section 4.",
    author: "Jane Doe",
    timestamp: "May 21, 2025 - 2:30 PM"
  },
  {
    id: "c2",
    content: "I agree. 5 years seems long for this type of agreement.",
    author: "John Smith",
    timestamp: "May 21, 2025 - 3:15 PM"
  },
  {
    id: "c3",
    content: "I've updated the draft to propose a 3-year term instead.",
    author: "Legal Team",
    timestamp: "May 21, 2025 - 4:42 PM"
  }
];

const CommentThreadTab: React.FC<CommentThreadTabProps> = ({
  documentId,
  versionId,
  isDemoMode = false
}) => {
  const comments = sampleComments;
  
  return (
    <CardContent className="pt-4">
      <h3 className="text-sm font-medium mb-3">Comments</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto mb-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 pt-2 border-t">
        <Input 
          placeholder="Add a comment..."
          className="text-sm"
        />
        <Button size="sm" className="px-3">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  );
};

export default CommentThreadTab;
