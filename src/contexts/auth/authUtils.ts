
import { toast } from "sonner";

export const handleAuthError = (error: any, toastFn?: any) => {
  console.error("Auth error:", error);
  const message = error.message || "An authentication error occurred";
  
  if (toastFn) {
    toastFn({
      variant: "destructive",
      title: "Authentication Error",
      description: message,
    });
  } else {
    toast.error(message);
  }
};

export const showAuthSuccess = (message: string, title: string = "Success") => {
  toast.success(message);
};
