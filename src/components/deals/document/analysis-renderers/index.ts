
import SummaryRenderer from './SummaryRenderer';
import KeyClausesRenderer from './KeyClausesRenderer';
import RisksRenderer from './RisksRenderer';
import LegalComplianceRenderer from './LegalComplianceRenderer';
import ObligationsRenderer from './ObligationsRenderer';
import FinancialTermsRenderer from './FinancialTermsRenderer';
import GenericRenderer from './GenericRenderer';

export {
  SummaryRenderer,
  KeyClausesRenderer,
  RisksRenderer,
  LegalComplianceRenderer,
  ObligationsRenderer,
  FinancialTermsRenderer,
  GenericRenderer
};

export const getAnalysisRenderer = (analysisType: string) => {
  switch (analysisType) {
    case 'summarize_contract':
      return SummaryRenderer;
    case 'key_clauses':
      return KeyClausesRenderer;
    case 'risk_identification':
      return RisksRenderer;
    case 'legal_compliance':
      return LegalComplianceRenderer;
    case 'obligations_analysis':
      return ObligationsRenderer;
    case 'financial_terms':
      return FinancialTermsRenderer;
    default:
      return GenericRenderer;
  }
};
