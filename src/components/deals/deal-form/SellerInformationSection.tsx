
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { UserIcon, LockIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { DealFormData } from './types';

interface SellerInformationSectionProps {
  form: UseFormReturn<DealFormData>;
}

const SellerInformationSection: React.FC<SellerInformationSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Seller Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="sellerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Seller Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Auto-filled from your profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellerEntityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Entity Type</FormLabel>
                <FormControl>
                  <Input placeholder="Individual, Pty Ltd, Trust" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellerRepresentative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Representative (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Name and firm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start border-t p-6 mt-2">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4" />
          <p>Your information is protected by enterprise-grade encryption and will only be shared with authorized participants.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SellerInformationSection;
