
import TwoFactorVerification from "../TwoFactorVerification";

interface TwoFactorViewProps {
  challengeId: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  error?: string;
}

const TwoFactorView = ({
  challengeId,
  onVerify,
  onCancel,
  error
}: TwoFactorViewProps) => {
  return (
    <TwoFactorVerification 
      challengeId={challengeId}
      onVerify={onVerify}
      onCancel={onCancel}
      error={error}
    />
  );
};

export default TwoFactorView;
