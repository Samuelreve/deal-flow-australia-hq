
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Scale, ShoppingCart, Eye, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

const IntentCapturePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    {
      value: 'seller' as UserRole,
      title: 'Business Seller',
      description: 'I want to sell my business or assets',
      icon: Briefcase,
      features: ['List business for sale', 'Manage deal pipeline', 'Upload documents', 'Track negotiations']
    },
    {
      value: 'buyer' as UserRole,
      title: 'Business Buyer',
      description: 'I\'m looking to acquire businesses or assets',
      icon: ShoppingCart,
      features: ['Browse available deals', 'Submit offers', 'Due diligence tools', 'Monitor deal progress']
    },
    {
      value: 'lawyer' as UserRole,
      title: 'Legal Professional',
      description: 'I provide legal services for M&A transactions',
      icon: Scale,
      features: ['Professional directory listing', 'Client collaboration tools', 'Document review', 'Legal insights']
    },
    {
      value: 'advisor' as UserRole,
      title: 'Business Advisor',
      description: 'I advise on business transactions and strategy',
      icon: UserCheck,
      features: ['Advisory services', 'Client management', 'Deal analysis', 'Strategic insights']
    },
    {
      value: 'browsing' as UserRole,
      title: 'Just Browsing',
      description: 'I\'m exploring and learning about the platform',
      icon: Eye,
      features: ['Limited access', 'Platform exploration', 'Educational content', 'Basic features']
    }
  ];

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async () => {
    if (!selectedRole || !user?.profile) {
      toast({
        variant: "destructive",
        title: "Please select a role",
        description: "You must choose how you plan to use DealPilot."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedProfile = {
        ...user.profile,
        role: selectedRole,
        onboarding_complete: selectedRole === 'lawyer' ? false : true, // Lawyers need professional setup
        is_professional: selectedRole === 'lawyer'
      };

      const success = await updateUserProfile(updatedProfile);
      
      if (success) {
        toast({
          title: "Welcome to DealPilot!",
          description: `Your account has been set up as a ${selectedRole}.`
        });

        // Redirect based on role
        if (selectedRole === 'lawyer') {
          navigate('/profile/professional-setup');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message || "Failed to complete setup. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to DealPilot
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us how you plan to use DealPilot so we can customize your experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedRole === option.value;
            
            return (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleRoleSelection(option.value)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    {isSelected && (
                      <Badge variant="default" className="bg-primary">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="px-8"
          >
            {isSubmitting ? "Setting up your account..." : "Continue"}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            You can change your role later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntentCapturePage;
