// ============ Types ============
export interface OntologyQuestion {
  id: string;
  source: 'structural' | 'inference' | 'runtime';
  summary: string;
  fullDescription: string;
  currentDefinition: string;
  domain: string;
  status: 'pending_dispatch' | 'pending_answer' | 'concluded' | 'timeout' | 'closed';
  priority: 'high' | 'medium' | 'low';
  consensusTotal: number;
  consensusAnswered: number;
  consensusConsistency: number;
  consensusThreshold: number;
  runtimeTrace?: { agentId: string; date: string; snippet: string[] };
  answers: ExpertAnswer[];
  dispatchStages: DispatchStage[];
  options?: string[];
  correctAnswer?: string;
}

export interface ExpertAnswer {
  expertId: string;
  expertName: string;
  domain: string;
  conclusion: 'correct' | 'incorrect' | 'uncertain';
  note?: string;
  time: string;
}

export interface DispatchStage {
  stage: number;
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
  experts: string[];
}

export interface Expert {
  id: string;
  name: string;
  avatar: string;
  domains: string[];
  department: string;
  email: string;
  online: boolean;
  taskMode: 'hard_limit' | 'soft_limit';
  dailyLimit: number;
  dailyCompleted: number;
  totalContributions: number;
  totalAnswers: number;
  correctionRate: number;
}

export interface MyTask {
  id: string;
  questionId: string;
  summary: string;
  domain: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'replied';
  assignedDate: string;
  repliedDate?: string;
  conclusion?: 'correct' | 'incorrect' | 'uncertain';
  note?: string;
}

export interface OntologyIssue {
  id: string;
  questionId: string;
  description: string;
  status: 'pending_fix' | 'fixing' | 'fixed';
  fixType: 'ai_auto' | 'manual';
  createdAt: string;
  beforeDefinition?: string;
  afterDefinition?: string;
}

export interface DomainHealth {
  name: string;
  accuracy: number;
  activeQuestions: number;
  activeExperts: number;
}

// ============ Mock Data ============

export const domainHealthData: DomainHealth[] = [
  { name: 'Logistics', accuracy: 94.2, activeQuestions: 3, activeExperts: 4 },
  { name: 'Sales', accuracy: 88.7, activeQuestions: 5, activeExperts: 3 },
  { name: 'Finance', accuracy: 96.1, activeQuestions: 2, activeExperts: 2 },
  { name: 'Warehouse', accuracy: 72.3, activeQuestions: 6, activeExperts: 3 },
  { name: 'Support', accuracy: 91.0, activeQuestions: 2, activeExperts: 2 },
];

export const topExperts: Expert[] = [
  { id: 'e1', name: 'Alex Chen', avatar: 'AC', domains: ['Logistics Pricing', 'Warehouse Mgmt'], department: 'Supply Chain', email: 'alex.chen@example.com', online: true, taskMode: 'hard_limit', dailyLimit: 5, dailyCompleted: 4, totalContributions: 87, totalAnswers: 142, correctionRate: 93.2 },
  { id: 'e2', name: 'Brian Li', avatar: 'BL', domains: ['Logistics Pricing'], department: 'Supply Chain', email: 'brian.li@example.com', online: true, taskMode: 'soft_limit', dailyLimit: 5, dailyCompleted: 5, totalContributions: 72, totalAnswers: 118, correctionRate: 89.5 },
  { id: 'e3', name: 'Carol Wang', avatar: 'CW', domains: ['Sales Strategy', 'Customer Mgmt'], department: 'Sales', email: 'carol.wang@example.com', online: false, taskMode: 'hard_limit', dailyLimit: 3, dailyCompleted: 2, totalContributions: 65, totalAnswers: 103, correctionRate: 91.0 },
  { id: 'e4', name: 'David Zhao', avatar: 'DZ', domains: ['Financial Accounting'], department: 'Finance', email: 'david.zhao@example.com', online: true, taskMode: 'hard_limit', dailyLimit: 4, dailyCompleted: 4, totalContributions: 58, totalAnswers: 95, correctionRate: 95.8 },
  { id: 'e5', name: 'Eva Sun', avatar: 'ES', domains: ['Warehouse Mgmt', 'Logistics Dispatch'], department: 'Operations', email: 'eva.sun@example.com', online: true, taskMode: 'soft_limit', dailyLimit: 5, dailyCompleted: 3, totalContributions: 43, totalAnswers: 71, correctionRate: 87.3 },
  { id: 'e6', name: 'Frank Zhou', avatar: 'FZ', domains: ['Support Process', 'Sales Strategy'], department: 'Customer Support', email: 'frank.zhou@example.com', online: false, taskMode: 'hard_limit', dailyLimit: 4, dailyCompleted: 1, totalContributions: 31, totalAnswers: 52, correctionRate: 90.1 },
];

export const questions: OntologyQuestion[] = [
  {
    id: 'Q-0847',
    source: 'runtime',
    summary: '"Customer Discount" definition conflicts with Sales Agent behavior',
    fullDescription: 'The Sales Agent interprets "Customer Discount" as a tiered discount based on historical order volume, but the ontology defines it as a fixed discount rate based on customer tier. The two differ fundamentally in calculation logic.',
    currentDefinition: 'Customer Discount: A fixed discount rate based on customer tier (A/B/C) — Tier A 15%, Tier B 10%, Tier C 5%.',
    domain: 'Sales',
    status: 'pending_answer',
    priority: 'high',
    consensusTotal: 5,
    consensusAnswered: 3,
    consensusConsistency: 67,
    consensusThreshold: 80,
    options: [
      'The current definition is correct',
      'Should support both tier-based and volume-based discount models',
      'Need to clarify the calculation logic in the definition',
      'Uncertain, requires more context'
    ],
    runtimeTrace: {
      agentId: 'Agent #12',
      date: '2026-03-15',
      snippet: [
        'Customer: We placed $2M in orders last quarter — can we get a bigger discount?',
        'Agent: Based on your order history, you qualify for a tiered discount. $2M corresponds to an 18% rate.',
        'Customer: Sounds good, let\'s go with 18%.',
        'System Alert: This discount rate conflicts with the ontology-defined tier discount (Tier A = 15%).',
      ],
    },
    answers: [
      { expertId: 'e1', expertName: 'Alex Chen', domain: 'Logistics Pricing', conclusion: 'incorrect', note: 'Should support both tier-based and volume-based discount models', time: '2026-03-16 09:30' },
      { expertId: 'e3', expertName: 'Carol Wang', domain: 'Sales Strategy', conclusion: 'incorrect', note: 'Ontology definition is oversimplified; real-world discount policies are more complex', time: '2026-03-16 10:15' },
      { expertId: 'e4', expertName: 'David Zhao', domain: 'Financial Accounting', conclusion: 'correct', time: '2026-03-16 11:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'completed', experts: ['Alex Chen', 'Carol Wang'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'in_progress', experts: ['David Zhao'] },
    ],
  },
  {
    id: 'Q-0848',
    source: 'structural',
    summary: '"Shipping SLA" node missing cold-chain logistics definition',
    fullDescription: 'The ontology\'s "Shipping SLA" only defines standard logistics timelines and does not cover cold-chain scenarios, which have significantly different requirements.',
    currentDefinition: 'Shipping SLA: Standard logistics 3–5 business days, express logistics 1–2 business days.',
    domain: 'Logistics',
    status: 'pending_dispatch',
    priority: 'medium',
    consensusTotal: 5,
    consensusAnswered: 0,
    consensusConsistency: 0,
    consensusThreshold: 80,
    options: [
      'The current definition is correct',
      'Add cold-chain logistics timeline (24-48 hours)',
      'Add temperature-controlled shipping requirements',
      'Uncertain, need more information'
    ],
    answers: [],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'pending', experts: [] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0849',
    source: 'inference',
    summary: '"Inventory Alert Threshold" and "Safety Stock" concepts overlap',
    fullDescription: 'Logical inference reveals that "Inventory Alert Threshold" and "Safety Stock" are semantically overlapping, potentially causing agents to give contradictory recommendations in different contexts.',
    currentDefinition: 'Inventory Alert Threshold: triggers an alert when stock falls below this value. Safety Stock: the minimum stock level required for normal operations.',
    domain: 'Warehouse',
    status: 'pending_answer',
    priority: 'high',
    consensusTotal: 5,
    consensusAnswered: 2,
    consensusConsistency: 100,
    consensusThreshold: 80,
    options: [
      'The current definitions are correct',
      'Merge the two concepts into a unified Safety Stock definition',
      'Keep separate but clarify the relationship',
      'Uncertain, need domain expert input'
    ],
    answers: [
      { expertId: 'e5', expertName: 'Eva Sun', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'The two concepts should be merged into a unified Safety Stock definition', time: '2026-03-16 14:00' },
      { expertId: 'e1', expertName: 'Alex Chen', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Agree on merging; alert threshold should be a trigger condition of safety stock', time: '2026-03-16 14:30' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'completed', experts: ['Eva Sun', 'Alex Chen'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0850',
    source: 'runtime',
    summary: '"Return Policy" interpreted inconsistently by Support Agent',
    fullDescription: 'The Support Agent handles return requests inconsistently — sometimes counting the 7-day window from delivery date, sometimes from order date.',
    currentDefinition: 'Return Policy: Consumers may return items without reason within 7 days of receiving the goods.',
    domain: 'Support',
    status: 'concluded',
    priority: 'medium',
    consensusTotal: 5,
    consensusAnswered: 5,
    consensusConsistency: 100,
    consensusThreshold: 80,
    correctAnswer: 'The current ontology definition is correct and should be maintained.',
    options: [
      'The current definition is correct',
      'Clarify "receiving the goods" as delivery confirmation date',
      'Change to 7 days from order date',
      'Uncertain, need legal review'
    ],
    answers: [
      { expertId: 'e6', expertName: 'Frank Zhou', domain: 'Support Process', conclusion: 'correct', time: '2026-03-15 09:00' },
      { expertId: 'e3', expertName: 'Carol Wang', domain: 'Sales Strategy', conclusion: 'correct', time: '2026-03-15 09:30' },
      { expertId: 'e1', expertName: 'Alex Chen', domain: 'Logistics Pricing', conclusion: 'correct', time: '2026-03-15 10:00' },
      { expertId: 'e4', expertName: 'David Zhao', domain: 'Financial Accounting', conclusion: 'correct', time: '2026-03-15 10:30' },
      { expertId: 'e5', expertName: 'Eva Sun', domain: 'Warehouse Mgmt', conclusion: 'correct', time: '2026-03-15 11:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'completed', experts: ['Frank Zhou', 'Carol Wang'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'completed', experts: ['Alex Chen'] },
    ],
  },
  {
    id: 'Q-0851',
    source: 'structural',
    summary: '"Supplier Rating" missing on-time delivery dimension',
    fullDescription: 'Structural traversal found that the "Supplier Rating" node only includes price and quality dimensions, missing the critical on-time delivery metric.',
    currentDefinition: 'Supplier Rating: A composite score based on price competitiveness (40%) and product quality (60%).',
    domain: 'Logistics',
    status: 'pending_dispatch',
    priority: 'low',
    consensusTotal: 5,
    consensusAnswered: 0,
    consensusConsistency: 0,
    consensusThreshold: 80,
    options: [
      'The current definition is correct',
      'Add on-time delivery as a third dimension (33% weight)',
      'Rebalance to price 30%, quality 40%, delivery 30%',
      'Uncertain, need supply chain expert input'
    ],
    answers: [],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'pending', experts: [] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0852',
    source: 'runtime',
    summary: '"Order Priority" calculation misused by Finance Agent',
    fullDescription: 'The Finance Agent incorrectly uses "Order Priority" to sort invoices in accounts receivable reports, but this field is intended only for logistics dispatch.',
    currentDefinition: 'Order Priority: A logistics dispatch priority calculated from customer tier and order amount, classified as P1/P2/P3.',
    domain: 'Finance',
    status: 'timeout',
    priority: 'high',
    consensusTotal: 5,
    consensusAnswered: 1,
    consensusConsistency: 0,
    consensusThreshold: 80,
    options: [
      'The current definition is correct',
      'Clarify that Order Priority is for logistics only',
      'Create a separate Financial Priority field',
      'Uncertain, need cross-department review'
    ],
    runtimeTrace: {
      agentId: 'Agent #7',
      date: '2026-03-14',
      snippet: [
        'System: Generate this month\'s accounts receivable report.',
        'Agent: Sorting receivables by Order Priority P1 > P2 > P3...',
        'System Alert: Order Priority field is not applicable for financial report sorting.',
      ],
    },
    answers: [
      { expertId: 'e4', expertName: 'David Zhao', domain: 'Financial Accounting', conclusion: 'incorrect', note: 'Financial reports should be sorted by payment terms and amount, not logistics priority', time: '2026-03-15 16:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'in_progress', experts: ['David Zhao', 'Frank Zhou'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0853',
    source: 'structural',
    summary: 'WMS inbound SOP missing cross-dock receiving workflow',
    fullDescription: 'The WMS inbound SOP only covers standard receiving. Cross-dock scenarios where goods bypass storage and go directly to outbound docks are not defined.',
    currentDefinition: 'Inbound SOP: Goods arrive → unload → quality check → put-away to designated bin.',
    domain: 'Warehouse',
    status: 'pending_answer',
    priority: 'high',
    consensusTotal: 5,
    consensusAnswered: 1,
    consensusConsistency: 100,
    consensusThreshold: 80,
    options: [
      'The current SOP is correct',
      'Add cross-dock flow as a parallel branch',
      'Add cross-dock as a conditional step in the main flow',
      'Uncertain, need warehouse operations review'
    ],
    answers: [
      { expertId: 'e5', expertName: 'Eva Sun', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Cross-dock flow must be added as a parallel branch in the SOP', time: '2026-03-17 09:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'in_progress', experts: ['Eva Sun', 'Alex Chen'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0854',
    source: 'runtime',
    summary: 'WMS inbound SOP quality check step skipped by automation agent',
    fullDescription: 'The warehouse automation agent skips the quality check step for trusted suppliers, but the ontology SOP mandates quality checks for all inbound goods without exception.',
    currentDefinition: 'Inbound SOP quality check: All inbound goods must undergo quality inspection before put-away, no exceptions.',
    domain: 'Warehouse',
    status: 'pending_dispatch',
    priority: 'medium',
    consensusTotal: 5,
    consensusAnswered: 0,
    consensusConsistency: 0,
    consensusThreshold: 80,
    options: [
      'The current SOP is correct',
      'Allow trusted suppliers to skip quality check',
      'Add sampling inspection for trusted suppliers',
      'Uncertain, need quality control review'
    ],
    runtimeTrace: {
      agentId: 'Agent #19',
      date: '2026-03-16',
      snippet: [
        'System: Inbound shipment from Supplier-A (trusted) arrived.',
        'Agent: Trusted supplier detected. Skipping quality check, proceeding to put-away.',
        'System Alert: SOP violation — quality check step was skipped.',
      ],
    },
    answers: [],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'pending', experts: [] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0855',
    source: 'inference',
    summary: 'WMS inbound SOP put-away rule conflicts with FIFO rotation policy',
    fullDescription: 'Logical inference found that the inbound SOP assigns put-away bins by proximity, which can violate the FIFO stock rotation policy when older stock is in farther bins.',
    currentDefinition: 'Put-away rule: Assign the nearest available bin to minimize travel time.',
    domain: 'Warehouse',
    status: 'concluded',
    priority: 'low',
    consensusTotal: 5,
    consensusAnswered: 5,
    consensusConsistency: 80,
    consensusThreshold: 80,
    correctAnswer: 'Put-away should consider FIFO compliance, not just proximity. FIFO must take priority over travel time optimization.',
    options: [
      'The current rule is correct',
      'Put-away should consider FIFO, not just proximity',
      'Add FIFO as a secondary consideration',
      'Uncertain, need warehouse operations review'
    ],
    answers: [
      { expertId: 'e5', expertName: 'Eva Sun', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Put-away should consider FIFO, not just proximity', time: '2026-03-14 10:00' },
      { expertId: 'e1', expertName: 'Alex Chen', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Agree — FIFO compliance must take priority', time: '2026-03-14 11:00' },
      { expertId: 'e4', expertName: 'David Zhao', domain: 'Financial Accounting', conclusion: 'incorrect', note: 'FIFO is also a financial compliance requirement', time: '2026-03-14 14:00' },
      { expertId: 'e3', expertName: 'Carol Wang', domain: 'Sales Strategy', conclusion: 'correct', time: '2026-03-14 15:00' },
      { expertId: 'e6', expertName: 'Frank Zhou', domain: 'Support Process', conclusion: 'incorrect', note: 'Customers complain about receiving old stock', time: '2026-03-14 16:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'completed', experts: ['Eva Sun', 'Alex Chen'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'completed', experts: ['David Zhao'] },
    ],
  },
  {
    id: 'Q-0856',
    source: 'structural',
    summary: '"Outbound picking strategy" missing batch-pick definition for high-volume SKUs',
    fullDescription: 'The outbound picking strategy only defines single-order picking. Batch picking for high-volume SKUs is not covered, leading to inefficient warehouse operations.',
    currentDefinition: 'Picking strategy: Pick items per individual order, one order at a time.',
    domain: 'Warehouse',
    status: 'pending_answer',
    priority: 'medium',
    consensusTotal: 5,
    consensusAnswered: 2,
    consensusConsistency: 100,
    consensusThreshold: 80,
    options: [
      'The current strategy is correct',
      'Add batch picking for SKUs with >50 daily orders',
      'Add wave picking for peak hours',
      'Uncertain, need warehouse operations input'
    ],
    answers: [
      { expertId: 'e5', expertName: 'Eva Sun', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Batch picking should be the default for SKUs with >50 daily orders', time: '2026-03-17 08:00' },
      { expertId: 'e1', expertName: 'Alex Chen', domain: 'Warehouse Mgmt', conclusion: 'incorrect', note: 'Wave picking should also be considered for peak hours', time: '2026-03-17 09:30' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'completed', experts: ['Eva Sun', 'Alex Chen'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
  {
    id: 'Q-0857',
    source: 'runtime',
    summary: '"Lead time" calculation ignores regional holiday calendars',
    fullDescription: 'The logistics agent calculates lead time using business days but does not account for regional holidays, causing inaccurate delivery estimates.',
    currentDefinition: 'Lead time: Calculated as business days (Mon–Fri) from order confirmation to estimated delivery.',
    domain: 'Logistics',
    status: 'pending_answer',
    priority: 'high',
    consensusTotal: 5,
    consensusAnswered: 1,
    consensusConsistency: 100,
    consensusThreshold: 80,
    options: [
      'The current calculation is correct',
      'Integrate regional holiday API for accurate calculation',
      'Add manual holiday calendar configuration',
      'Uncertain, need logistics operations input'
    ],
    answers: [
      { expertId: 'e2', expertName: 'Brian Li', domain: 'Logistics Pricing', conclusion: 'incorrect', note: 'Must integrate regional holiday API for accurate calculation', time: '2026-03-17 10:00' },
    ],
    dispatchStages: [
      { stage: 1, label: 'Initial dispatch (2 junior experts)', status: 'in_progress', experts: ['Brian Li', 'Alex Chen'] },
      { stage: 2, label: 'Escalation (1 senior expert arbitration)', status: 'pending', experts: [] },
    ],
  },
];

export const issues: OntologyIssue[] = [
  {
    id: 'ISS-001',
    questionId: 'Q-0850',
    description: '"Return Policy" start date needs to be clarified as delivery date',
    status: 'fixed',
    fixType: 'ai_auto',
    createdAt: '2026-03-15',
    beforeDefinition: 'Return Policy: Consumers may return items without reason within 7 days of receiving the goods.',
    afterDefinition: 'Return Policy: Consumers may return items without reason within 7 calendar days of logistics delivery confirmation (as recorded in the logistics system).',
  },
  {
    id: 'ISS-002',
    questionId: 'Q-0839',
    description: '"Storage Fee" formula missing cold storage surcharge',
    status: 'fixing',
    fixType: 'manual',
    createdAt: '2026-03-14',
  },
  {
    id: 'ISS-003',
    questionId: 'Q-0835',
    description: '"Customer Tier" criteria missing annual purchase frequency dimension',
    status: 'pending_fix',
    fixType: 'ai_auto',
    createdAt: '2026-03-13',
  },
  {
    id: 'ISS-004',
    questionId: 'Q-0828',
    description: '"Logistics Route" optimization missing restricted zone handling',
    status: 'fixed',
    fixType: 'manual',
    createdAt: '2026-03-12',
    beforeDefinition: 'Logistics Route: Optimal path calculation based on distance and cost.',
    afterDefinition: 'Logistics Route: Optimal path calculation based on distance, cost, restricted zones, and time windows, with real-time traffic regulation data.',
  },
];

export const accuracyTrend = [
  { week: 'W1', Logistics: 89.2, Sales: 85.1, Finance: 93.5, Warehouse: 68.4, Support: 88.0 },
  { week: 'W2', Logistics: 90.1, Sales: 86.3, Finance: 94.2, Warehouse: 69.8, Support: 89.2 },
  { week: 'W3', Logistics: 91.5, Sales: 87.0, Finance: 95.0, Warehouse: 70.5, Support: 89.8 },
  { week: 'W4', Logistics: 92.8, Sales: 87.9, Finance: 95.5, Warehouse: 71.2, Support: 90.5 },
  { week: 'W5', Logistics: 94.2, Sales: 88.7, Finance: 96.1, Warehouse: 72.3, Support: 91.0 },
];

// Current user mock (Alex Chen)
export const currentUser = topExperts[0];

// Personal tasks for Alex Chen
export const myTasks: MyTask[] = [
  { id: 'MT-001', questionId: 'Q-0847', summary: '"Customer Discount" definition conflicts with Sales Agent behavior', domain: 'Sales', priority: 'high', status: 'replied', assignedDate: '2026-03-16', repliedDate: '2026-03-16', conclusion: 'incorrect', note: 'Should support both tier-based and volume-based discount models' },
  { id: 'MT-002', questionId: 'Q-0849', summary: '"Inventory Alert Threshold" and "Safety Stock" concepts overlap', domain: 'Warehouse', priority: 'high', status: 'replied', assignedDate: '2026-03-16', repliedDate: '2026-03-16', conclusion: 'incorrect', note: 'Agree on merging; alert threshold should be a trigger condition of safety stock' },
  { id: 'MT-003', questionId: 'Q-0853', summary: 'WMS inbound SOP missing cross-dock receiving workflow', domain: 'Warehouse', priority: 'high', status: 'todo', assignedDate: '2026-03-18' },
  { id: 'MT-004', questionId: 'Q-0855', summary: 'WMS inbound SOP put-away rule conflicts with FIFO rotation policy', domain: 'Warehouse', priority: 'low', status: 'replied', assignedDate: '2026-03-14', repliedDate: '2026-03-14', conclusion: 'incorrect', note: 'Agree — FIFO compliance must take priority' },
  { id: 'MT-005', questionId: 'Q-0856', summary: '"Outbound picking strategy" missing batch-pick definition for high-volume SKUs', domain: 'Warehouse', priority: 'medium', status: 'todo', assignedDate: '2026-03-18' },
  { id: 'MT-006', questionId: 'Q-0857', summary: '"Lead time" calculation ignores regional holiday calendars', domain: 'Logistics', priority: 'high', status: 'todo', assignedDate: '2026-03-18' },
];
