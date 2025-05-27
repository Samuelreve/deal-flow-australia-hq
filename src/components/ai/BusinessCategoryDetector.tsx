
import React from 'react';
import { FileText, TrendingUp, Shield, DollarSign, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BusinessCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'legal',
    name: 'Legal Analysis',
    icon: Shield,
    color: 'bg-red-100 text-red-700',
    description: 'Contract review, clause analysis, legal risk assessment'
  },
  {
    id: 'financial',
    name: 'Financial Analysis',
    icon: DollarSign,
    color: 'bg-green-100 text-green-700',
    description: 'Financial terms, valuations, payment structures'
  },
  {
    id: 'strategy',
    name: 'Business Strategy',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-700',
    description: 'Strategic planning, market analysis, growth strategies'
  },
  {
    id: 'negotiation',
    name: 'Deal Negotiation',
    icon: Users,
    color: 'bg-purple-100 text-purple-700',
    description: 'Negotiation tactics, deal structure, relationship management'
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-700',
    description: 'Process optimization, team management, operational efficiency'
  },
  {
    id: 'document',
    name: 'Document Review',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700',
    description: 'Document analysis, content extraction, summary generation'
  }
];

interface BusinessCategoryDetectorProps {
  detectedCategory?: string;
  confidence?: number;
  onCategorySelect?: (categoryId: string) => void;
}

const BusinessCategoryDetector: React.FC<BusinessCategoryDetectorProps> = ({
  detectedCategory,
  confidence,
  onCategorySelect
}) => {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === detectedCategory);

  if (!category) return null;

  const Icon = category.icon;

  return (
    <div className="mb-4 p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">AI Category Detection</span>
        {confidence && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(confidence * 100)}% confidence
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge className={category.color}>
          {category.name}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {category.description}
        </span>
      </div>
    </div>
  );
};

export default BusinessCategoryDetector;
export { BUSINESS_CATEGORIES };
