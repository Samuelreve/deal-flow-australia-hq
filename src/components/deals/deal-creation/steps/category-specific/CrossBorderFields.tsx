import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Banknote, Shield, Flag } from 'lucide-react';
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

  const addRegulatoryFlag = (flag: string) => {
    if (!flag.trim()) return;
    const current = data.crossBorderDetails.regulatoryFlags || [];
    if (!current.includes(flag)) {
      updateCrossBorderDetails({ 
        regulatoryFlags: [...current, flag] 
      });
    }
  };

  const removeRegulatoryFlag = (flag: string) => {
    const updated = (data.crossBorderDetails.regulatoryFlags || []).filter(f => f !== flag);
    updateCrossBorderDetails({ regulatoryFlags: updated });
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
    <div className="space-y-6">
      {/* Prominent Cross-Border Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-orange-500/10 p-2 rounded-lg">
            <Globe className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-orange-600">Cross-Border Transaction Details</h3>
            <p className="text-sm text-muted-foreground">International transaction compliance and regulatory requirements</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
          Cross-Border Deal
        </Badge>
      </div>
      
      <Card className="border-orange-500/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            International Requirements
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Counterparty Country *</Label>
            <Input
              value={data.crossBorderDetails.counterpartyCountry}
              onChange={(e) => updateCrossBorderDetails({ counterpartyCountry: e.target.value })}
              placeholder="e.g., United States"
            />
          </div>

          <div className="space-y-2">
            <Label>Currency *</Label>
            <Select
              value={data.crossBorderDetails.currency}
              onValueChange={(value: any) => updateCrossBorderDetails({ currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Incoterms</Label>
            <Select
              value={data.crossBorderDetails.incoterms || ''}
              onValueChange={(value: any) => updateCrossBorderDetails({ incoterms: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Incoterms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                <SelectItem value="CPT">CPT - Carriage Paid To</SelectItem>
                <SelectItem value="CIP">CIP - Carriage and Insurance Paid To</SelectItem>
                <SelectItem value="DAP">DAP - Delivered At Place</SelectItem>
                <SelectItem value="DPU">DPU - Delivered At Place Unloaded</SelectItem>
                <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                <SelectItem value="FAS">FAS - Free Alongside Ship</SelectItem>
                <SelectItem value="FOB">FOB - Free On Board</SelectItem>
                <SelectItem value="CFR">CFR - Cost and Freight</SelectItem>
                <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-600" />
            Regulatory Flags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(data.crossBorderDetails.regulatoryFlags || []).map((flag, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRegulatoryFlag(flag)}>
                {flag} ×
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add regulatory flag (e.g., Export controlled, Sanctions check) - Press Enter to add"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addRegulatoryFlag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
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
            <Label className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-orange-600" />
              Currency Exchange Details
            </Label>
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
    </div>
  );
};