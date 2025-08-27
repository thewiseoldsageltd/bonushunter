import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BonusParameters {
  title: string;
  description: string;
  bonusType: string;
  productType: string;
  matchPercent: number;
  minDeposit: number;
  maxBonus: number;
  wageringRequirement: number;
  wageringUnit: string;
  expiryDays: number;
  eligibleGames: string[];
  gameWeightings: Record<string, number>;
  minOdds?: number;
  maxCashout?: number;
  paymentMethodExclusions: string[];
  existingUserEligible: boolean;
  promoCode?: string;
  startAt?: string;
  endAt?: string;
}

export class AIAnalysisService {
  async analyzeBonusTerms(termsText: string): Promise<BonusParameters> {
    try {
      const prompt = `Analyze the following gambling bonus terms and conditions and extract the key parameters for Expected Value calculation. 

Return a JSON object with these exact fields:
- title: Brief descriptive title for the bonus
- description: Short marketing description 
- bonusType: One of "match_deposit", "free_bet", "free_spins", "cashback", "reload_bonus", "risk_free_bet", "first_bet_bonus"
- productType: One of "sportsbook", "casino", "poker", "bingo"
- matchPercent: Percentage match as decimal (e.g., 100 for 100% match)
- minDeposit: Minimum deposit required in USD
- maxBonus: Maximum bonus amount in USD (0 if unlimited)
- wageringRequirement: Multiplier for wagering (e.g., 20 for 20x)
- wageringUnit: Either "bonus" or "deposit_plus_bonus"
- expiryDays: Number of days until bonus expires
- eligibleGames: Array of game types (e.g., ["sports", "slots", "table_games"])
- gameWeightings: Object with game contribution percentages (e.g., {"slots": 1.0, "table_games": 0.1})
- minOdds: Minimum odds for sports bets (null if not applicable)
- maxCashout: Maximum cashout amount (null if unlimited)
- paymentMethodExclusions: Array of excluded payment methods
- existingUserEligible: Boolean if existing users can claim
- promoCode: Promo code if mentioned (null if none)
- startAt: Promotion start date in ISO format (e.g., "2025-08-20T00:00:00.000Z") or null if not mentioned
- endAt: Promotion end date in ISO format (e.g., "2025-08-26T23:59:59.000Z") or null if not mentioned

Terms and Conditions:
${termsText}

Respond with valid JSON only:`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert gambling bonus analyst. Extract bonus parameters accurately from terms and conditions. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        // GPT-5 only supports default temperature (1), removing custom temperature
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate and set defaults for required fields
      return {
        title: result.title || "Untitled Bonus",
        description: result.description || "Bonus offer",
        bonusType: result.bonusType || "first_bet_bonus",
        productType: result.productType || "sportsbook",
        matchPercent: Number(result.matchPercent) || 0,
        minDeposit: Number(result.minDeposit) || 0,
        maxBonus: Number(result.maxBonus) || 0,
        wageringRequirement: Number(result.wageringRequirement) || 1,
        wageringUnit: result.wageringUnit || "bonus",
        expiryDays: Number(result.expiryDays) || 30,
        eligibleGames: Array.isArray(result.eligibleGames) ? result.eligibleGames : ["sports"],
        gameWeightings: result.gameWeightings || {},
        minOdds: result.minOdds ? Number(result.minOdds) : undefined,
        maxCashout: result.maxCashout ? Number(result.maxCashout) : undefined,
        paymentMethodExclusions: Array.isArray(result.paymentMethodExclusions) ? result.paymentMethodExclusions : [],
        existingUserEligible: Boolean(result.existingUserEligible),
        promoCode: result.promoCode || undefined,
        startAt: result.startAt || undefined,
        endAt: result.endAt || undefined,
      };
    } catch (error) {
      console.error("AI Analysis error:", error);
      throw new Error("Failed to analyze bonus terms. Please check the text and try again.");
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();