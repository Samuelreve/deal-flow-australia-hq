
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccountInformation from '@/components/settings/AccountInformation';
import { useTour } from '@/contexts/TourContext';
import { RotateCcw, Sparkles } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { resetTour, isTourCompleted } = useTour();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <div className="grid gap-6">
          <AccountInformation />
          
          {/* Platform Tour Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Platform Tour
              </CardTitle>
              <CardDescription>
                Take a guided tour of Trustroom.ai's features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isTourCompleted 
                      ? "You've completed the tour. Restart it anytime to refresh your memory."
                      : "Learn about all the features available to you."}
                  </p>
                </div>
                <Button onClick={resetTour} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Restart Tour
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Other Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Additional settings will be available here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
