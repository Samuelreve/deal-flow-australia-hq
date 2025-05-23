
import { useMemo } from 'react';
import { AnalysisType } from './types';
import { FileText, AlertTriangle, Scale, DollarSign, Clock, Users } from 'lucide-react';

export const useAnalysisTypes = () => {
  const analysisTypes = useMemo<AnalysisType[]>(() => [
    {
      id: 'summarize_contract',
      label: 'Contract Summary',
      description: 'Generate a comprehensive summary of the document',
      icon: <FileText className="h-4 w-4" />,
      category: 'basic'
    },
    {
      id: 'key_clauses',
      label: 'Key Clauses',
      description: 'Extract and analyze important contract clauses',
      icon: <Scale className="h-4 w-4" />,
      category: 'legal'
    },
    {
      id: 'risk_identification',
      label: 'Risk Analysis',
      description: 'Identify potential risks and concerns',
      icon: <AlertTriangle className="h-4 w-4" />,
      category: 'legal'
    },
    {
      id: 'financial_terms',
      label: 'Financial Analysis',
      description: 'Analyze financial obligations and terms',
      icon: <DollarSign className="h-4 w-4" />,
      category: 'financial'
    },
    {
      id: 'obligations_analysis',
      label: 'Obligations & Duties',
      description: 'Extract obligations and commitments for all parties',
      icon: <Users className="h-4 w-4" />,
      category: 'legal'
    },
    {
      id: 'timeline_analysis',
      label: 'Timeline & Deadlines',
      description: 'Identify important dates and deadlines',
      icon: <Clock className="h-4 w-4" />,
      category: 'advanced'
    }
  ], []);

  const getAnalysisTypeById = (id: string) => {
    return analysisTypes.find(type => type.id === id);
  };

  const getAnalysisTypesByCategory = (category: string) => {
    return analysisTypes.filter(type => type.category === category);
  };

  return {
    analysisTypes,
    getAnalysisTypeById,
    getAnalysisTypesByCategory
  };
};
