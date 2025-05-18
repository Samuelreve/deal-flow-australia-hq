
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BuildingIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { DealFormData } from './types';

interface BusinessDetailsSectionProps {
  form: UseFormReturn<DealFormData>;
}

const BusinessDetailsSection: React.FC<BusinessDetailsSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <BuildingIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Business Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Trading Name</FormLabel>
                <FormControl>
                  <Input placeholder="Coastal Cafe" {...field} />
                </FormControl>
                <FormDescription>
                  The primary trading name of the business
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessLegalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Entity Name</FormLabel>
                <FormControl>
                  <Input placeholder="Coastal Cafe Pty Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessTradingNames"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Trading Names</FormLabel>
                <FormControl>
                  <Input placeholder="The Beach Bistro, Coastal Catering" {...field} />
                </FormControl>
                <FormDescription>
                  Separate multiple trading names with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessLegalEntity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Entity Type</FormLabel>
                <FormControl>
                  <Input placeholder="Pty Ltd, Sole Trader, Partnership" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessABN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Australian Business Number (ABN)</FormLabel>
                <FormControl>
                  <Input placeholder="12 345 678 901" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessACN"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Australian Company Number (ACN)</FormLabel>
                <FormControl>
                  <Input placeholder="123 456 789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessRegisteredAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered Business Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business St, Sydney NSW 2000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessPrincipalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Principal Place of Business</FormLabel>
                <FormControl>
                  <Input placeholder="42 Main St, Melbourne VIC 3000" {...field} />
                </FormControl>
                <FormDescription>
                  If different from registered address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary State/Territory</FormLabel>
                <FormControl>
                  <Input placeholder="NSW, VIC, QLD, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Food & Beverage, Technology, Retail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="yearsInOperation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years in Operation</FormLabel>
                <FormControl>
                  <Input placeholder="5" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessDetailsSection;
