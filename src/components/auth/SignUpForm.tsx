
import SignUpFormUI from "./SignUpFormUI";

interface SignUpFormProps {
  inviteToken?: string | null;
}

const SignUpForm = ({ inviteToken }: SignUpFormProps) => {
  return <SignUpFormUI inviteToken={inviteToken} />;
};

export default SignUpForm;
