
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Filter } from 'lucide-react';
import { HighlightCategory } from '@/hooks/contract-analysis/types';

interface HighlightFiltersProps {
  categories: HighlightCategory[];
  categoryStats: Array<{
    id: string;
    name: string;
    color: string;
    count: number;
  }>;
  activeFilters: string[];
  onFilterChange: (categoryId: string) => void;
  onClearFilters: () => void;
}

const HighlightFilters: React.FC<HighlightFiltersProps> = ({
  categories,
  categoryStats,
  activeFilters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = activeFilters.length > 0;
  const totalHighlights = categoryStats.reduce((sum, stat) => sum + stat.count, 0);
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter Highlights</span>
        </div>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs h-7 px-2"
          >
            Clear filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categoryStats.map((category) => {
          const isActive = activeFilters.includes(category.id);
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 gap-1 ${isActive ? '' : 'bg-transparent'}`}
              style={{ 
                borderColor: category.color,
                backgroundColor: isActive ? `${category.color}20` : 'transparent'
              }}
              onClick={() => onFilterChange(category.id)}
              disabled={category.count === 0}
            >
              {category.name}
              <Badge 
                variant="outline" 
                className={`ml-1 text-xs ${isActive ? 'bg-white bg-opacity-20' : ''}`}
              >
                {category.count}
              </Badge>
              {isActive && <CheckIcon className="h-3 w-3 ml-1" />}
            </Button>
          );
        })}
        
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-auto">
            Showing {activeFilters.length === categories.length ? 'all' : 
              activeFilters.map(f => categories.find(c => c.id === f)?.name).join(', ')} highlights
          </Badge>
        )}
      </div>
    </div>
  );
};

export default HighlightFilters;
