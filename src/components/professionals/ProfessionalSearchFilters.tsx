
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfessionalFilters {
  searchTerm: string;
  location?: string;
  specialization?: string;
}

interface ProfessionalSearchFiltersProps {
  filters: ProfessionalFilters;
  onFiltersChange: (filters: ProfessionalFilters) => void;
  isLoading?: boolean;
}

const ProfessionalSearchFilters: React.FC<ProfessionalSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false
}) => {
  // Local state for form inputs
  const [formInputs, setFormInputs] = useState<ProfessionalFilters>(filters);
  
  // Common specializations (these could be fetched from the database)
  const specializations = [
    "Corporate Law",
    "Mergers & Acquisitions",
    "Business Advisory",
    "Tax Law",
    "Commercial Contracts",
    "Intellectual Property",
    "Financial Advisory",
    "Due Diligence"
  ];
  
  // Common locations (these could be fetched from the database)
  const locations = [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Canberra",
    "Gold Coast",
    "Newcastle"
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInputs({
      ...formInputs,
      searchTerm: e.target.value
    });
  };
  
  const handleLocationChange = (value: string) => {
    setFormInputs({
      ...formInputs,
      location: value
    });
  };
  
  const handleSpecializationChange = (value: string) => {
    setFormInputs({
      ...formInputs,
      specialization: value
    });
  };
  
  const handleSubmit = () => {
    onFiltersChange(formInputs);
  };
  
  const handleClear = () => {
    const clearedFilters = {
      searchTerm: '',
      location: undefined,
      specialization: undefined
    };
    setFormInputs(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, firm, or keyword..."
                value={formInputs.searchTerm}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select 
                value={formInputs.location} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any location</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select 
                value={formInputs.specialization} 
                onValueChange={handleSpecializationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any specialization</SelectItem>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClear} 
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalSearchFilters;
