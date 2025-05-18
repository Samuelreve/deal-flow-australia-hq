
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

export const useSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const data = await authService.signup(email, password, name);
      
      if (data?.user) {
        if (data.session) {
          // User is automatically signed in (email verification disabled)
          sonnerToast.success("Account created successfully!");
          navigate("/dashboard");
        } else {
          // Email verification required
          setShowSuccess(true);
          toast({
            title: "Account created!",
            description: "Please check your email for confirmation",
          });
          // Clear form
          setEmail("");
          setPassword("");
          setName("");
        }
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
