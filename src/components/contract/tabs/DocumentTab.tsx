
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, List, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentHighlighting } from '@/hooks/contract-analysis/useDocumentHighlighting';
import DocumentViewer from './DocumentViewer';
import HighlightControls from './HighlightControls';
import HighlightsTabContent from './HighlightsTabContent';

interface DocumentTabProps {
  contractText: string;
}

const DocumentTab: React.FC<DocumentTabProps> = ({ contractText }) => {
  const [activeTab, setActiveTab] = useState("document");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
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
    getHighlightStats,
    setShowNoteEditor
  } = useDocumentHighlighting(contractText);
  
  // Get highlight statistics
  const highlightStats = getHighlightStats();

  // Toggle a filter
  const handleFilterChange = (categoryId: string) => {
    setActiveFilters(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters([]);
  };
  
  useEffect(() => {
    // When switching to highlights tab, auto-select all categories if no filters are active
    if (activeTab === "highlights" && activeFilters.length === 0) {
      setActiveFilters(categories.map(c => c.id));
    }
  }, [activeTab, categories]);

  // Show error if no contract text
  if (!contractText || contractText.trim().length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No contract content available. Please upload a contract document to begin analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
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
          <HighlightControls 
            isHighlightMode={isHighlightMode}
            toggleHighlightMode={toggleHighlightMode}
            activeCategory={activeCategory}
            changeCategory={changeCategory}
            addCategory={addCategory}
            categories={categories}
            clearHighlights={clearHighlights}
            highlightsCount={highlights.length}
          />
          
          <CardContent>
            <DocumentViewer
              contractText={contractText}
              isHighlightMode={isHighlightMode}
              containerRef={containerRef}
              highlights={highlights}
              selectedHighlight={selectedHighlight}
              highlightNote={highlightNote}
              showNoteEditor={showNoteEditor}
              handleTextSelection={handleTextSelection}
              selectHighlight={selectHighlight}
              setHighlightNote={setHighlightNote}
              updateHighlightNote={updateHighlightNote}
              setShowNoteEditor={setShowNoteEditor}
              renderHighlightedText={renderHighlightedText}
              categories={categories}
              activeCategory={activeCategory}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="highlights">
          <CardContent>
            <HighlightsTabContent 
              highlights={highlights}
              categories={categories}
              highlightStats={highlightStats}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
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
