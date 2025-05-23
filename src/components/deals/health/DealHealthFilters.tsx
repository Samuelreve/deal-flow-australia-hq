
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface DealHealthFiltersProps {
  healthFilterValue: number | null;
  setHealthFilterValue: (value: number | null) => void;
  riskFilter: 'all' | 'high' | 'medium' | 'low';
  setRiskFilter: (value: 'all' | 'high' | 'medium' | 'low') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

const DealHealthFilters: React.FC<DealHealthFiltersProps> = ({
  healthFilterValue,
  setHealthFilterValue,
  riskFilter,
  setRiskFilter,
  sortOrder,
  setSortOrder
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Filter */}
          <div>
            <Label className="mb-2 block">Health Score Filter</Label>
            <div className="space-y-4">
              <Slider 
                defaultValue={[0]} 
                max={100} 
                step={5} 
                value={healthFilterValue ? [healthFilterValue] : [0]}
                onValueChange={(values) => setHealthFilterValue(values[0] > 0 ? values[0] : null)}
              />
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Min: {healthFilterValue || 0}%</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setHealthFilterValue(null)}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
          
          {/* Risk Level Filter */}
          <div>
            <Label className="mb-2 block">Risk Level</Label>
            <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Order */}
          <div>
            <Label className="mb-2 block">Sort Order</Label>
            <Button 
              variant="outline" 
              className="w-full flex justify-between"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <span>Health Score {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealHealthFilters;
