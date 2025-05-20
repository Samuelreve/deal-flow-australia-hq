
import ResetPasswordForm from "../ResetPasswordForm";

interface ResetPasswordViewProps {
  onCancel: () => void;
}

const ResetPasswordView = ({ onCancel }: ResetPasswordViewProps) => {
  return <ResetPasswordForm onCancel={onCancel} />;
};

export default ResetPasswordView;
