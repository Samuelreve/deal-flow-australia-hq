
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock, Share2, Globe, UserCheck, Trash2, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicyPage = () => {
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
            <div className="p-2 bg-success/10 rounded-lg">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: December 6, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Commitment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                At Trustroom.ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our AI-powered business exchange platform.
              </p>
              <p>
                We are committed to transparency about our data practices and ensuring your information is handled with the highest standards of security and privacy.
              </p>
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  By using Trustroom.ai, you consent to the data practices described in this policy. If you do not agree, please do not use our Service.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
              <CardDescription>Types of data we gather about you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                  <li><strong>Profile Information:</strong> Professional details, company name, role, avatar</li>
                  <li><strong>Business Information:</strong> Deal details, transaction data, party information</li>
                  <li><strong>Documents:</strong> Contracts, agreements, and files you upload for analysis</li>
                  <li><strong>Communications:</strong> Messages, comments, and feedback you send through the platform</li>
                  <li><strong>Payment Information:</strong> Billing details processed through secure payment providers</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">Information Collected Automatically:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, timestamps</li>
                  <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
                  <li><strong>Cookies & Tracking:</strong> Session data, preferences (see our <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>)</li>
                  <li><strong>Log Data:</strong> Server logs, error reports, performance data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Information from Third Parties:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Authentication Providers:</strong> If you sign in via Google or Apple</li>
                  <li><strong>E-Signature Services:</strong> DocuSign signing status and completion data</li>
                  <li><strong>Deal Participants:</strong> Information shared by other users in your deals</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
              <CardDescription>Purposes for processing your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide Services:</strong> Operate, maintain, and improve Trustroom.ai</li>
                <li><strong>AI Processing:</strong> Analyze documents and generate insights using AI (see AI section below)</li>
                <li><strong>Account Management:</strong> Create and manage your account, authenticate access</li>
                <li><strong>Communication:</strong> Send service notifications, updates, and respond to inquiries</li>
                <li><strong>Security:</strong> Detect, prevent, and address fraud, abuse, and security issues</li>
                <li><strong>Analytics:</strong> Understand usage patterns and improve our platform</li>
                <li><strong>Legal Compliance:</strong> Meet legal obligations and enforce our terms</li>
                <li><strong>Marketing:</strong> With your consent, send promotional communications</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Data Processing */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI & Data Processing
              </CardTitle>
              <CardDescription>How we handle data for AI features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                When you use our AI-powered features (document analysis, contract review, AI assistant), your data is processed as follows:
              </p>
              <div className="grid gap-4 mt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-2">Document Processing</h4>
                  <p className="text-sm">
                    Documents you upload are processed by our AI systems to extract text, identify key terms, and generate analyses. This processing is done securely and the content is not shared with third parties except as necessary to provide the service.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-2">No Training on Your Data</h4>
                  <p className="text-sm">
                    <strong>We do not use your specific documents, contracts, or business data to train our AI models.</strong> Your content remains your property and is used solely to provide you with analysis and insights.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-2">Third-Party AI Providers</h4>
                  <p className="text-sm">
                    We may use third-party AI services to power some features. When doing so, your data is transmitted securely and processed according to strict data processing agreements that prohibit training on your content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                How We Share Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong>With Your Consent:</strong> When you explicitly authorize sharing
                </li>
                <li>
                  <strong>Deal Participants:</strong> With other authorized participants in your deals (based on permissions)
                </li>
                <li>
                  <strong>Service Providers:</strong> With vendors who help us operate our platform (hosting, analytics, payment processing, e-signatures)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                </li>
                <li>
                  <strong>Aggregated Data:</strong> We may share anonymized, aggregated statistics that cannot identify individuals
                </li>
              </ul>
              <p className="mt-4 font-medium text-foreground">
                We do not sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Strict authentication and role-based access to systems</li>
                <li><strong>Infrastructure Security:</strong> Secure cloud infrastructure with regular security audits</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for security threats and anomalies</li>
                <li><strong>Incident Response:</strong> Established procedures for responding to security incidents</li>
                <li><strong>Employee Training:</strong> Regular security awareness training for all staff</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your information, no system is completely secure. We cannot guarantee absolute security of data transmitted over the internet.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We retain your information as follows:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active, plus a reasonable period afterward</li>
                <li><strong>Deal Data:</strong> Retained for the duration of the deal and as long as required by participants</li>
                <li><strong>Documents:</strong> Stored while your account is active; deleted upon account closure unless required by law</li>
                <li><strong>Usage Logs:</strong> Typically retained for 12-24 months for analytics and security</li>
                <li><strong>Legal Holds:</strong> Data may be retained longer if required for legal proceedings or compliance</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Your Privacy Rights
              </CardTitle>
              <CardDescription>How to exercise control over your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request your data in a portable, machine-readable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests or for marketing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@trustroom.ai" className="text-primary hover:underline">
                  privacy@trustroom.ai
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Account Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You can request deletion of your account and associated data at any time through Settings or by contacting us. Upon deletion:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your profile and account information will be permanently deleted</li>
                <li>Documents you uploaded will be removed</li>
                <li>You will lose access to all deals you participated in</li>
                <li>Some data may be retained as required by law or for legitimate business purposes</li>
                <li>Anonymized/aggregated data may be retained for analytics</li>
              </ul>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Trustroom.ai operates globally. Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Compliance with applicable data transfer frameworks</li>
                <li>Verification that recipients provide adequate data protection</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Trustroom.ai is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child, we will promptly delete it.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. We may also notify you by email for significant changes.
              </p>
              <p>
                Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                For privacy-related questions, to exercise your rights, or to report concerns:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Privacy Inquiries:</strong>{' '}
                  <a href="mailto:privacy@trustroom.ai" className="text-primary hover:underline">
                    privacy@trustroom.ai
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">General Support:</strong>{' '}
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
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service →
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

export default PrivacyPolicyPage;
