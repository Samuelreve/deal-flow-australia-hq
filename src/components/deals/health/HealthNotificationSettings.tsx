
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthNotificationSettingsProps {
  userId?: string;
}

const HealthNotificationSettings: React.FC<HealthNotificationSettingsProps> = ({ userId }) => {
  const [emailDealUpdates, setEmailDealUpdates] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailDocComments, setEmailDocComments] = useState(true);
  const [inappDealUpdates, setInappDealUpdates] = useState(true);
  const [inappMessages, setInappMessages] = useState(true);
  const [inappDocComments, setInappDocComments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setEmailDealUpdates(data.email_deal_updates);
          setEmailMessages(data.email_messages);
          setEmailDocComments(data.email_document_comments);
          setInappDealUpdates(data.inapp_deal_updates);
          setInappMessages(data.inapp_messages);
          setInappDocComments(data.inapp_document_comments);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const handleSaveSettings = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const settings = {
        user_id: userId,
        email_deal_updates: emailDealUpdates,
        email_messages: emailMessages,
        email_document_comments: emailDocComments,
        inapp_deal_updates: inappDealUpdates,
        inapp_messages: inappMessages,
        inapp_document_comments: inappDocComments,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notification_settings')
        .upsert(settings, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive notifications about deal health and updates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Notifications Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Deal Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about deal status changes and health alerts
                </p>
              </div>
              <Switch 
                checked={emailDealUpdates} 
                onCheckedChange={setEmailDealUpdates} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when you get new messages
                </p>
              </div>
              <Switch 
                checked={emailMessages} 
                onCheckedChange={setEmailMessages} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Document Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when someone comments on your documents
                </p>
              </div>
              <Switch 
                checked={emailDocComments} 
                onCheckedChange={setEmailDocComments} 
              />
            </div>
          </div>
        </div>

        {/* In-App Notifications Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Deal Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notifications for deal changes
                </p>
              </div>
              <Switch 
                checked={inappDealUpdates} 
                onCheckedChange={setInappDealUpdates} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notifications for new messages
                </p>
              </div>
              <Switch 
                checked={inappMessages} 
                onCheckedChange={setInappMessages} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Document Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Show in-app notifications for document comments
                </p>
              </div>
              <Switch 
                checked={inappDocComments} 
                onCheckedChange={setInappDocComments} 
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthNotificationSettings;
