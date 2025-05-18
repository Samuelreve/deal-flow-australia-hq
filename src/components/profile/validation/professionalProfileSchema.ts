
import { z } from "zod";

// Schema for professional profile form validation
export const professionalProfileSchema = z.object({
  is_professional: z.boolean().default(false),
  professional_headline: z.string().max(100, {
    message: "Headline should be 100 characters or less",
  }).optional(),
  professional_bio: z.string().max(1000, {
    message: "Bio should be 1000 characters or less",
  }).optional(),
  professional_firm_name: z.string().max(100).optional(),
  professional_contact_email: z.string().email("Please enter a valid email address").optional().or(z.string().length(0)),
  professional_phone: z.string().max(20).optional(),
  professional_website: z.string().url("Please enter a valid URL").optional().or(z.string().length(0)),
  professional_location: z.string().max(100).optional(),
  // For simplicity, handling specializations as a comma-separated string
  specializations: z.string().optional(),
});

export type ProfessionalProfileFormValues = z.infer<typeof professionalProfileSchema>;

// Helper function to format specializations
export const formatSpecializations = (specializations: string[] | null | undefined): string => {
  if (!specializations) return "";
  return Array.isArray(specializations) ? specializations.join(", ") : "";
};

// Helper function to parse specializations from string to array
export const parseSpecializations = (specializationsString: string | undefined): string[] => {
  if (!specializationsString) return [];
  return specializationsString.split(',').map(s => s.trim()).filter(Boolean);
};
