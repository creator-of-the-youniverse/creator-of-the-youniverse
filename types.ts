export interface ValidationReport {
  offerName: string;
  coreProblem: string;
  targetCustomer: string;
  pricing: string;
  differentiation: string;
  validationScore: number;
  scoringBreakdown: {
    problemClarity: { score: number; rationale: string };
    customerSpecificity: { score: number; rationale: string };
    pricingConfidence: { score: number; rationale: string };
    differentiationStrength: { score: number; rationale: string };
    demandEvidence: { score: number; rationale: string };
  };
  strengths: string[];
  weaknesses: string[];
  offerRefinement: Array<{
    priority: number;
    issue: string; // Used for "Priority X: [Highest impact fix]"
    currentState: string;
    targetState: string;
    action: string;
  }>;
  marketMessageMatch: string;
}

export enum AppState {
  WELCOME,
  QUESTIONS,
  ANALYZING,
  REPORT,
  COMMITTING,
  FINISHED
}
