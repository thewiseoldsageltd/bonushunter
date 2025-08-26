interface BonusData {
  matchPercent: string;
  minDeposit: string;
  maxBonus: string;
  wageringRequirement: string;
  wageringUnit: string;
  eligibleGames: string[];
  gameWeightings: Record<string, number>;
  maxCashout: string;
  expiryDays: string;
  paymentMethodExclusions: string[];
}

interface EVCalculation {
  expectedValue: number;
  valueScore: number;
  breakdown: {
    bonusAmount: number;
    wageringCost: number;
    effectiveRTP: number;
    penalties: number;
    depositAmount: number;
  };
}

export function calculateBonusEV(
  bonusData: Partial<BonusData>,
  userBudget: number = 100
): EVCalculation {
  // Input validation and defaults
  const matchPercent = Number(bonusData.matchPercent || 0) / 100;
  const maxBonus = Number(bonusData.maxBonus || 1000);
  const minDeposit = Number(bonusData.minDeposit || 10);
  const wageringReq = Number(bonusData.wageringRequirement || 0);
  const maxCashout = bonusData.maxCashout ? Number(bonusData.maxCashout) : null;
  const expiryDays = Number(bonusData.expiryDays || 30);
  
  // Handle fixed-amount bonuses vs percentage match bonuses
  let bonusAmount: number;
  let depositAmount: number;
  
  if (matchPercent === 0 && maxBonus > 0) {
    // Fixed-amount bonus: "Bet $X, Get $Y" - bonus amount is fixed regardless of deposit
    bonusAmount = maxBonus;
    depositAmount = minDeposit; // Use minimum deposit for fixed bonuses
  } else {
    // Percentage match bonus: deposit * matchPercent, capped at maxBonus
    const maxEligibleDeposit = maxBonus > 0 && matchPercent > 0 ? maxBonus / matchPercent : userBudget;
    depositAmount = Math.max(minDeposit, Math.min(userBudget, maxEligibleDeposit));
    bonusAmount = Math.min(depositAmount * matchPercent, maxBonus);
  }
  
  // Calculate wagering requirement
  const wageringBasis = bonusData.wageringUnit === "deposit_plus_bonus" 
    ? depositAmount + bonusAmount 
    : bonusAmount;
  const totalWagering = wageringBasis * wageringReq;
  
  // Calculate effective RTP based on eligible games
  let effectiveRTP = 0.965; // Default slot RTP
  
  if (bonusData.eligibleGames && bonusData.eligibleGames.length > 0) {
    // Prioritize higher RTP games if available
    if (bonusData.eligibleGames.includes("blackjack")) effectiveRTP = 0.995;
    else if (bonusData.eligibleGames.includes("baccarat")) effectiveRTP = 0.988;
    else if (bonusData.eligibleGames.includes("roulette")) effectiveRTP = 0.973;
    else if (bonusData.eligibleGames.includes("video_poker")) effectiveRTP = 0.992;
  }
  
  // Apply game weightings (reduces effective completion rate)
  if (bonusData.gameWeightings && Object.keys(bonusData.gameWeightings).length > 0) {
    const weightingValues = Object.values(bonusData.gameWeightings);
    const avgWeighting = weightingValues.reduce((a, b) => a + b, 0) / weightingValues.length;
    
    // Lower weighting means more play required, reducing effective RTP
    effectiveRTP *= Math.max(0.5, avgWeighting);
  }
  
  // Calculate expected loss from wagering
  const wageringCost = totalWagering * (1 - effectiveRTP);
  
  // Calculate penalties for restrictive terms
  let penalties = 0;
  
  // Max cashout penalty - if too low relative to bonus
  if (maxCashout && maxCashout < bonusAmount * 3) {
    penalties += bonusAmount * 0.15; // 15% penalty for restrictive cashout
  }
  
  // Expiry penalty - if too short
  if (expiryDays < 7) penalties += bonusAmount * 0.20; // 20% penalty for very short expiry
  else if (expiryDays < 14) penalties += bonusAmount * 0.10; // 10% penalty for short expiry
  
  // Payment method exclusion penalty
  const exclusions = bonusData.paymentMethodExclusions?.length || 0;
  if (exclusions > 3) penalties += bonusAmount * 0.05; // 5% penalty for many exclusions
  
  // Calculate expected value
  const expectedValue = Math.max(0, bonusAmount - wageringCost - penalties);
  
  // Calculate value score (0-100 scale)
  const valueScore = depositAmount > 0 
    ? Math.min(100, Math.max(0, (expectedValue / depositAmount) * 100))
    : 0;
  
  return {
    expectedValue: Math.round(expectedValue * 100) / 100,
    valueScore: Math.round(valueScore * 10) / 10,
    breakdown: {
      bonusAmount: Math.round(bonusAmount * 100) / 100,
      wageringCost: Math.round(wageringCost * 100) / 100,
      effectiveRTP: Math.round(effectiveRTP * 1000) / 1000,
      penalties: Math.round(penalties * 100) / 100,
      depositAmount: Math.round(depositAmount * 100) / 100
    }
  };
}

export function getEVRating(valueScore: number): { 
  rating: string; 
  color: string; 
  description: string 
} {
  if (valueScore >= 80) return { 
    rating: "Excellent", 
    color: "text-green-600", 
    description: "Outstanding value - highly recommended" 
  };
  if (valueScore >= 60) return { 
    rating: "Good", 
    color: "text-blue-600", 
    description: "Solid value bonus worth considering" 
  };
  if (valueScore >= 40) return { 
    rating: "Fair", 
    color: "text-yellow-600", 
    description: "Average value - compare alternatives" 
  };
  if (valueScore >= 20) return { 
    rating: "Poor", 
    color: "text-orange-600", 
    description: "Below average value - proceed with caution" 
  };
  return { 
    rating: "Avoid", 
    color: "text-red-600", 
    description: "Poor value - not recommended" 
  };
}