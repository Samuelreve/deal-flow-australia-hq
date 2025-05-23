
import { HighlightCategory } from './types';

export const DEFAULT_CATEGORIES: HighlightCategory[] = [
  { id: 'risk', name: 'Risk', color: '#F44336', description: 'Potential legal or business risks' },
  { id: 'obligation', name: 'Obligation', color: '#2196F3', description: 'Legal obligations or requirements' },
  { id: 'key-term', name: 'Key Term', color: '#4CAF50', description: 'Important terms and definitions' },
  { id: 'custom', name: 'Custom', color: '#FFEB3B', description: 'Other highlighted content' }
];
