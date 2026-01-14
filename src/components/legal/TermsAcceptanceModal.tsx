import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, Shield, Bot, ExternalLink } from 'lucide-react';
import { TERMS_LAST_UPDATED, PRIVACY_LAST_UPDATED } from '@/lib/legal-versions';

interface TermsAcceptanceModalProps {
  open: boolean;
  termsVersion: string;
  privacyVersion: string;
  onAccept: () => Promise<boolean>;
  onDecline: () => Promise<void>;
}

export function TermsAcceptanceModal({
  open,
  termsVersion,
  privacyVersion,
  onAccept,
  onDecline
}: TermsAcceptanceModalProps) {
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const canAccept = termsChecked && privacyChecked && !isSubmitting;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline();
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Welcome to Trustroom.ai
          </DialogTitle>
          <DialogDescription>
            Please review and accept our Terms & Conditions and Privacy Policy to continue.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="terms" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 border rounded-md p-4 bg-muted/30">
            <TabsContent value="terms" className="mt-0 space-y-4">
              <div className="text-sm text-muted-foreground">
                Version {termsVersion} • Last updated: {TERMS_LAST_UPDATED}
              </div>
              
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-base">Key Points Summary</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">1. Service Usage</h4>
                    <p className="text-muted-foreground">Trustroom.ai provides AI-assisted deal management tools. You must be 18+ and use the service lawfully.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">2. Account Responsibility</h4>
                    <p className="text-muted-foreground">You are responsible for maintaining account security and all activities under your account.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">3. Content Ownership</h4>
                    <p className="text-muted-foreground">You retain ownership of your content. We may use anonymized data to improve services.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">4. Subscription & Payments</h4>
                    <p className="text-muted-foreground">Paid plans are billed according to your selected plan. Refunds are provided per our refund policy.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">5. Limitation of Liability</h4>
                    <p className="text-muted-foreground">Our liability is limited to the amount paid for the service in the 12 months prior to any claim.</p>
                  </div>
                </div>

                <a 
                  href="/terms-of-service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Read full Terms & Conditions
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0 space-y-4">
              <div className="text-sm text-muted-foreground">
                Version {privacyVersion} • Last updated: {PRIVACY_LAST_UPDATED}
              </div>
              
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-base">Key Points Summary</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">1. Data Collection</h4>
                    <p className="text-muted-foreground">We collect account information, usage data, and content you upload to provide our services.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">2. Data Usage</h4>
                    <p className="text-muted-foreground">Your data is used to provide services, improve AI models (with anonymization), and communicate with you.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">3. Data Security</h4>
                    <p className="text-muted-foreground">We use industry-standard encryption and security measures to protect your data.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">4. Third-Party Sharing</h4>
                    <p className="text-muted-foreground">We only share data with service providers necessary to operate the platform (hosting, payments, AI).</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">5. Your Rights</h4>
                    <p className="text-muted-foreground">You can access, correct, or delete your data. Contact support for data requests.</p>
                  </div>
                </div>

                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Read full Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* AI Warning */}
        <Alert className="border-warning/50 bg-warning/10">
          <Bot className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">AI-Powered Features</AlertTitle>
          <AlertDescription className="text-sm">
            Trustroom.ai uses artificial intelligence to assist with deal management. AI outputs are 
            suggestions only and should not replace professional legal, financial, or business advice. 
            Always verify AI-generated content before acting on it.
          </AlertDescription>
        </Alert>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={termsChecked}
              onCheckedChange={(checked) => setTermsChecked(checked === true)}
              disabled={isSubmitting}
            />
            <span className="text-sm leading-tight">
              I have read and agree to the{' '}
              <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                Terms & Conditions
              </a>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={privacyChecked}
              onCheckedChange={(checked) => setPrivacyChecked(checked === true)}
              disabled={isSubmitting}
            />
            <span className="text-sm leading-tight">
              I have read and agree to the{' '}
              <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </a>
              {' '}and consent to the processing of my data as described
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isSubmitting || isDeclining}
            className="flex-1"
          >
            {isDeclining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              'Decline & Exit'
            )}
          </Button>
          
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Accept & Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
