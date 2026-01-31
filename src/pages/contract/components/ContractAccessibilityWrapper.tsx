
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ContractSkipLinks,
  useContractKeyboardNavigation,
  useContractFocusManagement,
  useKeyboardHelp,
  ContractKeyboardHelp
} from '@/components/contract/accessibility/EnhancedAccessibility';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList
} from '@/components/ui/command';

interface ContractAccessibilityWrapperProps {
  children: React.ReactNode;
}

const ContractAccessibilityWrapper: React.FC<ContractAccessibilityWrapperProps> = ({ children }) => {
  const { announceToScreenReader } = useContractFocusManagement();
  const { isOpen: isKeyboardHelpOpen, setIsOpen: setKeyboardHelpOpen } = useKeyboardHelp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isSearchOpen]);

  const handleSave = useCallback(() => {
    const editable = document.querySelector('[data-contract-editor]') as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (editable) {
      localStorage.setItem('contract-draft', editable.value);
      announceToScreenReader('Contract changes saved');
    } else {
      announceToScreenReader('No editable contract content found');
    }
  }, [announceToScreenReader]);

  const handleSearch = useCallback(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
      announceToScreenReader('Search input focused');
    } else {
      setIsSearchOpen(true);
      announceToScreenReader('Search dialog opened');
    }
  }, [isSearchOpen, announceToScreenReader]);

  // Enhanced keyboard navigation
  useContractKeyboardNavigation(
    () => {
      document.getElementById('contract-upload-input')?.click();
      announceToScreenReader('Opening file upload dialog');
    },
    handleSave,
    handleSearch,
    () => {
      setKeyboardHelpOpen(false);
      setIsSearchOpen(false);
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

      {/* Search dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          ref={searchInputRef}
          placeholder="Search contracts..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </CommandDialog>

      {/* Keyboard help overlay */}
      <ContractKeyboardHelp
        isOpen={isKeyboardHelpOpen}
        onClose={() => setKeyboardHelpOpen(false)}
      />
    </>
  );
};

export default ContractAccessibilityWrapper;
