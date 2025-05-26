
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/deals');
    } else {
      navigate('/login');
    }
  };

  const handleContractAnalysis = () => {
    navigate('/contract-analysis');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Business Deals
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage documents, track progress, and collaborate with AI-powered contract analysis
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={handleGetStarted}>
              {user ? 'Go to My Deals' : 'Get Started'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleContractAnalysis}>
              Try Contract Analysis
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Document Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Upload, organize, and manage all your deal documents in one place.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span>Team Collaboration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Work together with your team and track everyone's progress.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>Progress Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Monitor deal health and milestone completion in real-time.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <span>AI Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get intelligent insights and contract analysis powered by AI.</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="text-center bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of professionals who trust our platform for their business deals
            </p>
            <Button size="lg" onClick={() => navigate('/login')}>
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
