
import { toast as sonner } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast(props: ToastProps) {
  if (props.variant === "destructive") {
    sonner.error(props.title || props.description || "Error");
  } else {
    sonner.success(props.title || props.description || "Success");
  }
}

export const useToast = () => {
  return {
    toast: (options: ToastProps) => {
      toast(options);
    },
    // Return an empty array for compatibility with Shadcn's useToast
    toasts: []
  };
};
