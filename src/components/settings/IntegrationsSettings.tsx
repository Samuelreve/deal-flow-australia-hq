import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DocuSignConnection from './DocuSignConnection';

const IntegrationsSettings: React.FC = () => {
  const { toast } = useToast();

  const handleConnectService = (serviceName: string) => {
    toast({
      title: `Connect to ${serviceName}`,
      description: `Integration with ${serviceName} is not yet implemented.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">E-Signature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your e-signature service to enable document signing
        </p>
        
        <DocuSignConnection />
      </div>

      <div>
        <h3 className="text-lg font-medium">Other Integrations</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your account with external services
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                Connect your calendar to sync deal deadlines and meetings
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => handleConnectService("Calendar")}>
                Connect Calendar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cloud Storage</CardTitle>
              <CardDescription>
                Connect cloud storage services for document management
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => handleConnectService("Cloud Storage")}>
                Connect Storage
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CRM</CardTitle>
              <CardDescription>
                Connect your CRM to sync contacts and deal information
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => handleConnectService("CRM")}>
                Connect CRM
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">API Access</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Access keys and developer tools for custom integrations
        </p>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              API access is not yet available. Coming soon in a future update.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>
              Generate API Key
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
