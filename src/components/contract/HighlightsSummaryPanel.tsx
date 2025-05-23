
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Tag, Pencil, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Highlight, HighlightCategory } from '@/hooks/contract-analysis/types';

interface HighlightsSummaryPanelProps {
  highlights: Highlight[];
  categories: HighlightCategory[];
  onSelectHighlight: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
}

const HighlightsSummaryPanel: React.FC<HighlightsSummaryPanelProps> = ({
  highlights,
  categories,
  onSelectHighlight,
  onRemoveHighlight
}) => {
  const sortedHighlights = [...highlights].sort((a, b) => {
    // First sort by category, then by position in document
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.startIndex - b.startIndex;
  });

  // Group highlights by category
  const highlightsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = sortedHighlights.filter(h => h.category === category.id);
    return acc;
  }, {} as Record<string, Highlight[]>);

  if (highlights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Highlights Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No highlights added yet</p>
          <p className="text-sm mt-2">
            Turn on highlight mode and select text to add highlights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Highlights Summary ({highlights.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[500px] overflow-auto">
        {categories.map(category => {
          const categoryHighlights = highlightsByCategory[category.id] || [];
          if (categoryHighlights.length === 0) return null;

          return (
            <div key={category.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" style={{ color: category.color }} />
                <h3 className="font-semibold">{category.name}</h3>
                <Badge variant="outline">{categoryHighlights.length}</Badge>
              </div>
              
              <div className="space-y-3 pl-6">
                {categoryHighlights.map(highlight => (
                  <div 
                    key={highlight.id} 
                    className="bg-muted p-3 rounded-md relative group"
                  >
                    <div className="text-sm font-mono">
                      <span 
                        style={{ backgroundColor: highlight.color + '40' }}
                        className="inline-block px-1 py-0.5 rounded"
                      >
                        {highlight.text.length > 100 
                          ? highlight.text.substring(0, 100) + '...' 
                          : highlight.text}
                      </span>
                    </div>
                    
                    {highlight.note && (
                      <div className="text-xs mt-1 text-muted-foreground border-l-2 border-muted-foreground pl-2">
                        {highlight.note}
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => onSelectHighlight(highlight.id)}
                        title="Edit note"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveHighlight(highlight.id)}
                        title="Remove highlight"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HighlightsSummaryPanel;
