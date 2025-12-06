
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, Shield, AlertTriangle, Users, Gavel, Ban, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const TermsOfServicePage = () => {
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
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: December 6, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Important Notice */}
          <Alert className="border-primary/50 bg-primary/5">
            <Scale className="h-4 w-4" />
            <AlertDescription>
              Please read these Terms of Service carefully before using Trustroom.ai. By accessing or using our platform, you agree to be bound by these terms.
            </AlertDescription>
          </Alert>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Introduction & Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to Trustroom.ai ("Platform", "Service", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our AI-powered business exchange platform and related services.
              </p>
              <p>
                <strong className="text-foreground">By accessing or using Trustroom.ai, you agree to:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>These Terms of Service</li>
                <li>Our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link></li>
                <li>Our <Link to="/ai-disclaimer" className="text-primary hover:underline">AI Disclaimer</Link></li>
                <li>Our <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link></li>
                <li>Any additional guidelines or policies we may publish</li>
              </ul>
              <p>
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
              <CardDescription>What Trustroom.ai provides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Trustroom.ai provides AI-powered tools for business transactions, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Deal management, tracking, and collaboration</li>
                <li>Document analysis, storage, and version control</li>
                <li>AI-powered contract review and insights</li>
                <li>Electronic signature integration via DocuSign</li>
                <li>Deal health monitoring and analytics</li>
                <li>Communication tools for deal participants</li>
              </ul>
              <Alert className="mt-4 border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> Trustroom.ai is a technology platform only. We do not provide legal, financial, tax, or professional advice. We are not a party to any transaction conducted through our platform.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* AI Services Disclaimer */}
          <Card className="border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                3. AI Services Disclaimer
              </CardTitle>
              <CardDescription>Critical information about AI-powered features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground">
                OUR AI-POWERED FEATURES ARE ASSISTIVE TOOLS ONLY AND DO NOT CONSTITUTE PROFESSIONAL ADVICE.
              </p>
              <p>You acknowledge and agree that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>No Legal Advice:</strong> AI analysis does not constitute legal advice and should not be relied upon as such</li>
                <li><strong>Professional Review Required:</strong> All AI-generated content must be reviewed by qualified professionals before any action is taken</li>
                <li><strong>Accuracy Not Guaranteed:</strong> AI outputs may contain errors, inaccuracies, or omissions</li>
                <li><strong>No Liability:</strong> Trustroom.ai is not responsible for decisions made based on AI recommendations</li>
                <li><strong>Training Data Limitations:</strong> AI may not reflect current laws, regulations, or best practices</li>
              </ul>
              <p className="mt-4">
                For complete AI-related terms, please review our{' '}
                <Link to="/ai-disclaimer" className="text-primary hover:underline font-medium">AI Disclaimer</Link>.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                4. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>When using Trustroom.ai, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the confidentiality and security of your account credentials</li>
                <li>Use the Service only for lawful business purposes</li>
                <li>Respect intellectual property rights of others</li>
                <li>Not attempt to circumvent security measures or access controls</li>
                <li>Not use the Service for any fraudulent, deceptive, or illegal activity</li>
                <li>Not upload malicious code, viruses, or harmful content</li>
                <li>Not interfere with or disrupt the Service or other users</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Obtain all necessary consents before uploading others' personal data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Account Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                5. Account Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">5.1 Account Creation</h4>
                  <p className="mt-2">
                    You must be at least 18 years old and have the legal capacity to enter into binding contracts. By creating an account, you represent that all information you provide is accurate and complete.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">5.2 Account Security</h4>
                  <p className="mt-2">
                    You are responsible for maintaining the security of your account and all activities that occur under your account. Notify us immediately of any unauthorized access or security breach.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">5.3 Account Termination</h4>
                  <p className="mt-2">
                    You may close your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">6.1 Our Property</h4>
                  <p className="mt-2">
                    The Service, including all software, designs, text, graphics, interfaces, and the selection and arrangement thereof, is owned by or licensed to Trustroom.ai and is protected by intellectual property laws.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">6.2 Your Content</h4>
                  <p className="mt-2">
                    You retain ownership of all content you upload to the Service. By uploading content, you grant us a limited license to store, process, and display your content as necessary to provide the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">6.3 Feedback</h4>
                  <p className="mt-2">
                    Any feedback, suggestions, or ideas you provide about the Service may be used by us without obligation to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                7. Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You may not use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Conduct fraudulent, illegal, or deceptive business transactions</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload, transmit, or distribute illegal content</li>
                <li>Attempt to gain unauthorized access to the Service or other accounts</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Engage in money laundering or terrorist financing</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-destructive" />
                8. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="font-medium text-foreground uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong>No Warranties:</strong> The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </li>
                <li>
                  <strong>Limitation of Damages:</strong> Trustroom.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.
                </li>
                <li>
                  <strong>Cap on Liability:</strong> Our total liability for any claims arising from or relating to these Terms or the Service shall not exceed the greater of (a) the amount you paid us in the twelve (12) months preceding the claim or (b) $100 AUD.
                </li>
                <li>
                  <strong>Third-Party Actions:</strong> We are not liable for any actions, content, or conduct of third parties, including other users of the Service.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle>9. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You agree to indemnify, defend, and hold harmless Trustroom.ai, its affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of or access to the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content uploaded to the Service</li>
                <li>Any transactions conducted through the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                10. Modifications to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material changes through the Service or by email. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
              <p>
                If you do not agree to the modified Terms, you must stop using the Service and close your account.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>11. Governing Law & Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in Sydney, Australia, except that either party may seek injunctive relief in any court of competent jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:legal@trustroom.ai" className="text-primary hover:underline">
                    legal@trustroom.ai
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Support:</strong>{' '}
                  <a href="mailto:support@trustroom.ai" className="text-primary hover:underline">
                    support@trustroom.ai
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <Separator />
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy →
            </Link>
            <Link to="/ai-disclaimer" className="text-sm text-muted-foreground hover:text-primary">
              AI Disclaimer →
            </Link>
            <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary">
              Cookie Policy →
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

export default TermsOfServicePage;
