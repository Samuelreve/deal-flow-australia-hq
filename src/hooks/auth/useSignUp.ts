import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSignUp = (inviteToken?: string | null) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const success = await signup(email, password, name);
      
      if (success) {
        setShowSuccess(true);
        
        // If invitation token exists, navigate to accept-invite page
        if (inviteToken) {
          navigate(`/accept-invite?token=${inviteToken}`);
        } else {
          // Otherwise just show success message
          toast.success("Account created successfully!");
        }
      } else {
        setError("Failed to create account. Please try again.");
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
