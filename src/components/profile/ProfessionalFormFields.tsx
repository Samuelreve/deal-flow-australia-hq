
import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfessionalProfileFormValues } from "./validation/professionalProfileSchema";

interface ProfessionalFormFieldsProps {
  control: Control<ProfessionalProfileFormValues>;
}

const ProfessionalFormFields: React.FC<ProfessionalFormFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="professional_headline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Headline*</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. Business M&A Lawyer" 
                {...field} 
                className="focus:border-primary" 
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              A short headline describing your professional role (100 characters max).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="professional_bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your experience and expertise..."
                className="resize-y min-h-[120px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Provide details about your professional background and areas of expertise.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="professional_firm_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm/Company</FormLabel>
              <FormControl>
                <Input placeholder="Your firm or company name" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="professional_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Melbourne, VIC" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="professional_contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="professional@email.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                This email will be visible to potential clients.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="professional_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Your contact number" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="professional_website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input placeholder="https://yourwebsite.com" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="specializations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specializations</FormLabel>
            <FormControl>
              <Input placeholder="M&A, Commercial Contracts, Property Law" {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Enter your specializations separated by commas.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ProfessionalFormFields;
