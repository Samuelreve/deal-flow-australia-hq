
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, AlertTriangle, Shield, Scale, Info, XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const AIDisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Disclaimers & Limitations</h1>
              <p className="text-muted-foreground">Last updated: December 6, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Critical Warning */}
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">Critical Notice</AlertTitle>
            <AlertDescription className="mt-2 text-base">
              <strong>Trustroom.ai's AI features are assistive tools only and do NOT constitute legal, financial, tax, or professional advice.</strong> All AI-generated content, analyses, recommendations, and insights must be reviewed and verified by qualified professionals before any action is taken.
            </AlertDescription>
          </Alert>

          {/* Nature of AI Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Nature of AI Services
              </CardTitle>
              <CardDescription>Understanding what our AI can and cannot do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Trustroom.ai utilizes artificial intelligence and machine learning technologies to assist users with document analysis, contract review, deal insights, and business transaction support. It is essential to understand the following:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    What AI CAN Do
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      Identify patterns and extract key information from documents
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      Highlight potential areas of concern for professional review
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      Summarize lengthy documents and contracts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      Provide general information and educational content
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      Assist with organization and workflow efficiency
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    What AI CANNOT Do
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      Replace qualified legal counsel or professional advice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      Guarantee accuracy or completeness of analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      Make legally binding decisions on your behalf
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      Account for all jurisdictional variations and recent legal changes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      Understand unique context that only professionals can assess
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Professional Advice */}
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-warning" />
                Not Professional Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">
                TRUSTROOM.AI DOES NOT PROVIDE LEGAL, FINANCIAL, TAX, ACCOUNTING, OR OTHER PROFESSIONAL ADVICE.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  All information, content, and AI-generated outputs provided through Trustroom.ai are for <strong>general informational and educational purposes only</strong>. This includes, but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Contract analysis and summaries</li>
                  <li>Risk assessments and deal health scores</li>
                  <li>Document reviews and clause identification</li>
                  <li>AI-generated recommendations and insights</li>
                  <li>Question-and-answer responses about documents</li>
                  <li>Deal milestone suggestions and checklists</li>
                </ul>
                <p className="font-medium text-foreground mt-4">
                  You must consult with qualified legal, financial, and business professionals before making any decisions based on information obtained through our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Known AI Limitations
              </CardTitle>
              <CardDescription>Important limitations you should be aware of</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Accuracy Limitations</h4>
                  <p className="text-sm text-muted-foreground">
                    AI systems may produce inaccurate, incomplete, or outdated information. They can "hallucinate" (generate plausible-sounding but incorrect content) and may miss critical nuances that a trained professional would identify.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Context Limitations</h4>
                  <p className="text-sm text-muted-foreground">
                    AI cannot fully understand the complete context of your business situation, industry-specific requirements, jurisdictional variations, or the strategic implications of decisions. Human judgment is essential.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Training Data Limitations</h4>
                  <p className="text-sm text-muted-foreground">
                    AI models are trained on historical data and may not reflect the most recent legal changes, regulatory updates, or market conditions. Always verify current requirements with appropriate professionals.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2">Bias and Errors</h4>
                  <p className="text-sm text-muted-foreground">
                    AI systems may contain inherent biases from training data and can make systematic errors. Results should always be critically evaluated and verified through independent means.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">By using Trustroom.ai's AI features, you acknowledge and agree that:</p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>You will <strong>independently verify</strong> all AI-generated content, analyses, and recommendations before relying on them.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>You will <strong>consult qualified professionals</strong> (lawyers, accountants, financial advisors) for all significant business decisions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>You <strong>assume full responsibility</strong> for any decisions made using information from our platform.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>You understand that AI outputs are <strong>not a substitute</strong> for professional advice tailored to your specific situation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>You will <strong>report any errors or issues</strong> you discover in AI-generated content to help us improve our services.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-destructive" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Trustroom.ai, its affiliates, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from your use of or reliance on AI-generated content.
                </li>
                <li>
                  We provide no warranties, express or implied, regarding the accuracy, completeness, reliability, or suitability of AI-generated content for any purpose.
                </li>
                <li>
                  Any reliance on AI-generated content is at your sole risk.
                </li>
                <li>
                  Our total liability for any claims arising from AI services shall not exceed the amount you paid for our services in the preceding 12 months.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Usage in AI */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Data in AI Processing</CardTitle>
              <CardDescription>Transparency about AI data handling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>When you use our AI features:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your documents are processed securely to generate analyses and insights</li>
                <li>We do not use your specific documents to train our AI models</li>
                <li>AI processing is performed on secure, encrypted infrastructure</li>
                <li>Document content is not shared with third parties except as necessary to provide the service</li>
                <li>You retain full ownership of your documents and data</li>
                <li>We implement industry-standard security measures to protect your information</li>
              </ul>
              <p className="mt-4">
                For complete details, please review our{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update this AI Disclaimer from time to time to reflect changes in our AI capabilities, legal requirements, or industry best practices. We encourage you to review this page periodically.
              </p>
              <p>
                Continued use of our AI features after any changes constitutes acceptance of the updated disclaimer.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Our AI?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions about our AI services, limitations, or this disclaimer, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:support@trustroom.ai" 
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  support@trustroom.ai
                </a>
                <Separator orientation="vertical" className="hidden sm:block h-6" />
                <Link to="/faq" className="text-primary hover:underline">
                  View our FAQ
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service →
            </Link>
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy →
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary">
              FAQ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDisclaimerPage;
