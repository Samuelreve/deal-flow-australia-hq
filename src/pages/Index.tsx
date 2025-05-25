
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, Shield, Zap } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DealFlow</h1>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Streamline Your Deal Management
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Manage deals, analyze contracts with AI, and track progress all in one powerful platform.
        </p>
        
        <div className="space-x-4">
          <Button size="lg" onClick={() => navigate('/signup')}>
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/demo/contract')}>
            Try Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>Smart Document Management</CardTitle>
              <CardDescription>
                Upload, organize, and analyze your contracts and documents with AI-powered insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Real-time Deal Tracking</CardTitle>
              <CardDescription>
                Monitor deal progress, milestones, and health scores in real-time with actionable insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Secure Collaboration</CardTitle>
              <CardDescription>
                Collaborate securely with team members and stakeholders throughout the deal lifecycle.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
