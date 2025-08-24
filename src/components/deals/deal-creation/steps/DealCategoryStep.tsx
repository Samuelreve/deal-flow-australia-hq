import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, Home, Globe, Gamepad2, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepProps, DEAL_CATEGORIES } from '../types';
import { toast } from 'sonner';

const categoryIcons = {
  business_sale: Building2,
  ip_transfer: Briefcase,
  real_estate: Home,
  cross_border: Globe,
  micro_deals: Gamepad2,
  other: Package
};

const DealCategoryStep: React.FC<StepProps> = ({ data, updateData, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.dealCategory) {
      newErrors.dealCategory = 'Please select a deal category to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      // Check if "Other" category is selected and show alert
      if (data.dealCategory === 'other') {
        toast.info("Coming Soon! 🚀", {
          description: "The 'Other' deal category will be enabled in the future with AI prompts for custom deal creation. Stay tuned!",
          duration: 4000,
        });
        return;
      }
      onNext();
    }
  };

  const handleCategorySelect = (categoryValue: string) => {
    updateData({ dealCategory: categoryValue });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Choose Your Deal Category</h2>
          <p className="text-muted-foreground">
            Select the type of deal you want to create. This will customize the form fields for your specific needs.
          </p>
        </div>
      </div>

      {errors.dealCategory && (
        <Alert variant="destructive">
          <AlertDescription>{errors.dealCategory}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEAL_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.value as keyof typeof categoryIcons] || Package;
          const isSelected = data.dealCategory === category.value;
          
          return (
            <Card 
              key={category.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => handleCategorySelect(category.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {category.label}
                      {isSelected && <Badge variant="secondary">Selected</Badge>}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
                
                {/* Show specific features for each category */}
                <div className="mt-3 text-xs text-muted-foreground">
                  {category.value === 'business_sale' && (
                    <ul className="space-y-1">
                      <li>• Business valuation support</li>
                      <li>• Asset and liability tracking</li>
                      <li>• Due diligence document management</li>
                    </ul>
                  )}
                  {category.value === 'ip_transfer' && (
                    <ul className="space-y-1">
                      <li>• Patent and trademark tracking</li>
                      <li>• IP valuation tools</li>
                      <li>• Registration number validation</li>
                    </ul>
                  )}
                  {category.value === 'real_estate' && (
                    <ul className="space-y-1">
                      <li>• Property details and zoning</li>
                      <li>• Settlement date tracking</li>
                      <li>• Council and compliance checks</li>
                    </ul>
                  )}
                  {category.value === 'cross_border' && (
                    <ul className="space-y-1">
                      <li>• Multi-currency support</li>
                      <li>• Regulatory compliance tracking</li>
                      <li>• International tax implications</li>
                    </ul>
                  )}
                  {category.value === 'micro_deals' && (
                    <ul className="space-y-1">
                      <li>• Condition and rarity assessment</li>
                      <li>• Authenticity verification</li>
                      <li>• Collectible-specific fields</li>
                    </ul>
                  )}
                  {category.value === 'other' && (
                    <ul className="space-y-1">
                      <li>• Flexible custom fields</li>
                      <li>• General deal structure</li>
                      <li>• Standard legal framework</li>
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleNext} 
          size="lg" 
          className="min-w-[160px]"
          disabled={!data.dealCategory}
        >
          Continue to Business Info
        </Button>
      </div>
    </div>
  );
};

export default DealCategoryStep;