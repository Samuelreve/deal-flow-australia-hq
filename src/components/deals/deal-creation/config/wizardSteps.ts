
import { Building2, HandHeart, User, FileText, ClipboardCheck } from 'lucide-react';
import BusinessInfoStep from '../steps/BusinessInfoStep';
import DealInfoStep from '../steps/DealInfoStep';
import SellerDetailsStep from '../steps/SellerDetailsStep';
import DocumentUploadStep from '../steps/DocumentUploadStep';
import FinalReviewStep from '../steps/FinalReviewStep';

export const WIZARD_STEPS = [
  { 
    id: 1, 
    title: 'Business Information', 
    icon: Building2,
    component: BusinessInfoStep,
    description: 'Tell us about your business'
  },
  { 
    id: 2, 
    title: 'Deal Information', 
    icon: HandHeart,
    component: DealInfoStep,
    description: 'Define your deal terms'
  },
  { 
    id: 3, 
    title: 'Seller & Legal Details', 
    icon: User,
    component: SellerDetailsStep,
    description: 'Your contact information'
  },
  { 
    id: 4, 
    title: 'Upload Documents', 
    icon: FileText,
    component: DocumentUploadStep,
    description: 'Secure document upload'
  },
  { 
    id: 5, 
    title: 'Review & Submit', 
    icon: ClipboardCheck,
    component: FinalReviewStep,
    description: 'Final check and create'
  }
];
