import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealCreationData, PROPERTY_TYPES } from '../../types';

interface RealEstateFieldsProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
}

export const RealEstateFields: React.FC<RealEstateFieldsProps> = ({ data, updateData }) => {
  const updatePropertyDetails = (updates: Partial<typeof data.propertyDetails>) => {
    updateData({
      propertyDetails: { ...data.propertyDetails, ...updates }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={data.propertyDetails.propertyType}
              onValueChange={(value: any) => updatePropertyDetails({ propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property Address</Label>
            <Input
              value={data.propertyDetails.address}
              onChange={(e) => updatePropertyDetails({ address: e.target.value })}
              placeholder="Full property address"
            />
          </div>

          <div className="space-y-2">
            <Label>Area (sqm)</Label>
            <Input
              type="number"
              value={data.propertyDetails.sqm || ''}
              onChange={(e) => updatePropertyDetails({ sqm: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 500"
            />
          </div>

          <div className="space-y-2">
            <Label>Zoning</Label>
            <Input
              value={data.propertyDetails.zoning || ''}
              onChange={(e) => updatePropertyDetails({ zoning: e.target.value })}
              placeholder="e.g., Commercial B2"
            />
          </div>

          <div className="space-y-2">
            <Label>Council/Local Authority</Label>
            <Input
              value={data.propertyDetails.council || ''}
              onChange={(e) => updatePropertyDetails({ council: e.target.value })}
              placeholder="e.g., City of Melbourne"
            />
          </div>

          <div className="space-y-2">
            <Label>Proposed Settlement Date</Label>
            <Input
              type="date"
              value={data.propertyDetails.settlementDate || ''}
              onChange={(e) => updatePropertyDetails({ settlementDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Use</Label>
            <Textarea
              value={data.propertyDetails.currentUse || ''}
              onChange={(e) => updatePropertyDetails({ currentUse: e.target.value })}
              placeholder="Describe current use of the property"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Proposed Use</Label>
            <Textarea
              value={data.propertyDetails.proposedUse || ''}
              onChange={(e) => updatePropertyDetails({ proposedUse: e.target.value })}
              placeholder="Intended future use by buyer"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};