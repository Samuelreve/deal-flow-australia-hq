
import { CardFooter } from "@/components/ui/card";

const LoginFormFooter = () => {
  return (
    <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground p-6 pt-0">
      <p>
        For testing purposes, you can create a new account with your email and password.
      </p>
    </CardFooter>
  );
};

export default LoginFormFooter;
