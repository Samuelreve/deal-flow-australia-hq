
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormControl, FormDescription, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface NotificationSettingsFormValues {
  email_deal_updates: boolean;
  email_messages: boolean;
  email_document_comments: boolean;
  inapp_deal_updates: boolean;
  inapp_messages: boolean;
  inapp_document_comments: boolean;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // In a real application, this would be fetched from a notifications_settings table
  const form = useForm<NotificationSettingsFormValues>({
    defaultValues: {
      email_deal_updates: true,
      email_messages: true,
      email_document_comments: true,
      inapp_deal_updates: true,
      inapp_messages: true,
      inapp_document_comments: true,
    }
  });

  const onSubmit = async (data: NotificationSettingsFormValues) => {
    setLoading(true);
    
    try {
      // This would normally save to the database
      // await saveNotificationSettings(user.id, data);
      
      // For demo purposes, just show a success toast
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Notifications Section */}
        <div>
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Control which notifications are sent to your email address
          </p>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email_deal_updates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Deal Updates</FormLabel>
                    <FormDescription>
                      Receive emails when deal status changes or milestones are completed
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

            <FormField
              control={form.control}
              name="email_messages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>New Messages</FormLabel>
                    <FormDescription>
                      Receive emails about new messages in deal conversations
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

            <FormField
              control={form.control}
              name="email_document_comments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Document Comments</FormLabel>
                    <FormDescription>
                      Receive emails when someone comments on a document
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
          </div>
        </div>

        <Separator />

        {/* In-App Notifications Section */}
        <div>
          <h3 className="text-lg font-medium">In-App Notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Control which notifications appear within the application
          </p>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="inapp_deal_updates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Deal Updates</FormLabel>
                    <FormDescription>
                      Show notifications for deal status changes and milestone completions
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

            <FormField
              control={form.control}
              name="inapp_messages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>New Messages</FormLabel>
                    <FormDescription>
                      Show notifications for new messages in deal conversations
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

            <FormField
              control={form.control}
              name="inapp_document_comments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Document Comments</FormLabel>
                    <FormDescription>
                      Show notifications when someone comments on a document
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
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Notification Preferences"}
        </Button>
      </form>
    </Form>
  );
};

export default NotificationSettings;
