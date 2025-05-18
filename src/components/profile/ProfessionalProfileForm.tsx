
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl, FormDescription, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/types/auth";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { professionalProfileSchema, formatSpecializations, ProfessionalProfileFormValues } from "./validation/professionalProfileSchema";
import { useProfessionalProfileForm } from "./hooks/useProfessionalProfileForm";
import ProfessionalFormFields from "./ProfessionalFormFields";

interface ProfessionalProfileFormProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onSaveSuccess?: () => void;
}

const ProfessionalProfileForm: React.FC<ProfessionalProfileFormProps> = ({
  profile,
  onUpdate,
  onSaveSuccess
}) => {
  const { user } = useAuth();
  
  // Convert array of specializations to comma-separated string for the form
  const specializations = formatSpecializations(profile.professional_specializations);
  
  const form = useForm<ProfessionalProfileFormValues>({
    resolver: zodResolver(professionalProfileSchema),
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
    mode: "onChange",
  });

  const { savingProfile, onSubmit } = useProfessionalProfileForm({
    profile,
    form,
    onUpdate,
    onSaveSuccess
  });

  const isProfessionalEnabled = form.watch("is_professional");

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
                  Enable your professional profile to be listed in the professionals directory.
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

        {isProfessionalEnabled && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <ProfessionalFormFields control={form.control} />
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={savingProfile}
        >
          {savingProfile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Professional Profile"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfessionalProfileForm;
