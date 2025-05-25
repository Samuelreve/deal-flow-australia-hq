
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function toast(props: ToastProps) {
  const message = props.title || props.description || "";
  const options = {
    duration: props.duration || 4000,
  };

  if (props.variant === "destructive") {
    sonnerToast.error(message, options);
  } else {
    sonnerToast.success(message, options);
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
