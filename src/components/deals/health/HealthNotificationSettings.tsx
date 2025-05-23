
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react";

interface HealthNotificationSettingsProps {
  userId?: string;
}

const HealthNotificationSettings: React.FC<HealthNotificationSettingsProps> = ({ userId }) => {
  const { toast } = useToast();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(true);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings saved",
        description: "Your notification settings have been updated successfully"
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Health Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive health alert notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive health alerts via email
              </p>
            </div>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={setEmailEnabled} 
            />
          </div>

          {/* Critical Alerts Only */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Critical Alerts Only</Label>
              <p className="text-sm text-muted-foreground">
                Only send notifications for critical health thresholds
              </p>
            </div>
            <Switch 
              checked={criticalOnly} 
              onCheckedChange={setCriticalOnly} 
            />
          </div>
          
          {/* Email Address */}
          {emailEnabled && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              onClick={handleSaveSettings}
              disabled={saving || (emailEnabled && !email)}
            >
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Note:</p>
          <p>
            Email notifications are currently in development. In the meantime, all
            health alerts will be available in the dashboard and in-app notifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthNotificationSettings;
