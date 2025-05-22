
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const industries = [
  "Legal Services",
  "Financial Services",
  "Real Estate",
  "Technology",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Other"
];

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsLoading(true);
      // In a real implementation, you would send this data to your backend
      // For the demo, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thanks for joining our waitlist!", {
        description: "We'll keep you updated on our launch."
      });
      
      setEmail('');
      setIndustry('');
      
    } catch (error) {
      toast.error("There was an error joining the waitlist");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input 
            id="email"
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="industry" className="text-sm font-medium">
            Your Industry
          </label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind.toLowerCase().replace(/\s+/g, '-')}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Join Waitlist"}
      </Button>
    </form>
  );
};

export default WaitlistForm;
