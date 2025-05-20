
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginFormContainer from "./LoginFormContainer";

interface LoginFormProps {
  onSignUp: () => void;
  inviteToken?: string | null;
}

const LoginForm = ({ onSignUp, inviteToken }: LoginFormProps) => {
  return <LoginFormContainer onSignUp={onSignUp} inviteToken={inviteToken} />;
};

export default LoginForm;
