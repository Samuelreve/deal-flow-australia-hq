
import TwoFactorVerification from "../TwoFactorVerification";

interface TwoFactorViewProps {
  challengeId: string;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  error?: string;
}

const TwoFactorView = ({
  challengeId,
  onVerify,
  onCancel,
  error
}: TwoFactorViewProps) => {
  const handleVerify = async (code: string) => {
    await onVerify(code);
  };

  return (
    <TwoFactorVerification 
      challengeId={challengeId}
      onVerify={handleVerify}
      onCancel={onCancel}
      error={error}
    />
  );
};

export default TwoFactorView;
