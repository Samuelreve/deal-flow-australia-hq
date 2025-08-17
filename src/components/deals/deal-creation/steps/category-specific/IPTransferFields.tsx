import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { DealCreationData, IPAsset, IP_ASSET_TYPES } from '../../types';

interface IPTransferFieldsProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
}

export const IPTransferFields: React.FC<IPTransferFieldsProps> = ({ data, updateData }) => {
  const addIPAsset = () => {
    const newAsset: IPAsset = {
      type: 'patent',
      name: '',
      description: '',
      registrationNumber: '',
      expiryDate: '',
      value: ''
    };
    updateData({ ipAssets: [...data.ipAssets, newAsset] });
  };

  const updateIPAsset = (index: number, updatedAsset: Partial<IPAsset>) => {
    const updatedAssets = data.ipAssets.map((asset, i) => 
      i === index ? { ...asset, ...updatedAsset } : asset
    );
    updateData({ ipAssets: updatedAssets });
  };

  const removeIPAsset = (index: number) => {
    const updatedAssets = data.ipAssets.filter((_, i) => i !== index);
    updateData({ ipAssets: updatedAssets });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Intellectual Property Assets</h3>
        <Button type="button" variant="outline" onClick={addIPAsset}>
          <Plus className="mr-2 h-4 w-4" />
          Add IP Asset
        </Button>
      </div>

      {data.ipAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              No IP assets added yet. Click "Add IP Asset" to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.ipAssets.map((asset, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base">
                  {asset.name || `IP Asset ${index + 1}`}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIPAsset(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IP Type</Label>
                    <Select
                      value={asset.type}
                      onValueChange={(value: any) => updateIPAsset(index, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IP_ASSET_TYPES.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Name</Label>
                    <Input
                      value={asset.name}
                      onChange={(e) => updateIPAsset(index, { name: e.target.value })}
                      placeholder="e.g., MyApp Mobile Application"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Number (if applicable)</Label>
                    <Input
                      value={asset.registrationNumber || ''}
                      onChange={(e) => updateIPAsset(index, { registrationNumber: e.target.value })}
                      placeholder="e.g., US10123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiry Date (if applicable)</Label>
                    <Input
                      type="date"
                      value={asset.expiryDate || ''}
                      onChange={(e) => updateIPAsset(index, { expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Value (AUD)</Label>
                    <Input
                      value={asset.value || ''}
                      onChange={(e) => updateIPAsset(index, { value: e.target.value })}
                      placeholder="e.g., 50,000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={asset.description}
                    onChange={(e) => updateIPAsset(index, { description: e.target.value })}
                    placeholder="Describe the IP asset, its uniqueness, commercial applications, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};