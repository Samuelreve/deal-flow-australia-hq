
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileTextIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { DealFormData } from './types';

interface DealInformationSectionProps {
  form: UseFormReturn<DealFormData>;
}

const DealInformationSection: React.FC<DealInformationSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileTextIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-medium">Deal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Title</FormLabel>
                <FormControl>
                  <Input placeholder="Sale of Coastal Cafe" required {...field} />
                </FormControl>
                <FormDescription>
                  A clear name that identifies this transaction
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          

          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="$500,000" {...field} />
                </FormControl>
                <FormDescription>
                  You can update or refine this figure later
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetCompletionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Completion Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="col-span-1 md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about the business sale, including key assets, growth potential, and reason for sale..."
                      className="min-h-32"
                      required
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="keyAssetsIncluded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Assets Included</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Equipment, intellectual property, customer lists, etc."
                    className="min-h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keyAssetsExcluded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Assets Excluded</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Personal items, selected equipment, etc."
                    className="min-h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2">
            <FormField
              control={form.control}
              name="reasonForSelling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Selling</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Retirement, relocation, strategic exit, etc."
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealInformationSection;
