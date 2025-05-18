
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSignUp = (inviteToken?: string | null) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!email || !password || !name) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            // Store inviteToken in user metadata if provided
            inviteToken: inviteToken || null,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      if (data?.user) {
        setShowSuccess(true);
        // Form fields are kept in case user needs to use this info to login
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
      console.error("Sign up error:", error);
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
    handleSubmit,
  };
};
