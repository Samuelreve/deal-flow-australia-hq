
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
  is_professional?: boolean;
  professional_headline?: string;
  professional_bio?: string;
  professional_firm_name?: string;
  professional_contact_email?: string;
  professional_phone?: string;
  professional_website?: string;
  professional_location?: string;
  professional_specializations?: string[];
  onboarding_complete?: boolean;
  created_at?: string;
  updated_at?: string;
}

// User roles
export type UserRole = "seller" | "buyer" | "lawyer" | "admin" | "advisor" | "browsing";

// Combined user type with Supabase user and profile data
export interface User extends SupabaseUser {
  profile: UserProfile | null;
  role?: UserRole; // Add role directly to User for easier access
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
  setUser: (user: User | null) => void;
  updateUserProfile: (profile: UserProfile) => Promise<boolean>;
}
