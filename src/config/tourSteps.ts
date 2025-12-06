import { Step } from 'react-joyride';

export const tourSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to Trustroom.ai! This is your personalized dashboard where you can see an overview of all your deals and recent activity.',
    placement: 'bottom',
    title: '👋 Your Dashboard',
    disableBeacon: true,
  },
  {
    target: '[data-tour="quick-stats"]',
    content: 'Here you can quickly see key metrics like active deals, recent activity, average deal health, and unread notifications.',
    placement: 'bottom',
    title: '📊 Quick Stats',
  },
  {
    target: '[data-tour="create-deal-button"]',
    content: 'Click here to create a new deal. Our wizard will guide you through setting up deal details, parties involved, and milestones.',
    placement: 'left',
    title: '➕ Create Your First Deal',
  },
  {
    target: '[data-tour="sidebar-deals"]',
    content: 'View and manage all your deals here. You can search, filter by status, and see deal summaries at a glance.',
    placement: 'right',
    title: '📁 Deals Management',
  },
  {
    target: '[data-tour="sidebar-health"]',
    content: 'Monitor the health of all your deals. Get AI-powered insights on potential risks, blockers, and recommendations.',
    placement: 'right',
    title: '❤️ Health Monitoring',
  },
  {
    target: '[data-tour="sidebar-ai"]',
    content: 'Our AI Assistant can help you analyze contracts, answer questions about deals, and provide legal insights in real-time.',
    placement: 'right',
    title: '🤖 AI Assistant',
  },
  {
    target: '[data-tour="sidebar-settings"]',
    content: 'Customize your account settings, notification preferences, and professional profile here.',
    placement: 'right',
    title: '⚙️ Settings',
  },
  {
    target: '[data-tour="user-profile"]',
    content: 'Access your profile, view your account details, and log out from here. You can also restart this tour anytime from Settings.',
    placement: 'top',
    title: '👤 Your Profile',
  },
];

export const getRoleSpecificSteps = (role: string): Step[] => {
  const baseSteps = [...tourSteps];
  
  // Add role-specific guidance
  switch (role) {
    case 'seller':
      return baseSteps.map(step => {
        if (step.target === '[data-tour="create-deal-button"]') {
          return {
            ...step,
            content: 'As a seller, start here to list your business or assets. Our wizard will help you set up all the details buyers need.',
          };
        }
        return step;
      });
    case 'buyer':
      return baseSteps.map(step => {
        if (step.target === '[data-tour="sidebar-deals"]') {
          return {
            ...step,
            content: 'Browse available deals and manage your acquisitions. Filter by industry, price range, and deal status.',
          };
        }
        return step;
      });
    case 'lawyer':
      return baseSteps.map(step => {
        if (step.target === '[data-tour="sidebar-ai"]') {
          return {
            ...step,
            content: 'Use the AI Assistant to analyze contracts, identify risks, and get clause-by-clause breakdowns for your clients.',
          };
        }
        return step;
      });
    default:
      return baseSteps;
  }
};
