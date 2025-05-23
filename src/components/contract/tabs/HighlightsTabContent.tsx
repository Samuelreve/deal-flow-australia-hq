
import React from 'react';
import { Highlight, HighlightCategory } from '@/hooks/contract-analysis/types';
import HighlightFilters from '../HighlightFilters';
import HighlightsSummaryPanel from '../HighlightsSummaryPanel';

interface HighlightsTabContentProps {
  highlights: Highlight[];
  categories: HighlightCategory[];
  highlightStats: Array<HighlightCategory & { count: number }>;
  activeFilters: string[];
  onFilterChange: (categoryId: string) => void;
  onClearFilters: () => void;
  onSelectHighlight: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
}

const HighlightsTabContent: React.FC<HighlightsTabContentProps> = ({
  highlights,
  categories,
  highlightStats,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onSelectHighlight,
  onRemoveHighlight
}) => {
  // Filter the highlights based on activeFilters
  const filteredHighlights = activeFilters.length > 0 
    ? highlights.filter(h => activeFilters.includes(h.category || 'custom')) 
    : highlights;
    
  return (
    <>
      {highlights.length > 0 && (
        <HighlightFilters
          categories={categories}
          categoryStats={highlightStats}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
      )}
      
      <HighlightsSummaryPanel
        highlights={filteredHighlights}
        categories={categories}
        onSelectHighlight={onSelectHighlight}
        onRemoveHighlight={onRemoveHighlight}
      />
    </>
  );
};

export default HighlightsTabContent;
