import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealCreationData } from '../../types';

interface CrossBorderFieldsProps {
  data: DealCreationData;
  updateData: (data: Partial<DealCreationData>) => void;
}

export const CrossBorderFields: React.FC<CrossBorderFieldsProps> = ({ data, updateData }) => {
  const updateCrossBorderDetails = (updates: Partial<typeof data.crossBorderDetails>) => {
    updateData({
      crossBorderDetails: { ...data.crossBorderDetails, ...updates }
    });
  };

  const addRegulatoryApproval = (approval: string) => {
    if (!approval.trim()) return;
    const current = data.crossBorderDetails.regulatoryApprovals || [];
    if (!current.includes(approval)) {
      updateCrossBorderDetails({ 
        regulatoryApprovals: [...current, approval] 
      });
    }
  };

  const removeRegulatoryApproval = (approval: string) => {
    const updated = (data.crossBorderDetails.regulatoryApprovals || []).filter(a => a !== approval);
    updateCrossBorderDetails({ regulatoryApprovals: updated });
  };

  const addComplianceRequirement = (requirement: string) => {
    if (!requirement.trim()) return;
    const current = data.crossBorderDetails.complianceRequirements || [];
    if (!current.includes(requirement)) {
      updateCrossBorderDetails({ 
        complianceRequirements: [...current, requirement] 
      });
    }
  };

  const removeComplianceRequirement = (requirement: string) => {
    const updated = (data.crossBorderDetails.complianceRequirements || []).filter(r => r !== requirement);
    updateCrossBorderDetails({ complianceRequirements: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Border Transaction Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Buyer Country</Label>
            <Input
              value={data.crossBorderDetails.buyerCountry}
              onChange={(e) => updateCrossBorderDetails({ buyerCountry: e.target.value })}
              placeholder="e.g., United States"
            />
          </div>

          <div className="space-y-2">
            <Label>Seller Country</Label>
            <Input
              value={data.crossBorderDetails.sellerCountry}
              onChange={(e) => updateCrossBorderDetails({ sellerCountry: e.target.value })}
              placeholder="e.g., Australia"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Implications</Label>
            <Textarea
              value={data.crossBorderDetails.taxImplications}
              onChange={(e) => updateCrossBorderDetails({ taxImplications: e.target.value })}
              placeholder="Describe tax implications for cross-border transaction"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Currency Exchange Details</Label>
            <Textarea
              value={data.crossBorderDetails.currencyExchange}
              onChange={(e) => updateCrossBorderDetails({ currencyExchange: e.target.value })}
              placeholder="Currency exchange rates, hedging arrangements, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Regulatory Approvals Required</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.crossBorderDetails.regulatoryApprovals || []).map((approval, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRegulatoryApproval(approval)}>
                {approval} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add regulatory approval (e.g., FIRB, CFIUS) - Press Enter to add"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRegulatoryApproval(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Compliance Requirements</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.crossBorderDetails.complianceRequirements || []).map((requirement, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeComplianceRequirement(requirement)}>
                {requirement} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add compliance requirement - Press Enter to add"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addComplianceRequirement(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};