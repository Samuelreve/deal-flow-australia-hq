
import { useState } from 'react';

interface CategoryDetection {
  category: string;
  confidence: number;
  keywords: string[];
}

export const useBusinessCategoryDetection = () => {
  const [lastDetection, setLastDetection] = useState<CategoryDetection | null>(null);

  const detectCategory = (message: string): CategoryDetection => {
    const text = message.toLowerCase();
    
    // Legal keywords and patterns
    const legalKeywords = ['contract', 'clause', 'legal', 'terms', 'agreement', 'liability', 'termination', 'breach', 'compliance', 'warranty'];
    const legalScore = legalKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Financial keywords and patterns
    const financialKeywords = ['price', 'cost', 'payment', 'financial', 'valuation', 'revenue', 'profit', 'budget', 'investment', 'roi'];
    const financialScore = financialKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Strategy keywords and patterns
    const strategyKeywords = ['strategy', 'market', 'competition', 'growth', 'plan', 'opportunity', 'risk', 'expansion', 'analysis'];
    const strategyScore = strategyKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Negotiation keywords and patterns
    const negotiationKeywords = ['negotiate', 'deal', 'offer', 'proposal', 'discuss', 'terms', 'agreement', 'compromise'];
    const negotiationScore = negotiationKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Operations keywords and patterns
    const operationsKeywords = ['process', 'efficiency', 'operations', 'workflow', 'management', 'team', 'resources'];
    const operationsScore = operationsKeywords.filter(keyword => text.includes(keyword)).length;
    
    // Document analysis keywords
    const documentKeywords = ['document', 'review', 'analyze', 'summary', 'extract', 'content'];
    const documentScore = documentKeywords.filter(keyword => text.includes(keyword)).length;

    // Calculate scores
    const scores = [
      { category: 'legal', score: legalScore, keywords: legalKeywords },
      { category: 'financial', score: financialScore, keywords: financialKeywords },
      { category: 'strategy', score: strategyScore, keywords: strategyKeywords },
      { category: 'negotiation', score: negotiationScore, keywords: negotiationKeywords },
      { category: 'operations', score: operationsScore, keywords: operationsKeywords },
      { category: 'document', score: documentScore, keywords: documentKeywords }
    ];

    // Find the highest scoring category
    const topCategory = scores.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );

    // Default to strategy if no clear category
    const finalCategory = topCategory.score > 0 ? topCategory.category : 'strategy';
    const confidence = Math.min(topCategory.score / 3, 1); // Normalize confidence

    const detection = {
      category: finalCategory,
      confidence: Math.max(confidence, 0.3), // Minimum confidence
      keywords: topCategory.keywords.filter(keyword => text.includes(keyword))
    };

    setLastDetection(detection);
    return detection;
  };

  return {
    detectCategory,
    lastDetection
  };
};
