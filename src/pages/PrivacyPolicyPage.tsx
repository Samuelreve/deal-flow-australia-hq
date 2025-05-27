
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: May 27, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At DealPilot, we take your privacy seriously. This Privacy Policy explains how we 
                collect, use, and protect your personal information when you use our AI-powered 
                business exchange platform.
              </p>
              <p>
                We are committed to transparency about our data practices and ensuring your 
                information is handled with the highest standards of security and privacy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">Personal Information:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Professional profile information</li>
                <li>Account credentials and preferences</li>
              </ul>
              
              <h3 className="font-semibold mt-4">Business Information:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Deal and transaction data</li>
                <li>Document content for analysis</li>
                <li>Communication and collaboration data</li>
              </ul>

              <h3 className="font-semibold mt-4">Usage Data:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platform usage patterns and analytics</li>
                <li>Feature interaction data</li>
                <li>Performance and error logs</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and improve our AI-powered services</li>
                <li>Analyze documents and generate insights</li>
                <li>Facilitate business collaborations</li>
                <li>Send important service notifications</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI and Data Processing */}
          <Card>
            <CardHeader>
              <CardTitle>AI and Data Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our AI services process your business documents and data to provide insights 
                and recommendations. We ensure that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Document analysis is performed securely</li>
                <li>AI models are trained without using your specific data</li>
                <li>Processed data is encrypted and access-controlled</li>
                <li>You maintain ownership of your business information</li>
              </ul>
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
            <CardContent className="space-y-4">
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers and infrastructure</li>
                <li>Regular backup and disaster recovery procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and review your personal data</li>
                <li>Request corrections to inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of certain data processing activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                For privacy-related questions or to exercise your rights, contact us at{' '}
                <a href="mailto:privacy@dealpilot.com" className="text-primary hover:underline">
                  privacy@dealpilot.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
