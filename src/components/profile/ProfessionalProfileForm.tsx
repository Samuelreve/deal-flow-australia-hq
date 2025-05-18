
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/types/auth";

const formSchema = z.object({
  is_professional: z.boolean().default(false),
  professional_headline: z.string().optional(),
  professional_bio: z.string().optional(),
  professional_firm_name: z.string().optional(),
  professional_contact_email: z.string().email().optional().or(z.string().length(0)),
  professional_phone: z.string().optional(),
  professional_website: z.string().url().optional().or(z.string().length(0)),
  professional_location: z.string().optional(),
  // For simplicity, we'll handle specializations as a comma-separated string
  // In a real app, you might want a more sophisticated UI for this
  specializations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfessionalProfileFormProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfessionalProfileForm: React.FC<ProfessionalProfileFormProps> = ({
  profile,
  onUpdate
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const specializations = profile.professional_specializations
    ? Array.isArray(profile.professional_specializations) 
      ? profile.professional_specializations.join(", ")
      : ""
    : "";
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_professional: profile.is_professional || false,
      professional_headline: profile.professional_headline || "",
      professional_bio: profile.professional_bio || "",
      professional_firm_name: profile.professional_firm_name || "",
      professional_contact_email: profile.professional_contact_email || "",
      professional_phone: profile.professional_phone || "",
      professional_website: profile.professional_website || "",
      professional_location: profile.professional_location || "",
      specializations: specializations,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      // Convert comma-separated specializations to array
      const specializationsArray = values.specializations
        ? values.specializations.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const updates = {
        is_professional: values.is_professional,
        professional_headline: values.professional_headline || null,
        professional_bio: values.professional_bio || null,
        professional_firm_name: values.professional_firm_name || null,
        professional_contact_email: values.professional_contact_email || null,
        professional_phone: values.professional_phone || null,
        professional_website: values.professional_website || null,
        professional_location: values.professional_location || null,
        professional_specializations: specializationsArray.length > 0 ? specializationsArray : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your professional profile has been updated successfully.",
      });
      
      // Update the profile in the parent component
      onUpdate({
        ...profile,
        ...updates,
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="is_professional"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Professional Profile</FormLabel>
                <FormDescription>
                  Enable your professional profile to be listed in the directory.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("is_professional") && (
          <>
            <FormField
              control={form.control}
              name="professional_headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Business M&A Lawyer" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short headline describing your professional role.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professional_bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your experience and expertise..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professional_firm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm/Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Your firm or company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Melbourne, VIC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professional_contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="professional@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="professional_website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourwebsite.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations</FormLabel>
                  <FormControl>
                    <Input placeholder="M&A, Commercial Contracts, Property Law" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your specializations separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full">
          Save Professional Profile
        </Button>
      </form>
    </Form>
  );
};

export default ProfessionalProfileForm;
