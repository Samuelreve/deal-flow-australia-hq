// Analytics wrapper for Plausible
// https://plausible.io/docs/custom-event-goals

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

type EventProps = Record<string, string | number | boolean>;

const track = (eventName: string, props?: EventProps) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, props ? { props } : undefined);
  } else if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, props);
  }
};

export const analytics = {
  // Auth Events
  trackSignup: (method: 'email' | 'google' | 'apple' = 'email') => {
    track('Signup', { method });
  },
  
  trackLogin: (method: 'email' | 'google' | 'apple' = 'email') => {
    track('Login', { method });
  },

  // Deal Events
  trackDealCreated: (dealType: string, category: string) => {
    track('Deal Created', { dealType, category });
  },
  
  trackDealViewed: (dealId: string) => {
    track('Deal Viewed', { dealId });
  },

  // AI Events
  trackAIFeatureUsed: (feature: string, context?: string) => {
    track('AI Feature Used', { feature, context: context || 'general' });
  },
  
  trackAIAssistantQuery: () => {
    track('AI Assistant Query');
  },

  // Document Events
  trackDocumentUploaded: (fileType: string, sizeMB: number) => {
    track('Document Uploaded', { fileType, sizeMB });
  },
  
  trackDocumentAnalyzed: () => {
    track('Document Analyzed');
  },

  // Milestone Events
  trackMilestoneCompleted: (milestoneTitle: string) => {
    track('Milestone Completed', { milestoneTitle });
  },

  // Conversion Events
  trackCTAClick: (ctaName: string, location: string) => {
    track('CTA Click', { ctaName, location });
  },
  
  trackPricingViewed: () => {
    track('Pricing Viewed');
  },

  // PWA Events
  trackPWAInstalled: () => {
    track('PWA Installed');
  },
  
  trackPWAPromptShown: () => {
    track('PWA Prompt Shown');
  },

  // Page Events
  trackPageView: (page: string) => {
    track('Page View', { page });
  },

  // Feature Discovery
  trackFeatureDiscovered: (feature: string) => {
    track('Feature Discovered', { feature });
  },
};

export default analytics;
