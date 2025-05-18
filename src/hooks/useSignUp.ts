
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const useSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const success = await signup(email, password, name);
      
      if (success) {
        // User is automatically signed in (email verification disabled)
        sonnerToast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // Email verification required - this will happen if Supabase has email confirmation enabled
        setShowSuccess(true);
        toast({
          title: "Account created!",
          description: "Please check your email for confirmation",
        });
        
        // Show a more descriptive message to help the user
        setError("Important: For testing, you may need to disable email confirmation in Supabase. Visit the Supabase dashboard > Authentication > Email templates and disable 'Confirm email' setting.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isLoading,
    error,
    showSuccess,
    handleSubmit
  };
};
