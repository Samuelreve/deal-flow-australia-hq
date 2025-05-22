
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WaitlistForm from './WaitlistForm';

interface HeroSectionProps {
  isAuthenticated: boolean;
  scrollToSection?: (sectionId: string) => void;
}

const HeroSection = ({ isAuthenticated, scrollToSection }: HeroSectionProps) => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };
  
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
              Smart Contract Analysis Made Simple
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Upload any contract and get instant AI-powered summaries, insights, and answers to your legal questions in plain English.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="text-md bg-blue-600 hover:bg-blue-700 px-8"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => scrollToSection?.('features')}
              className="text-md px-8"
            >
              See How It Works
            </Button>
          </div>
          
          {/* Waitlist Form */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto border border-blue-100">
            <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
            <p className="text-gray-600 mb-6">Be the first to access our full suite of legal document AI tools when we launch.</p>
            <WaitlistForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
