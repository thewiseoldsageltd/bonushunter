import type { Bonus, BonusWithOperator } from "@shared/schema";
import type { UserIntent } from "@shared/schema";

export interface ValueCalculation {
  expectedValue: number;
  valueScore: number;
  breakdown: {
    bonusAmount: number;
    wageringCost: number;
    effectiveRTP: number;
    penalties: number;
  };
}

export function calculateBonusValue(
  bonus: Bonus,
  userBudget: number = 100
): ValueCalculation {
  const deposit = Math.min(userBudget, Number(bonus.maxBonus || 1000) / Number(bonus.matchPercent || 1));
  const bonusAmount = deposit * Number(bonus.matchPercent || 0);
  const cappedBonus = Math.min(bonusAmount, Number(bonus.maxBonus || bonusAmount));
  
  // Calculate wagering requirement
  const wageringMultiplier = Number(bonus.wageringRequirement || 0);
  const wageringBasis = bonus.wageringUnit === "deposit_plus_bonus" 
    ? deposit + cappedBonus 
    : cappedBonus;
  const totalWagering = wageringBasis * wageringMultiplier;
  
  // Estimate effective RTP based on eligible games
  let effectiveRTP = 0.965; // Default slot RTP
  if (bonus.eligibleGames?.includes("blackjack")) effectiveRTP = 0.995;
  else if (bonus.eligibleGames?.includes("roulette")) effectiveRTP = 0.973;
  else if (bonus.eligibleGames?.includes("baccarat")) effectiveRTP = 0.988;
  
  // Apply game weightings if available
  if (bonus.gameWeightings && Object.keys(bonus.gameWeightings).length > 0) {
    const avgWeighting = Object.values(bonus.gameWeightings).reduce((a, b) => a + b, 0) / Object.values(bonus.gameWeightings).length;
    effectiveRTP *= avgWeighting;
  }
  
  // Calculate expected loss from wagering
  const expectedLoss = totalWagering * (1 - effectiveRTP);
  
  // Apply penalties for restrictive terms
  let penalties = 0;
  if (bonus.maxCashout && Number(bonus.maxCashout) < cappedBonus * 5) penalties += cappedBonus * 0.1;
  if (bonus.expiryDays && bonus.expiryDays < 14) penalties += cappedBonus * 0.05;
  if (bonus.paymentMethodExclusions && bonus.paymentMethodExclusions.length > 2) penalties += cappedBonus * 0.03;
  
  // Calculate expected value
  const expectedValue = Math.max(0, cappedBonus - expectedLoss - penalties);
  
  // Calculate value score (0-100)
  const valueScore = Math.min(100, Math.max(0, (expectedValue / deposit) * 100));
  
  return {
    expectedValue,
    valueScore: Math.round(valueScore * 10) / 10,
    breakdown: {
      bonusAmount: cappedBonus,
      wageringCost: expectedLoss,
      effectiveRTP,
      penalties
    }
  };
}

export function filterBonusesByIntent(
  bonuses: BonusWithOperator[],
  intent: UserIntent
): BonusWithOperator[] {
  return bonuses.filter(bonus => {
    // Filter by product type
    if (intent.productType && bonus.productType !== intent.productType) {
      return false;
    }
    
    // Filter by budget
    if (intent.budget && Number(bonus.minDeposit) > intent.budget) {
      return false;
    }
    
    // Filter by games
    if (intent.games && intent.games.length > 0) {
      const hasEligibleGame = intent.games.some((game: string) => 
        bonus.eligibleGames?.includes(game) || 
        bonus.eligibleGames?.includes("all")
      );
      if (!hasEligibleGame) return false;
    }
    
    // Filter by user status
    if (intent.userStatus === "existing" && !bonus.existingUserEligible) {
      return false;
    }
    
    // Filter by preferences
    if (intent.preferences?.includes("low wagering") && Number(bonus.wageringRequirement) > 15) {
      return false;
    }
    
    if (intent.preferences?.includes("fast cashout") && bonus.expiryDays && bonus.expiryDays > 14) {
      return false;
    }
    
    return bonus.status === "active";
  });
}

export function rankBonuses(
  bonuses: BonusWithOperator[],
  intent: UserIntent
): Array<BonusWithOperator & { valueScore: number; rationale: string }> {
  const budget = intent.budget || 100;
  
  return bonuses
    .map(bonus => {
      // Use stored valueScore instead of calculating new one
      const storedValueScore = Number(bonus.valueScore || 0);
      
      // Generate rationale based on stored value score
      let rationale = `Value score: ${storedValueScore}/100`;
      if (storedValueScore > 90) rationale += " - Excellent value with low wagering requirements";
      else if (storedValueScore > 75) rationale += " - Good value with reasonable terms";
      else if (storedValueScore > 50) rationale += " - Fair value bonus";
      else rationale += " - Lower value due to high wagering or restrictions";
      
      return {
        ...bonus,
        valueScore: storedValueScore,
        rationale
      };
    })
    .sort((a, b) => b.valueScore - a.valueScore);
}
