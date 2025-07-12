
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfServicePage = () => {
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
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
                <FileText className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to Trustroom.ai! These Terms of Service ("Terms") govern your use of our 
                AI-powered business exchange platform and document management services.
              </p>
              <p>
                By accessing or using Trustroom.ai, you agree to be bound by these Terms. 
                If you disagree with any part of these terms, you may not access the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Trustroom.ai provides AI-powered tools for business transactions, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Deal management and tracking</li>
                <li>Document analysis and contract review</li>
                <li>AI-powered insights and recommendations</li>
                <li>Collaboration tools for business professionals</li>
                <li>Health monitoring for business deals</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>When using Trustroom.ai, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful business purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to circumvent security measures</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Services Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                AI Services Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our AI-powered features are provided as tools to assist your business decisions. 
                However, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI analysis should not replace professional legal or financial advice</li>
                <li>All AI-generated content should be reviewed by qualified professionals</li>
                <li>Trustroom.ai is not responsible for decisions made based solely on AI recommendations</li>
                <li>AI services may have limitations and occasional inaccuracies</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Trustroom.ai provides services "as is" without warranties of any kind. 
                We shall not be liable for any indirect, incidental, special, or consequential damages 
                resulting from your use of our services.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@trustroom.ai" className="text-primary hover:underline">
                  legal@trustroom.ai
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
