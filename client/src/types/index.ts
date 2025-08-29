export interface BonusRecommendation {
  id: string;
  operator: {
    id: string;
    name: string;
    logo: string;
    trustScore: string;
  };
  title: string;
  description: string;
  valueScore: number;
  rationale: string;
  matchPercent: string;
  maxBonus: string;
  minDeposit: string;
  wageringRequirement: string;
  expiryDays: number;
  landingUrl: string;
  productType: string;
  existingUserEligible?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  recommendations?: BonusRecommendation[];
  isInitialMessage?: boolean;
}

export interface UserIntent {
  budget?: number;
  currency?: string;
  location?: string;
  productType?: string;
  games?: string[];
  userStatus?: "new" | "existing";
  preferences?: string[];
  riskTolerance?: "low" | "medium" | "high";
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  recommendations: BonusRecommendation[];
  intent: UserIntent;
}

export interface FilterOptions {
  productType?: string;
  location?: string;
  budget?: number;
  minValueScore?: number;
}
