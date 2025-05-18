
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define the user profile structure
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  company?: string;
  phone?: string;
}

// User roles
export type UserRole = "seller" | "buyer" | "lawyer" | "admin";

// Combined user type with Supabase user and profile data
export interface User extends SupabaseUser {
  profile: UserProfile | null;
}

// Auth context type definition
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}
