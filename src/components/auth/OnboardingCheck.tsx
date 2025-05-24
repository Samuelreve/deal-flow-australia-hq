
import React, { ReactNode } from "react";

interface OnboardingCheckProps {
  children: ReactNode;
}

/**
 * Component that simply passes through children - no onboarding functionality
 */
const OnboardingCheck: React.FC<OnboardingCheckProps> = ({ children }) => {
  return <>{children}</>;
};

export default OnboardingCheck;
