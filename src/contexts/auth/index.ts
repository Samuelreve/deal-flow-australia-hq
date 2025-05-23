
// Re-export from the main AuthContext to maintain backward compatibility
export { useAuth, AuthProvider } from "@/contexts/AuthContext";
export { AUTH_ROUTES } from "./constants";
export { handleAuthError, showAuthSuccess } from "./authUtils";
export type { AuthProviderProps } from "./types";
