
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Mail, 
  Smartphone,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { toast } from 'sonner';

interface NotificationSettings {
  realTimeUpdates: boolean;
  healthAlerts: boolean;
  thresholdBreaches: boolean;
  significantChanges: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  alertMinimumChange: number;
}

interface HealthNotificationCenterProps {
  userId?: string;
}

const HealthNotificationCenter: React.FC<HealthNotificationCenterProps> = ({ userId }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    realTimeUpdates: true,
    healthAlerts: true,
    thresholdBreaches: true,
    significantChanges: true,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    alertMinimumChange: 5
  });

  const [testNotification, setTestNotification] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(`healthNotifications_${userId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [userId]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`healthNotifications_${userId}`, JSON.stringify(settings));
    }
  }, [settings, userId]);

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Notification settings updated');
  };

  const sendTestNotification = () => {
    setTestNotification(true);
    
    // Test different types of notifications
    setTimeout(() => {
      toast.success('Health Score Improved', {
        description: 'Test Deal: Health score increased to 85% (+10%)',
        duration: 3000
      });
    }, 500);

    setTimeout(() => {
      toast.warning('Health Alert', {
        description: 'Test Deal: Health score dropped below warning threshold (45%)',
        duration: 3000
      });
    }, 1500);

    setTimeout(() => {
      toast.error('Critical Alert', {
        description: 'Test Deal: Health score reached critical level (25%)',
        duration: 3000
      });
      setTestNotification(false);
    }, 2500);
  };

  const playNotificationSound = () => {
    if (settings.soundEnabled) {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Center
        </CardTitle>
        <CardDescription>
          Configure how you receive health monitoring alerts and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Updates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <Label htmlFor="realtime">Real-time Updates</Label>
            </div>
            <Switch
              id="realtime"
              checked={settings.realTimeUpdates}
              onCheckedChange={(checked) => updateSetting('realTimeUpdates', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Receive live notifications when deal health scores change
          </p>
        </div>

        <Separator />

        {/* Health Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <Label htmlFor="alerts">Health Alerts</Label>
            </div>
            <Switch
              id="alerts"
              checked={settings.healthAlerts}
              onCheckedChange={(checked) => updateSetting('healthAlerts', checked)}
            />
          </div>
          
          {settings.healthAlerts && (
            <div className="ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="thresholds" className="text-sm">Threshold breaches</Label>
                <Switch
                  id="thresholds"
                  checked={settings.thresholdBreaches}
                  onCheckedChange={(checked) => updateSetting('thresholdBreaches', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="changes" className="text-sm">Significant changes (±{settings.alertMinimumChange}%)</Label>
                <Switch
                  id="changes"
                  checked={settings.significantChanges}
                  onCheckedChange={(checked) => updateSetting('significantChanges', checked)}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Delivery Methods */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Delivery Methods
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="push">Push notifications</Label>
              </div>
              <Switch
                id="push"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email">Email notifications</Label>
              </div>
              <Switch
                id="email"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <Label htmlFor="sound">Sound alerts</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
                {settings.soundEnabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playNotificationSound}
                    className="text-xs"
                  >
                    Test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Test Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send sample notifications to test your settings
            </p>
          </div>
          <Button 
            onClick={sendTestNotification}
            disabled={testNotification}
            variant="outline"
          >
            {testNotification ? 'Sending...' : 'Send Test'}
          </Button>
        </div>

        {/* Status Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Current Settings</h4>
          <div className="flex flex-wrap gap-2">
            {settings.realTimeUpdates && <Badge variant="secondary">Real-time</Badge>}
            {settings.healthAlerts && <Badge variant="secondary">Health Alerts</Badge>}
            {settings.pushNotifications && <Badge variant="secondary">Push</Badge>}
            {settings.emailNotifications && <Badge variant="secondary">Email</Badge>}
            {settings.soundEnabled && <Badge variant="secondary">Sound</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthNotificationCenter;
