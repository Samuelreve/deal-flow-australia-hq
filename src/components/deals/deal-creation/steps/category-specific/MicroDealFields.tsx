import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, Star, Award, Shield } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Prominent Micro Deal Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <Gem className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-purple-600">Collectible Item Details</h3>
            <p className="text-sm text-muted-foreground">Showcase your collectible or unique item for sale</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
          Micro Deal
        </Badge>
      </div>
      
      <Card className="border-purple-500/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Item Information
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input
              value={data.microDealDetails.itemName}
              onChange={(e) => updateMicroDealDetails({ itemName: e.target.value })}
              placeholder="e.g., Charizard Base Set Card, Vintage Rolex Watch"
            />
          </div>

          <div className="space-y-2">
            <Label>Item Type</Label>
            <Input
              value={data.microDealDetails.itemType}
              onChange={(e) => updateMicroDealDetails({ itemType: e.target.value })}
              placeholder="e.g., Pokémon Card, Art Print, Vintage Watch"
            />
          </div>

          <div className="space-y-2">
            <Label>Item Condition</Label>
            <Select
              value={data.microDealDetails.condition}
              onValueChange={(value: any) => updateMicroDealDetails({ condition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
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
          <Label>Authenticity Notes</Label>
          <Textarea
            value={data.microDealDetails.authenticityNotes || ''}
            onChange={(e) => updateMicroDealDetails({ authenticityNotes: e.target.value })}
            placeholder="Describe the item's history, previous owners, or authenticity details"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Escrow Opt-In</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="escrowOptIn"
              checked={data.microDealDetails.escrowOptIn}
              onChange={(e) => updateMicroDealDetails({ escrowOptIn: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="escrowOptIn" className="text-sm font-normal">
              Use escrow service for this transaction (recommended for high-value items)
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-600" />
            Certifications & Authentication
          </Label>
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
    </div>
  );
};