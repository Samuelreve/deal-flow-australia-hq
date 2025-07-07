
import SignUpFormUI from "./SignUpFormUI";

interface SignUpFormProps {
  inviteToken?: string | null;
  redirect?: string | null;
}

const SignUpForm = ({ inviteToken, redirect }: SignUpFormProps) => {
  return <SignUpFormUI inviteToken={inviteToken} redirect={redirect} />;
};

export default SignUpForm;
