
import { createContext, useContext } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthOperations } from "./authOperations";
import { AuthProviderProps } from "./types";

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use the extracted auth operations
  const authOperations = useAuthOperations();

  return (
    <AuthContext.Provider value={authOperations}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
