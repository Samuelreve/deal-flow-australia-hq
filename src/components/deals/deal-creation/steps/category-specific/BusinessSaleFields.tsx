import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Building2, Package, TrendingUp } from 'lucide-react';
import { DealCreationData } from '../../types';

interface BusinessSaleFieldsProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
}

export const BusinessSaleFields: React.FC<BusinessSaleFieldsProps> = ({ data, updateData }) => {
  const updateBusinessSaleDetails = (updates: any) => {
    updateData(updates);
  };

  // Assets management
  const assetsIncluded = data.keyAssetsIncluded ? data.keyAssetsIncluded.split(',').map(s => s.trim()).filter(Boolean) : [];
  const liabilitiesIncluded = data.keyAssetsExcluded ? data.keyAssetsExcluded.split(',').map(s => s.trim()).filter(Boolean) : [];

  const addAsset = (type: 'asset' | 'liability') => {
    const input = document.getElementById(`new${type}`) as HTMLInputElement;
    if (input && input.value.trim()) {
      if (type === 'asset') {
        const newAssets = [...assetsIncluded, input.value.trim()];
        updateData({ keyAssetsIncluded: newAssets.join(', ') });
      } else {
        const newLiabilities = [...liabilitiesIncluded, input.value.trim()];
        updateData({ keyAssetsExcluded: newLiabilities.join(', ') });
      }
      input.value = '';
    }
  };

  const removeAsset = (type: 'asset' | 'liability', index: number) => {
    if (type === 'asset') {
      const newAssets = assetsIncluded.filter((_, i) => i !== index);
      updateData({ keyAssetsIncluded: newAssets.join(', ') });
    } else {
      const newLiabilities = liabilitiesIncluded.filter((_, i) => i !== index);
      updateData({ keyAssetsExcluded: newLiabilities.join(', ') });
    }
  };

  return (
    <div className="space-y-6">
      {/* Prominent Business Sale Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-500/10 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-600">Business Sale Details</h3>
            <p className="text-sm text-muted-foreground">Define what's included in your business transaction</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
          Business Sale Deal
        </Badge>
      </div>
      
      <Card className="border-green-500/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Assets & Liabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Industry Display */}
          <div className="space-y-2">
            <Label>Business Industry</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{data.businessIndustry || 'Not specified'}</p>
              <p className="text-xs text-muted-foreground">From business information</p>
            </div>
          </div>

          {/* Assets Included */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              Assets Included
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {assetsIncluded.map((asset, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {asset}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeAsset('asset', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="newasset"
                placeholder="e.g., Equipment, Inventory, Customer List"
                onKeyPress={(e) => e.key === 'Enter' && addAsset('asset')}
              />
              <Button type="button" onClick={() => addAsset('asset')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              List the main assets included in the business sale (press Enter or click + to add)
            </p>
          </div>

          {/* Liabilities Included */}
          <div className="space-y-3">
            <Label>Liabilities Included</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {liabilitiesIncluded.map((liability, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {liability}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeAsset('liability', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="newliability"
                placeholder="e.g., Outstanding loans, Trade creditors"
                onKeyPress={(e) => e.key === 'Enter' && addAsset('liability')}
              />
              <Button type="button" onClick={() => addAsset('liability')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              List any liabilities that will transfer with the business (press Enter or click + to add)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};