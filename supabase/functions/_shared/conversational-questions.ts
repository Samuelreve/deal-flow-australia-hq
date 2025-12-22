/**
 * Smart Question Engine for Conversational Document Generation
 * Pre-defined question flows per document type with context-aware logic
 */

export interface QuestionOption {
  label: string;
  value: string;
  description?: string;
}

export interface SmartQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  allowCustom?: boolean;
  skipIf?: (context: Record<string, any>) => boolean;
  helpText?: string;
}

export interface DocumentQuestionFlow {
  documentType: string;
  displayName: string;
  description: string;
  questions: SmartQuestion[];
  requiredFields: string[];
}

export const QUESTION_FLOWS: Record<string, DocumentQuestionFlow> = {
  'Non-Disclosure Agreement': {
    documentType: 'Non-Disclosure Agreement',
    displayName: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information during deal discussions',
    requiredFields: ['nda_type', 'duration', 'scope'],
    questions: [
      {
        id: 'nda_type',
        question: 'Who will be sharing confidential information in this deal?',
        helpText: 'This determines whether the NDA protects one party or both.',
        options: [
          { label: 'Seller Only', value: 'one-way-seller', description: 'Seller shares info with buyer' },
          { label: 'Buyer Only', value: 'one-way-buyer', description: 'Buyer shares info with seller' },
          { label: 'Mutual', value: 'mutual', description: 'Both parties share confidential info' }
        ]
      },
      {
        id: 'duration',
        question: 'How long should confidentiality obligations last after disclosure?',
        helpText: 'For M&A deals, 3-5 years is standard. Trade secrets may need perpetual protection.',
        options: [
          { label: '2 Years', value: '2', description: 'Shorter term, lower-risk info' },
          { label: '3 Years', value: '3', description: 'Standard for most M&A deals' },
          { label: '5 Years', value: '5', description: 'Higher value or sensitive info' },
          { label: 'Perpetual', value: 'perpetual', description: 'Trade secrets, never expires' }
        ]
      },
      {
        id: 'scope',
        question: 'What type of confidential information will be shared?',
        helpText: 'This helps define what\'s protected under the NDA.',
        options: [
          { label: 'Financial Only', value: 'financial', description: 'Revenue, profits, projections' },
          { label: 'Business Operations', value: 'operations', description: 'Processes, suppliers, customers' },
          { label: 'Technical/IP', value: 'technical', description: 'Technology, trade secrets, patents' },
          { label: 'Comprehensive', value: 'comprehensive', description: 'All business information' }
        ]
      },
      {
        id: 'carveouts',
        question: 'Include standard exceptions (carve-outs)?',
        helpText: 'Standard carve-outs protect against unreasonable claims.',
        options: [
          { label: 'Yes, Standard', value: 'standard', description: 'Public info, prior knowledge, legal requirements' },
          { label: 'Minimal', value: 'minimal', description: 'Only legally required exceptions' },
          { label: 'Expanded', value: 'expanded', description: 'Standard plus independent development' }
        ]
      },
      {
        id: 'non_solicitation',
        question: 'Include non-solicitation of employees clause?',
        helpText: 'Prevents parties from poaching each other\'s staff during and after the deal.',
        options: [
          { label: 'Yes, 12 months', value: '12', description: 'Standard protection period' },
          { label: 'Yes, 24 months', value: '24', description: 'Extended protection' },
          { label: 'No', value: 'none', description: 'Not needed for this deal' }
        ]
      }
    ]
  },

  'Letter of Intent': {
    documentType: 'Letter of Intent',
    displayName: 'Letter of Intent (LOI)',
    description: 'Non-binding outline of deal terms before formal agreement',
    requiredFields: ['binding_provisions', 'exclusivity', 'key_terms'],
    questions: [
      {
        id: 'binding_provisions',
        question: 'Which provisions should be legally binding?',
        helpText: 'Most LOIs are non-binding except for specific clauses.',
        options: [
          { label: 'None (Non-binding)', value: 'none', description: 'Standard non-binding LOI' },
          { label: 'Confidentiality Only', value: 'confidentiality', description: 'Common choice if no NDA exists' },
          { label: 'Exclusivity Only', value: 'exclusivity', description: 'Lock in deal negotiations' },
          { label: 'Both', value: 'both', description: 'Confidentiality and exclusivity binding' }
        ]
      },
      {
        id: 'exclusivity',
        question: 'Include an exclusivity (no-shop) period?',
        helpText: 'Prevents seller from negotiating with other buyers.',
        options: [
          { label: '30 Days', value: '30', description: 'Quick due diligence expected' },
          { label: '60 Days', value: '60', description: 'Standard for most deals' },
          { label: '90 Days', value: '90', description: 'Complex due diligence needed' },
          { label: 'No Exclusivity', value: 'none', description: 'Seller keeps options open' }
        ]
      },
      {
        id: 'deal_structure',
        question: 'What is the proposed deal structure?',
        helpText: 'This affects the key terms section of the LOI.',
        options: [
          { label: 'Asset Purchase', value: 'asset', description: 'Buying specific assets' },
          { label: 'Share Purchase', value: 'share', description: 'Buying company shares/equity' },
          { label: 'Business Sale', value: 'business', description: 'Entire business transfer' },
          { label: 'To Be Determined', value: 'tbd', description: 'Structure still being decided' }
        ]
      },
      {
        id: 'conditions',
        question: 'Key conditions precedent to include?',
        helpText: 'These must be satisfied before the deal can close.',
        options: [
          { label: 'Due Diligence Only', value: 'dd', description: 'Standard condition' },
          { label: 'DD + Financing', value: 'dd_financing', description: 'Buyer needs funding approval' },
          { label: 'DD + Board Approval', value: 'dd_board', description: 'Requires board sign-off' },
          { label: 'Comprehensive', value: 'comprehensive', description: 'DD, financing, approvals, third-party consents' }
        ]
      },
      {
        id: 'deposit',
        question: 'Include a deposit or earnest money provision?',
        helpText: 'Shows buyer commitment and may be forfeited if buyer walks away.',
        options: [
          { label: 'No Deposit', value: 'none', description: 'No upfront payment' },
          { label: 'Refundable Deposit', value: 'refundable', description: 'Returned if deal doesn\'t proceed' },
          { label: 'Non-refundable Deposit', value: 'non_refundable', description: 'Forfeited if buyer backs out' }
        ]
      }
    ]
  },

  'Asset Purchase Agreement': {
    documentType: 'Asset Purchase Agreement',
    displayName: 'Asset Purchase Agreement',
    description: 'Formal agreement for purchasing specific business assets',
    requiredFields: ['asset_types', 'payment_structure', 'warranties'],
    questions: [
      {
        id: 'asset_types',
        question: 'What types of assets are being purchased?',
        helpText: 'This determines which schedules and representations are needed.',
        options: [
          { label: 'Tangible Only', value: 'tangible', description: 'Equipment, inventory, property' },
          { label: 'Intangible Only', value: 'intangible', description: 'IP, goodwill, contracts' },
          { label: 'Both', value: 'both', description: 'Full asset acquisition' },
          { label: 'Going Concern', value: 'going_concern', description: 'Business as operating entity' }
        ]
      },
      {
        id: 'payment_structure',
        question: 'How will the purchase price be paid?',
        helpText: 'Payment structure affects security and risk allocation.',
        options: [
          { label: 'Cash at Closing', value: 'cash', description: 'Full payment on completion' },
          { label: 'Deferred Payment', value: 'deferred', description: 'Paid in instalments' },
          { label: 'Earnout', value: 'earnout', description: 'Based on future performance' },
          { label: 'Combination', value: 'combination', description: 'Cash + deferred + earnout' }
        ]
      },
      {
        id: 'warranties',
        question: 'What level of seller warranties do you need?',
        helpText: 'More warranties = more protection but harder negotiations.',
        options: [
          { label: 'Basic', value: 'basic', description: 'Title, authority, no encumbrances' },
          { label: 'Standard', value: 'standard', description: 'Basic + financials, compliance' },
          { label: 'Comprehensive', value: 'comprehensive', description: 'Full representations package' },
          { label: 'Minimal (As-Is)', value: 'minimal', description: 'Limited warranties, buyer beware' }
        ]
      },
      {
        id: 'employees',
        question: 'Will employees transfer with the assets?',
        helpText: 'Employee transfer has legal and practical implications.',
        options: [
          { label: 'All Employees', value: 'all', description: 'Full workforce transfer' },
          { label: 'Key Employees Only', value: 'key', description: 'Selected critical staff' },
          { label: 'No Employees', value: 'none', description: 'Assets only' },
          { label: 'Buyer\'s Choice', value: 'choice', description: 'Buyer selects who transfers' }
        ]
      },
      {
        id: 'non_compete',
        question: 'Include a seller non-compete clause?',
        helpText: 'Prevents seller from competing with the business after sale.',
        options: [
          { label: 'Yes, 2 Years', value: '2', description: 'Standard protection' },
          { label: 'Yes, 3 Years', value: '3', description: 'Extended protection' },
          { label: 'Yes, 5 Years', value: '5', description: 'Maximum protection' },
          { label: 'No', value: 'none', description: 'No restriction on seller' }
        ]
      }
    ]
  },

  'Share Purchase Agreement': {
    documentType: 'Share Purchase Agreement',
    displayName: 'Share Purchase Agreement',
    description: 'Agreement for purchasing shares/equity in a company',
    requiredFields: ['share_percentage', 'payment_terms', 'warranty_level'],
    questions: [
      {
        id: 'share_percentage',
        question: 'What percentage of shares is being purchased?',
        helpText: 'This affects control rights and required protections.',
        options: [
          { label: '100% (Full Acquisition)', value: '100', description: 'Complete ownership transfer' },
          { label: 'Majority (51-99%)', value: 'majority', description: 'Control but existing shareholders' },
          { label: 'Significant Minority (25-50%)', value: 'significant', description: 'Blocking rights typical' },
          { label: 'Minority (<25%)', value: 'minority', description: 'Limited control rights' }
        ]
      },
      {
        id: 'payment_terms',
        question: 'Payment structure for the shares?',
        helpText: 'How will the purchase consideration be paid?',
        options: [
          { label: 'Cash at Completion', value: 'cash', description: 'Full payment on closing' },
          { label: 'Staged Payments', value: 'staged', description: 'Multiple tranches' },
          { label: 'Share Swap', value: 'swap', description: 'Buyer shares as consideration' },
          { label: 'Mixed Consideration', value: 'mixed', description: 'Cash + shares + deferred' }
        ]
      },
      {
        id: 'warranty_level',
        question: 'Level of warranties and indemnities?',
        helpText: 'Higher protection means more complex negotiations.',
        options: [
          { label: 'Title Only', value: 'title', description: 'Seller owns shares, can transfer' },
          { label: 'Standard Package', value: 'standard', description: 'Title + business warranties' },
          { label: 'Full W&I', value: 'full', description: 'Comprehensive warranty schedule' },
          { label: 'W&I Insurance', value: 'insurance', description: 'Backed by insurance policy' }
        ]
      },
      {
        id: 'completion_accounts',
        question: 'How will the purchase price be adjusted?',
        helpText: 'Method for adjusting price based on actual vs. expected value.',
        options: [
          { label: 'Locked Box', value: 'locked_box', description: 'Fixed price, no adjustment' },
          { label: 'Completion Accounts', value: 'completion', description: 'Adjusted for working capital' },
          { label: 'Earn-Out', value: 'earnout', description: 'Based on future performance' },
          { label: 'Hybrid', value: 'hybrid', description: 'Base + earnout component' }
        ]
      },
      {
        id: 'post_completion',
        question: 'Post-completion restrictions on seller?',
        helpText: 'Protections after the deal closes.',
        options: [
          { label: 'Standard', value: 'standard', description: 'Non-compete + non-solicit' },
          { label: 'Enhanced', value: 'enhanced', description: 'Standard + transition services' },
          { label: 'Minimal', value: 'minimal', description: 'Basic obligations only' },
          { label: 'None', value: 'none', description: 'No post-completion restrictions' }
        ]
      }
    ]
  },

  'Employment Contract': {
    documentType: 'Employment Contract',
    displayName: 'Employment Contract',
    description: 'Contract for key employee as part of business transaction',
    requiredFields: ['role_type', 'term', 'compensation'],
    questions: [
      {
        id: 'role_type',
        question: 'What is the nature of this employment?',
        helpText: 'Determines the structure and required clauses.',
        options: [
          { label: 'Executive/Director', value: 'executive', description: 'Senior leadership role' },
          { label: 'Key Employee', value: 'key', description: 'Critical operational role' },
          { label: 'Retained Seller', value: 'seller', description: 'Seller staying post-acquisition' },
          { label: 'General Employee', value: 'general', description: 'Standard employment terms' }
        ]
      },
      {
        id: 'term',
        question: 'What is the employment term?',
        helpText: 'Fixed term provides certainty; ongoing provides flexibility.',
        options: [
          { label: 'Ongoing', value: 'ongoing', description: 'Permanent employment' },
          { label: '12 Months Fixed', value: '12', description: 'One year initial term' },
          { label: '24 Months Fixed', value: '24', description: 'Two year commitment' },
          { label: '36 Months Fixed', value: '36', description: 'Three year lock-in' }
        ]
      },
      {
        id: 'compensation',
        question: 'Compensation structure?',
        helpText: 'How will the employee be rewarded?',
        options: [
          { label: 'Salary Only', value: 'salary', description: 'Fixed remuneration' },
          { label: 'Salary + Bonus', value: 'bonus', description: 'Base + performance bonus' },
          { label: 'Salary + Equity', value: 'equity', description: 'Base + share options/rights' },
          { label: 'Full Package', value: 'full', description: 'Salary + bonus + equity' }
        ]
      },
      {
        id: 'restraints',
        question: 'Post-employment restraints?',
        helpText: 'Restrictions after employment ends.',
        options: [
          { label: 'Standard', value: 'standard', description: 'Non-compete 12 months' },
          { label: 'Enhanced', value: 'enhanced', description: 'Non-compete + non-solicit 24 months' },
          { label: 'Minimal', value: 'minimal', description: 'Confidentiality only' },
          { label: 'None', value: 'none', description: 'No restraints' }
        ]
      },
      {
        id: 'termination',
        question: 'Termination notice period?',
        helpText: 'Notice required to end the employment.',
        options: [
          { label: '2 Weeks', value: '2', description: 'Minimum statutory' },
          { label: '4 Weeks', value: '4', description: 'Standard notice' },
          { label: '3 Months', value: '12', description: 'Executive standard' },
          { label: '6 Months', value: '24', description: 'Senior executive' }
        ]
      }
    ]
  },

  'Service Agreement': {
    documentType: 'Service Agreement',
    displayName: 'Service Agreement',
    description: 'Agreement for professional or consulting services',
    requiredFields: ['service_type', 'term', 'payment'],
    questions: [
      {
        id: 'service_type',
        question: 'What type of services will be provided?',
        helpText: 'This determines the scope and deliverables section.',
        options: [
          { label: 'Consulting', value: 'consulting', description: 'Advisory services' },
          { label: 'Professional Services', value: 'professional', description: 'Technical/specialized work' },
          { label: 'Transition Services', value: 'transition', description: 'Post-acquisition support' },
          { label: 'Managed Services', value: 'managed', description: 'Ongoing operational support' }
        ]
      },
      {
        id: 'term',
        question: 'Service agreement duration?',
        helpText: 'How long will services be provided?',
        options: [
          { label: '3 Months', value: '3', description: 'Short-term engagement' },
          { label: '6 Months', value: '6', description: 'Medium-term project' },
          { label: '12 Months', value: '12', description: 'Annual agreement' },
          { label: 'Project-Based', value: 'project', description: 'Until completion' }
        ]
      },
      {
        id: 'payment',
        question: 'Payment structure?',
        helpText: 'How will services be paid for?',
        options: [
          { label: 'Fixed Fee', value: 'fixed', description: 'Agreed total amount' },
          { label: 'Time & Materials', value: 'tm', description: 'Hourly/daily rates' },
          { label: 'Retainer', value: 'retainer', description: 'Monthly fixed amount' },
          { label: 'Milestone-Based', value: 'milestone', description: 'Payment on deliverables' }
        ]
      },
      {
        id: 'ip_ownership',
        question: 'Who owns work product and IP?',
        helpText: 'Important for any deliverables created.',
        options: [
          { label: 'Client Owns All', value: 'client', description: 'Full ownership transfer' },
          { label: 'Provider Retains', value: 'provider', description: 'License to client' },
          { label: 'Shared', value: 'shared', description: 'Joint ownership' },
          { label: 'Background + Foreground Split', value: 'split', description: 'Pre-existing vs. new IP' }
        ]
      },
      {
        id: 'liability',
        question: 'Liability cap?',
        helpText: 'Maximum provider liability for claims.',
        options: [
          { label: 'Fees Paid', value: 'fees', description: 'Limited to fees paid' },
          { label: 'Annual Fees', value: 'annual', description: 'One year of fees' },
          { label: 'Fixed Cap', value: 'fixed', description: 'Specific dollar amount' },
          { label: 'Unlimited', value: 'unlimited', description: 'No cap on liability' }
        ]
      }
    ]
  },

  'Terms and Conditions': {
    documentType: 'Terms and Conditions',
    displayName: 'Terms and Conditions',
    description: 'Standard terms for products or services',
    requiredFields: ['business_type', 'payment_terms', 'liability'],
    questions: [
      {
        id: 'business_type',
        question: 'What does the business sell?',
        helpText: 'This determines which clauses are needed.',
        options: [
          { label: 'Physical Products', value: 'products', description: 'Goods, inventory' },
          { label: 'Digital Products', value: 'digital', description: 'Software, downloads' },
          { label: 'Services', value: 'services', description: 'Professional services' },
          { label: 'Mixed', value: 'mixed', description: 'Products and services' }
        ]
      },
      {
        id: 'payment_terms',
        question: 'Standard payment terms?',
        helpText: 'When payment is due.',
        options: [
          { label: 'Upfront', value: 'upfront', description: 'Payment before delivery' },
          { label: '14 Days', value: '14', description: 'Two weeks from invoice' },
          { label: '30 Days', value: '30', description: 'Standard net 30' },
          { label: '60 Days', value: '60', description: 'Extended terms' }
        ]
      },
      {
        id: 'returns',
        question: 'Returns/refund policy?',
        helpText: 'Customer rights for returns.',
        options: [
          { label: 'ACL Only', value: 'acl', description: 'Australian Consumer Law minimum' },
          { label: '14 Days No Questions', value: '14', description: 'Generous returns' },
          { label: '30 Days Store Credit', value: '30_credit', description: 'Credit only' },
          { label: 'No Returns', value: 'none', description: 'Final sale (where permitted)' }
        ]
      },
      {
        id: 'liability',
        question: 'Liability limitations?',
        helpText: 'Extent of business liability to customers.',
        options: [
          { label: 'ACL Minimum', value: 'acl', description: 'Cannot exclude consumer guarantees' },
          { label: 'Standard Commercial', value: 'commercial', description: 'Reasonable exclusions' },
          { label: 'Comprehensive', value: 'comprehensive', description: 'Maximum protection' }
        ]
      },
      {
        id: 'disputes',
        question: 'Dispute resolution process?',
        helpText: 'How disputes will be handled.',
        options: [
          { label: 'Negotiation First', value: 'negotiation', description: 'Informal resolution' },
          { label: 'Mediation Required', value: 'mediation', description: 'Before litigation' },
          { label: 'Arbitration', value: 'arbitration', description: 'Binding arbitration' },
          { label: 'Court Only', value: 'court', description: 'Direct to courts' }
        ]
      }
    ]
  },

  'Patent Assignment Agreement': {
    documentType: 'Patent Assignment Agreement',
    displayName: 'Patent Assignment Agreement',
    description: 'Transfer ownership of patent rights under Australian IP law',
    requiredFields: ['patent_type', 'assignment_type', 'consideration'],
    questions: [
      {
        id: 'patent_type',
        question: 'What type of patent is being assigned?',
        helpText: 'Different patent types may have different transfer requirements under the Patents Act 1990 (Cth).',
        options: [
          { label: 'Standard Patent', value: 'standard', description: 'Full 20-year patent protection' },
          { label: 'Innovation Patent', value: 'innovation', description: '8-year protection (phased out but existing valid)' },
          { label: 'Provisional Application', value: 'provisional', description: 'Pending application not yet examined' },
          { label: 'Multiple Patents/Portfolio', value: 'portfolio', description: 'Bundle of patents being transferred together' }
        ]
      },
      {
        id: 'assignment_type',
        question: 'What type of transfer is this?',
        helpText: 'Full assignment transfers all ownership; licenses retain assignor ownership.',
        options: [
          { label: 'Full Assignment', value: 'full', description: 'Complete transfer of all rights and title' },
          { label: 'Partial Assignment', value: 'partial', description: 'Transfer specific fields of use or territories' },
          { label: 'Assignment with License Back', value: 'license_back', description: 'Transfer with retained use rights' }
        ]
      },
      {
        id: 'consideration',
        question: 'What is the payment structure for this assignment?',
        helpText: 'How will the assignee compensate the assignor for the patent rights?',
        options: [
          { label: 'Lump Sum Payment', value: 'lump_sum', description: 'Single one-time payment' },
          { label: 'Royalty-Based', value: 'royalties', description: 'Ongoing percentage of revenue/sales' },
          { label: 'Lump Sum + Royalties', value: 'hybrid', description: 'Upfront payment plus ongoing royalties' },
          { label: 'Part of Larger Transaction', value: 'deal_component', description: 'Included in business/asset sale price' }
        ]
      },
      {
        id: 'warranties',
        question: 'What level of assignor warranties should be included?',
        helpText: 'Warranties protect the assignee regarding patent validity and ownership.',
        options: [
          { label: 'Full Warranties', value: 'full', description: 'Title, validity, non-infringement, no encumbrances' },
          { label: 'Standard Warranties', value: 'standard', description: 'Title and right to assign only' },
          { label: 'Limited/As-Is', value: 'limited', description: 'Minimal warranties, higher risk for assignee' }
        ]
      },
      {
        id: 'recordation',
        question: 'Who will handle IP Australia recordation?',
        helpText: 'The assignment must be recorded with IP Australia to be effective against third parties.',
        options: [
          { label: 'Assignor Handles', value: 'assignor', description: 'Seller/transferor files with IP Australia' },
          { label: 'Assignee Handles', value: 'assignee', description: 'Buyer/transferee files with IP Australia' },
          { label: 'Mutual Cooperation', value: 'mutual', description: 'Both parties cooperate on recordation' }
        ]
      },
      {
        id: 'related_rights',
        question: 'Are there related rights to include in the assignment?',
        helpText: 'Patents often have associated rights that should transfer together.',
        options: [
          { label: 'Patent Only', value: 'patent_only', description: 'Just the patent rights' },
          { label: 'Including Know-How', value: 'with_knowhow', description: 'Patent plus related trade secrets/know-how' },
          { label: 'Full IP Bundle', value: 'full_bundle', description: 'Patent, know-how, trademarks, and related IP' },
          { label: 'Including Foreign Filings', value: 'with_foreign', description: 'Australian and corresponding foreign patents' }
        ]
      }
    ]
  },

  'Trademark Assignment Agreement': {
    documentType: 'Trademark Assignment Agreement',
    displayName: 'Trademark Assignment Agreement',
    description: 'Transfer ownership of trademark rights under Australian Trade Marks Act',
    requiredFields: ['mark_type', 'goodwill', 'consideration'],
    questions: [
      {
        id: 'mark_type',
        question: 'What type of trademark is being assigned?',
        helpText: 'Different mark types may have different assignment requirements.',
        options: [
          { label: 'Registered Trademark', value: 'registered', description: 'Registered with IP Australia' },
          { label: 'Pending Application', value: 'pending', description: 'Application filed but not yet registered' },
          { label: 'Unregistered/Common Law Mark', value: 'unregistered', description: 'Protected by use, not registration' },
          { label: 'Multiple Marks/Portfolio', value: 'portfolio', description: 'Bundle of trademarks' }
        ]
      },
      {
        id: 'goodwill',
        question: 'Will the goodwill associated with the trademark be included?',
        helpText: 'Under Australian law, trademarks should generally be assigned with goodwill to avoid invalidity.',
        options: [
          { label: 'With Goodwill (Recommended)', value: 'with_goodwill', description: 'Standard and safest approach' },
          { label: 'Without Goodwill', value: 'without_goodwill', description: 'May affect validity - seek legal advice' },
          { label: 'Partial Goodwill', value: 'partial', description: 'Goodwill for specific goods/services only' }
        ]
      },
      {
        id: 'consideration',
        question: 'What is the payment structure for this assignment?',
        helpText: 'How will the assignee compensate the assignor for the trademark rights?',
        options: [
          { label: 'Lump Sum Payment', value: 'lump_sum', description: 'Single one-time payment' },
          { label: 'Royalty-Based', value: 'royalties', description: 'Ongoing percentage of revenue' },
          { label: 'Lump Sum + Royalties', value: 'hybrid', description: 'Upfront payment plus ongoing royalties' },
          { label: 'Part of Larger Transaction', value: 'deal_component', description: 'Included in business sale price' }
        ]
      },
      {
        id: 'warranties',
        question: 'What level of assignor warranties should be included?',
        helpText: 'Warranties protect the assignee regarding trademark validity and ownership.',
        options: [
          { label: 'Full Warranties', value: 'full', description: 'Title, validity, non-infringement, proper use' },
          { label: 'Standard Warranties', value: 'standard', description: 'Title and right to assign only' },
          { label: 'Limited/As-Is', value: 'limited', description: 'Minimal warranties' }
        ]
      },
      {
        id: 'quality_control',
        question: 'Are there ongoing quality control or use requirements?',
        helpText: 'Maintaining trademark quality is important for continued validity.',
        options: [
          { label: 'No Ongoing Requirements', value: 'none', description: 'Clean assignment with no strings' },
          { label: 'Quality Standards Required', value: 'quality', description: 'Assignee must maintain quality standards' },
          { label: 'Transition Period Support', value: 'transition', description: 'Assignor assists during handover period' }
        ]
      }
    ]
  },

  'IP License Agreement': {
    documentType: 'IP License Agreement',
    displayName: 'IP License Agreement',
    description: 'Grant rights to use intellectual property without transferring ownership',
    requiredFields: ['ip_type', 'exclusivity', 'territory'],
    questions: [
      {
        id: 'ip_type',
        question: 'What type of intellectual property is being licensed?',
        helpText: 'Different IP types have different licensing considerations.',
        options: [
          { label: 'Patents', value: 'patent', description: 'Invention/utility patents' },
          { label: 'Trademarks', value: 'trademark', description: 'Brand marks and logos' },
          { label: 'Copyright', value: 'copyright', description: 'Creative works, software, content' },
          { label: 'Trade Secrets/Know-How', value: 'knowhow', description: 'Confidential business information' },
          { label: 'Multiple IP Types', value: 'mixed', description: 'Bundle of different IP rights' }
        ]
      },
      {
        id: 'exclusivity',
        question: 'What type of license exclusivity is required?',
        helpText: 'Exclusivity affects both pricing and the rights of each party.',
        options: [
          { label: 'Exclusive License', value: 'exclusive', description: 'Only licensee can use, even licensor cannot' },
          { label: 'Sole License', value: 'sole', description: 'Licensee plus licensor can use, no other licensees' },
          { label: 'Non-Exclusive License', value: 'non_exclusive', description: 'Licensor can grant to multiple parties' }
        ]
      },
      {
        id: 'territory',
        question: 'What is the geographic scope of the license?',
        helpText: 'Territory restrictions define where the licensee can exercise rights.',
        options: [
          { label: 'Australia Only', value: 'australia', description: 'Limited to Australian territory' },
          { label: 'Australia & New Zealand', value: 'anz', description: 'ANZ region coverage' },
          { label: 'Asia-Pacific', value: 'apac', description: 'Broader regional rights' },
          { label: 'Worldwide', value: 'worldwide', description: 'No territorial restrictions' }
        ]
      },
      {
        id: 'term',
        question: 'What is the license term?',
        helpText: 'How long will the license remain in effect?',
        options: [
          { label: '1 Year (Renewable)', value: '1_year', description: 'Short term with renewal options' },
          { label: '3 Years', value: '3_years', description: 'Medium-term commitment' },
          { label: '5 Years', value: '5_years', description: 'Longer-term arrangement' },
          { label: 'Perpetual', value: 'perpetual', description: 'No expiration date' },
          { label: 'Term of IP Rights', value: 'ip_term', description: 'Until underlying IP expires' }
        ]
      },
      {
        id: 'payment',
        question: 'What is the license fee structure?',
        helpText: 'How will the licensee pay for the license rights?',
        options: [
          { label: 'Upfront Fee Only', value: 'upfront', description: 'Single payment for full term' },
          { label: 'Running Royalties', value: 'royalties', description: 'Ongoing percentage of sales/revenue' },
          { label: 'Upfront + Royalties', value: 'hybrid', description: 'Initial fee plus ongoing royalties' },
          { label: 'Minimum Guarantees + Royalties', value: 'minimum_plus', description: 'Floor payments plus performance royalties' }
        ]
      }
    ]
  }
};

/**
 * Document type aliases for flexible matching
 */
export const DOCUMENT_TYPE_ALIASES: Record<string, string> = {
  // Patent aliases
  'patent': 'Patent Assignment Agreement',
  'patent assignment': 'Patent Assignment Agreement',
  'patent transfer': 'Patent Assignment Agreement',
  'invention': 'Patent Assignment Agreement',
  'utility patent': 'Patent Assignment Agreement',
  
  // Trademark aliases
  'trademark': 'Trademark Assignment Agreement',
  'trademark assignment': 'Trademark Assignment Agreement',
  'trade mark': 'Trademark Assignment Agreement',
  'brand': 'Trademark Assignment Agreement',
  'logo': 'Trademark Assignment Agreement',
  
  // IP License aliases
  'ip license': 'IP License Agreement',
  'license': 'IP License Agreement',
  'licence': 'IP License Agreement',
  'licensing': 'IP License Agreement',
  'technology license': 'IP License Agreement',
  
  // NDA aliases
  'nda': 'Non-Disclosure Agreement',
  'confidentiality': 'Non-Disclosure Agreement',
  'confidential': 'Non-Disclosure Agreement',
  'non disclosure': 'Non-Disclosure Agreement',
  
  // LOI aliases
  'loi': 'Letter of Intent',
  'letter of intent': 'Letter of Intent',
  'heads of agreement': 'Letter of Intent',
  'term sheet': 'Letter of Intent',
  
  // Asset Purchase aliases
  'apa': 'Asset Purchase Agreement',
  'asset purchase': 'Asset Purchase Agreement',
  'asset sale': 'Asset Purchase Agreement',
  'business assets': 'Asset Purchase Agreement',
  
  // Share Purchase aliases
  'spa': 'Share Purchase Agreement',
  'share purchase': 'Share Purchase Agreement',
  'share sale': 'Share Purchase Agreement',
  'equity purchase': 'Share Purchase Agreement',
  'stock purchase': 'Share Purchase Agreement',
  
  // Employment aliases
  'employment': 'Employment Contract',
  'employment contract': 'Employment Contract',
  'employment agreement': 'Employment Contract',
  'job contract': 'Employment Contract',
  
  // Service Agreement aliases
  'service': 'Service Agreement',
  'service agreement': 'Service Agreement',
  'services': 'Service Agreement',
  'consulting': 'Service Agreement',
  'consulting agreement': 'Service Agreement',
  
  // Terms and Conditions aliases
  'terms': 'Terms and Conditions',
  'terms and conditions': 'Terms and Conditions',
  't&c': 'Terms and Conditions',
  'tos': 'Terms and Conditions',
  'terms of service': 'Terms and Conditions'
};

/**
 * Match user input to a document type using aliases and fuzzy matching
 */
export function matchDocumentType(userInput: string): string | null {
  const normalized = userInput.toLowerCase().trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check direct alias match
  if (DOCUMENT_TYPE_ALIASES[normalized]) {
    return DOCUMENT_TYPE_ALIASES[normalized];
  }
  
  // Check if input contains an alias
  for (const [alias, docType] of Object.entries(DOCUMENT_TYPE_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return docType;
    }
  }
  
  // Check direct document type match
  const allTypes = Object.keys(QUESTION_FLOWS);
  for (const type of allTypes) {
    const typeNorm = type.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    if (normalized === typeNorm || normalized.includes(typeNorm) || typeNorm.includes(normalized)) {
      return type;
    }
  }
  
  return null;
}

/**
 * Get the question flow for a document type
 */
export function getQuestionFlow(documentType: string): DocumentQuestionFlow | null {
  return QUESTION_FLOWS[documentType] || null;
}

/**
 * Get all available document types
 */
export function getAvailableDocumentTypes(): Array<{type: string; displayName: string; description: string}> {
  return Object.entries(QUESTION_FLOWS).map(([type, flow]) => ({
    type,
    displayName: flow.displayName,
    description: flow.description
  }));
}

/**
 * Build conversational system prompt with question flow
 */
export function buildConversationalPrompt(
  documentType: string,
  dealContext: Record<string, any>,
  gatheredAnswers: Record<string, any>,
  currentQuestionIndex: number
): string {
  const flow = QUESTION_FLOWS[documentType];
  if (!flow) {
    return `You are a helpful legal document assistant. The user wants to create a ${documentType}. Ask relevant questions to gather requirements.`;
  }

  const answeredQuestions = Object.keys(gatheredAnswers);
  const remainingQuestions = flow.questions.filter(q => !answeredQuestions.includes(q.id));
  const progress = `${answeredQuestions.length}/${flow.questions.length}`;

  return `You are an expert Australian legal document assistant helping create a ${flow.displayName}.

DEAL CONTEXT:
${JSON.stringify(dealContext, null, 2)}

PROGRESS: ${progress} questions answered

ANSWERS GATHERED SO FAR:
${Object.entries(gatheredAnswers).map(([key, value]) => `- ${key}: ${value}`).join('\n') || 'None yet'}

REMAINING QUESTIONS TO ASK:
${remainingQuestions.map((q, i) => `${i + 1}. [${q.id}] ${q.question}`).join('\n')}

INSTRUCTIONS:
1. If there are remaining questions, ask the NEXT question naturally
2. Use the deal context to personalize the question
3. Present the options clearly
4. Explain briefly why this matters for their document
5. If all questions are answered, confirm you're ready to generate

IMPORTANT:
- Ask ONE question at a time
- Be conversational and helpful
- Use Australian legal terminology
- Reference deal details when relevant`;
}

/**
 * Parse user response to extract selected option
 */
export function parseUserResponse(
  userMessage: string,
  currentQuestion: SmartQuestion
): { answerId: string; answerValue: string } | null {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check for exact option label match
  for (const option of currentQuestion.options) {
    if (lowerMessage.includes(option.label.toLowerCase()) || 
        lowerMessage.includes(option.value.toLowerCase())) {
      return { answerId: currentQuestion.id, answerValue: option.value };
    }
  }
  
  // Check for numbered response (1, 2, 3, etc.)
  const numberMatch = lowerMessage.match(/^(\d+)\.?$/);
  if (numberMatch) {
    const index = parseInt(numberMatch[1]) - 1;
    if (index >= 0 && index < currentQuestion.options.length) {
      const option = currentQuestion.options[index];
      return { answerId: currentQuestion.id, answerValue: option.value };
    }
  }
  
  // Allow custom response if enabled
  if (currentQuestion.allowCustom) {
    return { answerId: currentQuestion.id, answerValue: userMessage };
  }
  
  return null;
}

/**
 * Check if all required questions have been answered
 */
export function isReadyToGenerate(
  documentType: string,
  gatheredAnswers: Record<string, any>
): boolean {
  const flow = QUESTION_FLOWS[documentType];
  if (!flow) return false;
  
  return flow.requiredFields.every(field => gatheredAnswers[field] !== undefined);
}

/**
 * Format gathered answers for document generation
 */
export function formatAnswersForGeneration(
  documentType: string,
  gatheredAnswers: Record<string, any>,
  dealContext: Record<string, any>
): string {
  const flow = QUESTION_FLOWS[documentType];
  if (!flow) return JSON.stringify(gatheredAnswers);
  
  let formatted = `DOCUMENT TYPE: ${flow.displayName}\n\n`;
  formatted += `USER REQUIREMENTS:\n`;
  
  for (const question of flow.questions) {
    const answer = gatheredAnswers[question.id];
    if (answer) {
      const option = question.options.find(o => o.value === answer);
      formatted += `- ${question.question}\n`;
      formatted += `  Answer: ${option?.label || answer}`;
      if (option?.description) {
        formatted += ` (${option.description})`;
      }
      formatted += `\n\n`;
    }
  }
  
  return formatted;
}
