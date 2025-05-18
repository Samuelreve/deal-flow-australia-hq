
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import { AUTH_ROUTES } from "./constants";

// Helper function to handle auth errors
export const handleAuthError = (error: any, toastFunction: ReturnType<typeof useToast>["toast"]) => {
  console.error("Authentication error:", error);
  toastFunction({
    title: "Authentication failed",
    description: error.message || "An error occurred during authentication",
    variant: "destructive",
  });
};

// Helper function for success notifications
export const showAuthSuccess = (message: string, title: string = "Success") => {
  toast.success(message);
};
