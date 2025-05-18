
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SortAsc, SortDesc, Search } from "lucide-react";

interface DealFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const DealFilters: React.FC<DealFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Status Filter */}
      <div className="w-full md:w-1/4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Search */}
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search deals..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* Sort By */}
      <div className="w-full md:w-1/4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="title">Deal Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="healthScore">Health Score</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sort Order */}
      <div className="w-full md:w-auto">
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-full md:w-auto"
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </div>
    </div>
  );
};

export default DealFilters;
