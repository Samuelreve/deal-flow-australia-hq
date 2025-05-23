
import React from 'react';

// Accessibility utilities for contract components
export const contractAriaLabels = {
  uploadArea: "Contract upload area - drag and drop files here or click to browse",
  contractList: "List of uploaded contracts",
  contractItem: (name: string, status: string) => `Contract ${name}, status: ${status}`,
  analysisTab: (type: string) => `Contract analysis tab: ${type}`,
  questionInput: "Ask a question about the contract",
  highlightTool: "Highlight text in the contract document",
  contractViewer: "Contract document viewer",
  loadingAnalysis: "Contract analysis in progress",
  errorMessage: "Error message",
  retryButton: "Retry the failed operation"
};

export const contractKeyboardShortcuts = {
  'Ctrl+U': 'Upload new contract',
  'Ctrl+S': 'Save current analysis',
  'Ctrl+F': 'Search in contract',
  'Escape': 'Close dialog or modal',
  'Tab': 'Navigate between elements',
  'Enter': 'Activate button or link',
  'Space': 'Select checkbox or toggle'
};

// Keyboard navigation hook
export const useContractKeyboardNavigation = (
  onUpload?: () => void,
  onSave?: () => void,
  onSearch?: () => void
) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'u':
            event.preventDefault();
            onUpload?.();
            break;
          case 's':
            event.preventDefault();
            onSave?.();
            break;
          case 'f':
            event.preventDefault();
            onSearch?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUpload, onSave, onSearch]);
};

// Focus management hook
export const useContractFocusManagement = () => {
  const focusElementById = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      // Announce to screen readers
      element.setAttribute('aria-live', 'polite');
    }
  };

  const announceLiveRegion = (message: string) => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  };

  return { focusElementById, announceLiveRegion };
};
