
import React from 'react';
import { 
  ContractSkipLinks, 
  useContractKeyboardNavigation, 
  useContractFocusManagement, 
  useKeyboardHelp, 
  ContractKeyboardHelp 
} from '@/components/contract/accessibility/EnhancedAccessibility';

interface ContractAccessibilityWrapperProps {
  children: React.ReactNode;
}

const ContractAccessibilityWrapper: React.FC<ContractAccessibilityWrapperProps> = ({ children }) => {
  const { announceToScreenReader } = useContractFocusManagement();
  const { isOpen: isKeyboardHelpOpen, setIsOpen: setKeyboardHelpOpen } = useKeyboardHelp();

  // Enhanced keyboard navigation
  useContractKeyboardNavigation(
    () => {
      document.getElementById('contract-upload-input')?.click();
      announceToScreenReader('Opening file upload dialog');
    },
    () => {
      // TODO: Save functionality
      announceToScreenReader('Save function not yet implemented');
    },
    () => {
      // TODO: Search functionality
      announceToScreenReader('Search function not yet implemented');
    },
    () => {
      setKeyboardHelpOpen(false);
    }
  );

  return (
    <>
      <ContractSkipLinks />
      {children}
      
      {/* Screen reader announcements */}
      <div 
        id="contract-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />

      {/* Keyboard help overlay */}
      <ContractKeyboardHelp 
        isOpen={isKeyboardHelpOpen}
        onClose={() => setKeyboardHelpOpen(false)}
      />
    </>
  );
};

export default ContractAccessibilityWrapper;
