
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

// Enhanced accessibility utilities
export const contractAriaLabelsEnhanced = {
  // Navigation
  skipToContent: "Skip to main content",
  skipToSidebar: "Skip to contract sidebar",
  
  // Upload areas
  uploadArea: "Contract upload area. Drag and drop files here or click to browse. Supported formats: PDF, DOCX, TXT. Maximum size: 10MB",
  uploadProgress: (progress: number) => `Upload progress: ${progress}% complete`,
  
  // Contract management
  contractList: "List of uploaded contracts. Use arrow keys to navigate, Enter to select",
  contractItem: (name: string, status: string, index: number, total: number) => 
    `Contract ${index + 1} of ${total}: ${name}, status: ${status}`,
  
  // Analysis interface
  analysisTab: (type: string, isActive: boolean) => 
    `${type} analysis tab${isActive ? ', currently selected' : ''}`,
  questionInput: "Ask a question about the contract. Type your question and press Enter or click Ask",
  
  // Status announcements
  analysisComplete: "Contract analysis completed successfully",
  analysisError: "Contract analysis failed. Please try again or contact support",
  uploadComplete: (filename: string) => `${filename} uploaded successfully and ready for analysis`,
  
  // Interactive elements
  retryButton: "Retry the failed operation",
  exportButton: "Export analysis results as PDF",
  shareButton: "Share contract analysis with others"
};

export const useContractKeyboardNavigation = (
  onUpload?: () => void,
  onSave?: () => void,
  onSearch?: () => void,
  onEscape?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        if (event.key === 'Escape') {
          (event.target as HTMLElement).blur();
          onEscape?.();
        }
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'u':
            event.preventDefault();
            onUpload?.();
            announceToScreenReader('Opening file upload dialog');
            break;
          case 's':
            event.preventDefault();
            onSave?.();
            announceToScreenReader('Saving analysis results');
            break;
          case 'f':
            event.preventDefault();
            onSearch?.();
            announceToScreenReader('Opening search');
            break;
        }
      } else if (event.key === 'Escape') {
        onEscape?.();
      }
    };

    const announceToScreenReader = (message: string) => {
      // Create or update live region
      let liveRegion = document.getElementById('contract-announcements');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'contract-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      }
      
      liveRegion.textContent = message;
      
      // Also show toast for visual feedback
      toast.info(message);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUpload, onSave, onSearch, onEscape]);
};

export const useContractFocusManagement = () => {
  const announcementRef = useRef<HTMLDivElement>(null);

  const focusElementById = (id: string, announcement?: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      if (announcement) {
        announceToScreenReader(announcement);
      }
    }
  };

  const focusFirstInContainer = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      const focusable = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      focusable?.focus();
    }
  };

  const announceToScreenReader = (message: string) => {
    // Create or update live region
    let liveRegion = document.getElementById('contract-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'contract-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Also show toast for visual feedback
    toast.info(message);
  };

  return { 
    focusElementById, 
    focusFirstInContainer,
    announceToScreenReader 
  };
};

// Skip links component for better accessibility
export const ContractSkipLinks: React.FC = () => (
  <div className="sr-only focus-within:not-sr-only">
    <Button
      variant="outline"
      size="sm"
      className="absolute top-4 left-4 z-50 focus:relative"
      onClick={() => document.getElementById('main-content')?.focus()}
    >
      Skip to main content
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="absolute top-4 left-32 z-50 focus:relative"
      onClick={() => document.getElementById('contract-sidebar')?.focus()}
    >
      Skip to sidebar
    </Button>
  </div>
);

// Enhanced keyboard shortcut display
export const ContractKeyboardHelp: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'U'], description: 'Upload new contract' },
    { keys: ['Ctrl', 'S'], description: 'Save analysis results' },
    { keys: ['Ctrl', 'F'], description: 'Search in content' },
    { keys: ['Escape'], description: 'Close dialogs or clear focus' },
    { keys: ['Tab'], description: 'Navigate between elements' },
    { keys: ['Enter'], description: 'Activate focused element' },
    { keys: ['Space'], description: 'Toggle checkboxes and buttons' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd key={keyIndex} className="px-2 py-1 bg-muted text-sm rounded">
                    {key}
                  </kbd>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </div>
    </div>
  );
};

// Custom hook for managing keyboard help
export const useKeyboardHelp = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
};
