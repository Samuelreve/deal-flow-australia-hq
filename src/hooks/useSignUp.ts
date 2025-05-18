
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
        // User is automatically signed in
        sonnerToast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // This case should be rare with our updated settings
        navigate("/login");
        toast({
          title: "Account created!",
          description: "Please log in with your new account",
        });
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Handle common Supabase auth errors with friendly messages
      if (err.message?.includes("already registered")) {
        setError("This email is already registered. Please log in instead.");
      } else if (err.message?.includes("password")) {
        setError("Password should be at least 6 characters long.");
      } else {
        setError(err.message || "Failed to create account");
      }
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
