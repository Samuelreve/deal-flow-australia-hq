
import { createContext, useContext } from "react";
import { AuthContextType } from "@/types/auth";

// Create a context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Re-export the main auth provider and hook
export { AuthProvider } from "@/contexts/AuthContext";

// Re-export the main auth hook with a warning about the transition
export const useAuth = () => {
  console.warn(
    "You are using the auth context from '/contexts/auth/AuthContext'. " +
    "This is deprecated and will be removed in a future version. " +
    "Please import from '@/contexts/AuthContext' instead."
  );
  
  const mainAuth = useContext(AuthContext);
  
  // If this context is not defined, try to use the main auth context
  if (mainAuth === undefined) {
    const { useAuth: mainUseAuth } = require("@/contexts/AuthContext");
    return mainUseAuth();
  }
  
  return mainAuth;
};
