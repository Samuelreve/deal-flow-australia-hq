
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, BarChart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CookiePolicyPage = () => {
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cookie className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
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
                <Cookie className="h-5 w-5" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                improving our services.
              </p>
              <p>
                This Cookie Policy explains how DealPilot uses cookies and similar technologies 
                on our platform.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Essential Cookies
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  These cookies are necessary for the platform to function properly.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Authentication and security</li>
                  <li>Session management</li>
                  <li>Basic functionality and navigation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <BarChart className="h-4 w-4" />
                  Analytics Cookies
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  These help us understand how users interact with our platform.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Usage statistics and analytics</li>
                  <li>Performance monitoring</li>
                  <li>Feature usage tracking</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4" />
                  Functional Cookies
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  These enhance your experience by remembering your preferences.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Language and region preferences</li>
                  <li>Theme and display settings</li>
                  <li>User interface customizations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use certain third-party services that may set their own cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>AI Services:</strong> For document analysis and processing</li>
                <li><strong>Analytics Providers:</strong> To understand platform usage</li>
                <li><strong>Security Services:</strong> For fraud prevention and security</li>
                <li><strong>Cloud Infrastructure:</strong> For reliable service delivery</li>
              </ul>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You can manage cookies in several ways:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Browser Settings</h4>
                  <p className="text-sm text-gray-600">
                    Most browsers allow you to control cookies through their settings. 
                    You can block or delete cookies, though this may affect functionality.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Platform Settings</h4>
                  <p className="text-sm text-gray-600">
                    You can adjust your preferences for non-essential cookies in your 
                    account settings.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Opt-Out Tools</h4>
                  <p className="text-sm text-gray-600">
                    Some third-party services provide opt-out mechanisms for their cookies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Different types of cookies are retained for different periods:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication Cookies:</strong> Retained for up to 30 days</li>
                <li><strong>Preference Cookies:</strong> Retained for up to 1 year</li>
                <li><strong>Analytics Cookies:</strong> Retained for up to 2 years</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Questions About Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
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

export default CookiePolicyPage;
