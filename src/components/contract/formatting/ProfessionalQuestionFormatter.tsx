
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Scale, Clock, FileText } from 'lucide-react';

interface ProfessionalQuestionFormatterProps {
  question: string;
  answer: string;
  sources?: string[];
  timestamp: number;
}

const ProfessionalQuestionFormatter: React.FC<ProfessionalQuestionFormatterProps> = ({
  question,
  answer,
  sources,
  timestamp
}) => {
  const formatAnswer = (text: string) => {
    // Split into paragraphs and format professionally
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Check if this is a list
      if (/^\d+\.|^[•\-\*]/.test(trimmedParagraph)) {
        const listItems = trimmedParagraph.split('\n').filter(item => item.trim());
        return (
          <div key={index} className="mb-4">
            <ul className="space-y-2">
              {listItems.map((item, itemIndex) => {
                const cleanItem = item.replace(/^\d+\.\s*|^[•\-\*]\s*/, '').trim();
                return (
                  <li key={itemIndex} className="flex items-start gap-3 text-slate-700">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5"></div>
                    <span className="text-sm leading-relaxed">{cleanItem}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-slate-700 leading-relaxed text-sm mb-4 text-justify">
          {trimmedParagraph}
        </p>
      );
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-800 mb-2">Legal Inquiry</h3>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{question}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-4 w-4" />
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-800">Legal Analysis & Response</h4>
        </div>
        
        <div className="prose prose-slate max-w-none">
          {formatAnswer(answer)}
        </div>
        
        {sources && sources.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="bg-slate-50 p-3 rounded-lg">
              <h5 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Document References
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((source, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-slate-200 text-slate-700">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalQuestionFormatter;
