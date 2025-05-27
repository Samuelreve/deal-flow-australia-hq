
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Accessibility, Eye, Keyboard, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AccessibilityPage = () => {
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Accessibility className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accessibility Statement</h1>
              <p className="text-gray-600">Last updated: May 27, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Our Commitment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Our Commitment to Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                DealPilot is committed to ensuring digital accessibility for people with disabilities. 
                We continually improve the user experience for everyone and apply the relevant 
                accessibility standards.
              </p>
              <p>
                We strive to make our AI-powered business platform usable by all people, 
                regardless of their abilities or the technologies they use to access the internet.
              </p>
            </CardContent>
          </Card>

          {/* Standards */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                DealPilot aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 
                at the AA level. These guidelines help make web content more accessible to people 
                with disabilities.
              </p>
              <p>Our efforts include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Semantic HTML structure</li>
                <li>Proper heading hierarchy</li>
                <li>Alternative text for images</li>
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>Color contrast compliance</li>
              </ul>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Navigation
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Full keyboard navigation support</li>
                  <li>Visible focus indicators</li>
                  <li>Logical tab order</li>
                  <li>Keyboard shortcuts for common actions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4" />
                  Visual Accessibility
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>High contrast color schemes</li>
                  <li>Scalable text and interface elements</li>
                  <li>Clear visual hierarchy</li>
                  <li>Meaningful color usage (not sole indicator)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Accessibility className="h-4 w-4" />
                  Screen Reader Support
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Proper ARIA labels and descriptions</li>
                  <li>Semantic markup for complex UI components</li>
                  <li>Status announcements for dynamic content</li>
                  <li>Alternative text for AI-generated insights</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features Accessibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our AI-powered features are designed with accessibility in mind:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-generated summaries include structured headings</li>
                <li>Document analysis results are presented in accessible formats</li>
                <li>Voice descriptions available for visual AI insights</li>
                <li>Alternative input methods for AI interactions</li>
                <li>Plain language explanations of complex terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Browser Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle>Browser and Assistive Technology Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>DealPilot is tested with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modern browsers (Chrome, Firefox, Safari, Edge)</li>
                <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>Voice control software</li>
                <li>Keyboard-only navigation</li>
                <li>Mobile accessibility features</li>
              </ul>
            </CardContent>
          </Card>

          {/* Known Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Known Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We're continuously working to improve accessibility. Currently known limitations include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Some advanced chart interactions may require mouse input</li>
                <li>PDF document viewing depends on browser accessibility support</li>
                <li>Real-time collaboration features have limited screen reader support</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                We're actively working to address these limitations in future updates.
              </p>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We welcome feedback on the accessibility of DealPilot. If you encounter 
                accessibility barriers or have suggestions for improvement, please let us know:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Email: <a href="mailto:accessibility@dealpilot.com" className="text-primary hover:underline">
                    accessibility@dealpilot.com
                  </a>
                </li>
                <li>
                  Subject line: "Accessibility Feedback"
                </li>
                <li>Include details about the issue and your assistive technology setup</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                We aim to respond to accessibility feedback within 2 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
