import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealCreationData, MICRO_DEAL_CONDITIONS, MICRO_DEAL_RARITIES } from '../../types';

interface MicroDealFieldsProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
}

export const MicroDealFields: React.FC<MicroDealFieldsProps> = ({ data, updateData }) => {
  const updateMicroDealDetails = (updates: Partial<typeof data.microDealDetails>) => {
    updateData({
      microDealDetails: { ...data.microDealDetails, ...updates }
    });
  };

  const addCertification = (certification: string) => {
    if (!certification.trim()) return;
    const current = data.microDealDetails.certifications || [];
    if (!current.includes(certification)) {
      updateMicroDealDetails({ 
        certifications: [...current, certification] 
      });
    }
  };

  const removeCertification = (certification: string) => {
    const updated = (data.microDealDetails.certifications || []).filter(c => c !== certification);
    updateMicroDealDetails({ certifications: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Item Type</Label>
            <Input
              value={data.microDealDetails.itemType}
              onChange={(e) => updateMicroDealDetails({ itemType: e.target.value })}
              placeholder="e.g., Pokémon Card, Art Print, Vintage Watch"
            />
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select
              value={data.microDealDetails.condition}
              onValueChange={(value: any) => updateMicroDealDetails({ condition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MICRO_DEAL_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition.toLowerCase().replace(' ', '_')}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rarity Level</Label>
            <Select
              value={data.microDealDetails.rarity}
              onValueChange={(value: any) => updateMicroDealDetails({ rarity: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MICRO_DEAL_RARITIES.map((rarity) => (
                  <SelectItem key={rarity} value={rarity.toLowerCase().replace(' ', '_')}>
                    {rarity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Authenticity Status</Label>
            <Select
              value={data.microDealDetails.authenticity}
              onValueChange={(value: any) => updateMicroDealDetails({ authenticity: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Provenance/History</Label>
          <Textarea
            value={data.microDealDetails.authenticityNotes || ''}
            onChange={(e) => updateMicroDealDetails({ authenticityNotes: e.target.value })}
            placeholder="Describe the item's history, previous owners, or origin story"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Certifications & Authentication</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.microDealDetails.certifications || []).map((cert, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(cert)}>
                {cert} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add certification (e.g., PSA 10, BGS 9.5, COA) - Press Enter to add"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCertification(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Common certifications: PSA, BGS, CGC, JSA, COA, PCGS, NGC
          </p>
        </div>
      </CardContent>
    </Card>
  );
};