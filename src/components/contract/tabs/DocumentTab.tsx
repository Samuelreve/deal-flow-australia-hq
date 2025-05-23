
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, AlertCircle, FileText, Highlighter, List } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentHighlighting } from '@/hooks/contract-analysis/useDocumentHighlighting';
import HighlightCategorySelector from '../HighlightCategorySelector';
import HighlightsSummaryPanel from '../HighlightsSummaryPanel';
import HighlightNoteEditor from '../HighlightNoteEditor';

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("document");
  const maxHeight = expanded ? '100%' : '600px';
  
  // Use our document highlighting hook
  const {
    containerRef,
    isHighlightMode,
    activeCategory,
    activeColor,
    categories,
    highlights,
    selectedHighlight,
    highlightNote,
    showNoteEditor,
    handleTextSelection,
    toggleHighlightMode,
    changeCategory,
    addCategory,
    removeHighlight,
    clearHighlights,
    renderHighlightedText,
    selectHighlight,
    setHighlightNote,
    updateHighlightNote,
    setShowNoteEditor
  } = useDocumentHighlighting(contractText);
  
  // Prepare highlighted HTML content
  const highlightedContent = renderHighlightedText();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Document
        </CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="document" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList>
            <TabsTrigger value="document" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="highlights" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              Highlights {highlights.length > 0 && `(${highlights.length})`}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="document">
          {contractText && (
            <div className="px-6 pb-2 flex flex-wrap items-center gap-2 border-b">
              <Button
                variant={isHighlightMode ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
                onClick={toggleHighlightMode}
              >
                <Highlighter className="h-4 w-4" />
                {isHighlightMode ? "Exit Highlight Mode" : "Highlight Text"}
              </Button>
              
              {isHighlightMode && (
                <>
                  <HighlightCategorySelector
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={changeCategory}
                    onAddCategory={addCategory}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHighlights}
                    className="ml-auto text-xs"
                    disabled={highlights.length === 0}
                  >
                    Clear All
                  </Button>
                </>
              )}
            </div>
          )}
          
          <CardContent>
            {showNoteEditor && selectedHighlight && (
              <HighlightNoteEditor
                highlight={selectedHighlight}
                note={highlightNote}
                onNoteChange={setHighlightNote}
                onSave={updateHighlightNote}
                onClose={() => setShowNoteEditor(false)}
              />
            )}
            
            {contractText ? (
              <>
                <div 
                  className="bg-muted p-4 rounded-md overflow-auto transition-all" 
                  style={{ maxHeight }}
                  ref={containerRef}
                  onMouseUp={handleTextSelection}
                >
                  {isHighlightMode && (
                    <div className="p-2 mb-2 text-xs bg-blue-50 rounded border border-blue-100">
                      <p className="font-medium">Highlight Mode Active</p>
                      <p>Select any text in the document to highlight it as <span className="font-medium">{categories.find(c => c.id === activeCategory)?.name}</span>.</p>
                    </div>
                  )}
                  
                  {highlightedContent ? (
                    <div 
                      className="text-sm whitespace-pre-wrap font-mono text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: highlightedContent }}
                      onClick={(e) => {
                        // Check if we clicked on a highlight
                        if (e.target instanceof HTMLElement) {
                          const element = e.target as HTMLElement;
                          if (element.hasAttribute('data-highlight-id')) {
                            const highlightId = element.getAttribute('data-highlight-id');
                            if (highlightId) {
                              selectHighlight(highlightId);
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                      {contractText}
                    </pre>
                  )}
                </div>
                
                {contractText.length > 500 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 w-full flex items-center justify-center"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> Show More
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm">
                  No document content available. Please upload a document to view its contents.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="highlights">
          <CardContent>
            <HighlightsSummaryPanel
              highlights={highlights}
              categories={categories}
              onSelectHighlight={selectHighlight}
              onRemoveHighlight={removeHighlight}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DocumentTab;
