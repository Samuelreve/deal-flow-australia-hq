
import React from 'react';
import { Button } from "@/components/ui/button";
import { Highlighter } from 'lucide-react';
import HighlightCategorySelector from '../HighlightCategorySelector';
import { HighlightCategory } from '@/hooks/contract-analysis/types';

interface HighlightControlsProps {
  isHighlightMode: boolean;
  toggleHighlightMode: () => void;
  activeCategory: string;
  changeCategory: (categoryId: string) => void;
  addCategory: (name: string, color: string, description?: string) => void;
  categories: HighlightCategory[];
  clearHighlights: () => void;
  highlightsCount: number;
}

const HighlightControls: React.FC<HighlightControlsProps> = ({
  isHighlightMode,
  toggleHighlightMode,
  activeCategory,
  changeCategory,
  addCategory,
  categories,
  clearHighlights,
  highlightsCount
}) => {
  return (
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
            disabled={highlightsCount === 0}
          >
            Clear All
          </Button>
        </>
      )}
    </div>
  );
};

export default HighlightControls;
