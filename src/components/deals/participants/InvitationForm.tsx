
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteParticipant } from "@/hooks/useInviteParticipant";
import { InvitationFormData } from "@/types/invitation";

// Define the subset of UserRole that we'll use for the form
type InviteeRole = "buyer" | "lawyer" | "admin";

const formSchema = z.object({
  inviteeEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  inviteeRole: z
    .enum(["buyer", "lawyer", "admin"] as const)
});

interface InvitationFormProps {
  dealId: string;
  onSubmitted: () => void;  // Changed from onInvitationSent to onSubmitted to match tests
}

const InvitationForm: React.FC<InvitationFormProps> = ({
  dealId,
  onSubmitted,  // Changed from onInvitationSent to onSubmitted
}) => {
  const { inviteParticipant, isSubmitting } = useInviteParticipant(dealId, onSubmitted);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inviteeEmail: "",
      inviteeRole: "buyer" as InviteeRole,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData: InvitationFormData = {
      inviteeEmail: values.inviteeEmail,
      inviteeRole: values.inviteeRole as UserRole,
    };

    const success = await inviteParticipant(formData);
    if (success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="inviteeEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="john.doe@example.com"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inviteeRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
        </Button>
      </form>
    </Form>
  );
};

export default InvitationForm;
