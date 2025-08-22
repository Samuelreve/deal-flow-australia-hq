import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copyright, Shield, Lightbulb } from 'lucide-react';
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
      identifier: '', // required default
      jurisdiction: '', // required default
      transferType: 'assignment', // required default
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
      {/* Prominent IP Transfer Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Copyright className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600">Intellectual Property Assets</h3>
            <p className="text-sm text-muted-foreground">Manage your intellectual property portfolio for transfer</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            IP Transfer Deal
          </Badge>
          <Button type="button" variant="outline" onClick={addIPAsset} className="border-blue-500/20 hover:bg-blue-500/5">
            <Plus className="mr-2 h-4 w-4" />
            Add IP Asset
          </Button>
        </div>
      </div>

      {data.ipAssets.length === 0 ? (
        <Card className="border-blue-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-500/10 p-4 rounded-full mb-4">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-600 mb-2">No IP Assets Added Yet</h4>
            <p className="text-muted-foreground text-center text-sm">
              Click "Add IP Asset" above to start building your intellectual property portfolio for transfer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.ipAssets.map((asset, index) => (
            <Card key={index} className="border-blue-500/20 hover:border-blue-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
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
                    <Label>IP Type *</Label>
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
                    <Label>IP Identifier</Label>
                    <Input
                      value={asset.identifier || ''}
                      onChange={(e) => updateIPAsset(index, { identifier: e.target.value })}
                      placeholder="e.g., AU TM number, patent app no."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jurisdiction *</Label>
                    <Input
                      value={asset.jurisdiction || ''}
                      onChange={(e) => updateIPAsset(index, { jurisdiction: e.target.value })}
                      placeholder="e.g., Australia, United States"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Transfer Type *</Label>
                    <Select
                      value={asset.transferType}
                      onValueChange={(value: any) => updateIPAsset(index, { transferType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="exclusive_license">Exclusive License</SelectItem>
                        <SelectItem value="non_exclusive_license">Non-Exclusive License</SelectItem>
                      </SelectContent>
                    </Select>
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