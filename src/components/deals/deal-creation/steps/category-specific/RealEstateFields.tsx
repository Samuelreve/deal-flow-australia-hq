import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Calendar, Ruler } from 'lucide-react';
import { DealCreationData, PROPERTY_TYPES, PROPERTY_STAGES } from '../../types';

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
    <div className="space-y-6">
      {/* Prominent Property Details Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary">Property Details</h3>
            <p className="text-sm text-muted-foreground">Essential information about your property transaction</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Real Estate Deal
        </Badge>
      </div>
      
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Property Information
          </CardTitle>
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
              <Label>Property Address *</Label>
              <Input
                value={data.propertyDetails.address}
                onChange={(e) => updatePropertyDetails({ address: e.target.value })}
                placeholder="Full property address"
              />
            </div>

            <div className="space-y-2">
              <Label>Stage *</Label>
              <Select
                value={data.propertyDetails.stage}
                onValueChange={(value: any) => updatePropertyDetails({ stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage.toLowerCase().replace(' ', '_')}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Area (sqm)
              </Label>
              <Input
                type="number"
                value={data.propertyDetails.sqm || ''}
                onChange={(e) => updatePropertyDetails({ sqm: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g., 500"
              />
            </div>

            <div className="space-y-2">
              <Label>Zoning (optional)</Label>
              <Input
                value={data.propertyDetails.zoning || ''}
                onChange={(e) => updatePropertyDetails({ zoning: e.target.value })}
                placeholder="e.g., Commercial B2"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Settlement Date (optional)
              </Label>
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
    </div>
  );
};