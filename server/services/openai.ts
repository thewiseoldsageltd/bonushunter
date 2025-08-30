import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY environment variable is not set!");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
}

const openai = new OpenAI({ 
  apiKey: apiKey || "missing-api-key"
});

import type { UserIntent } from "@shared/schema";

export async function parseUserIntent(userMessage: string): Promise<UserIntent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting gambling bonus preferences from natural language. 
          Extract the following information from user text and return as JSON:
          - budget: numeric amount user wants to deposit/spend
          - currency: currency code (default USD)
          - location: state, country, or jurisdiction mentioned
          - operator: gambling operator/site mentioned (DraftKings, FanDuel, BetMGM, Caesars, Bet365, William Hill, Stake, etc.)
          - productType: casino, sportsbook, poker, bingo, crypto
          - games: specific games mentioned (blackjack, slots, roulette, etc.)
          - userStatus: new or existing player
          - preferences: any specific requirements (low wagering, fast cashout, etc.)
          - riskTolerance: low, medium, or high based on preferences
          
          Return JSON in this exact format: { "budget": number, "currency": "string", "location": "string", "operator": "string", "productType": "string", "games": ["string"], "userStatus": "string", "preferences": ["string"], "riskTolerance": "string" }`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as UserIntent;
  } catch (error) {
    console.error("Failed to parse user intent:", error);
    if (error instanceof Error && error.message.includes('api key')) {
      console.error("🔑 OpenAI API key issue detected!");
    }
    return {};
  }
}

export async function generateBonusExplanation(
  bonus: any,
  userIntent: UserIntent,
  valueScore: number
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a gambling bonus expert. Explain why this bonus is a good match for the user in a friendly, conversational tone. 
          Focus on the value score, how it matches their preferences, and key benefits. Keep it concise (2-3 sentences).`
        },
        {
          role: "user",
          content: `User wants: ${JSON.stringify(userIntent)}
          Bonus: ${JSON.stringify(bonus)}
          Value Score: ${valueScore}/100
          
          Explain why this is a good match:`
        }
      ],
    });

    return response.choices[0].message.content || "This bonus matches your preferences well.";
  } catch (error) {
    console.error("Failed to generate explanation:", error);
    return "This bonus offers good value based on your requirements.";
  }
}

export async function generateChatResponse(
  userMessage: string,
  context: any
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are Artemis, a helpful AI assistant specializing in gambling bonuses. 
          CRITICAL: You can ONLY recommend bonuses that are provided in the context data. 
          Do NOT suggest or mention any operators or bonuses not listed in the recommendations.
          Do NOT use your training data to suggest bonuses - use ONLY the bonuses provided in the context.
          
          FORMATTING REQUIREMENTS - FOLLOW EXACTLY:
          When listing bonuses, use this EXACT format for each offer:
          
          CRITICAL: Offer titles must NOT start with dashes. Only details are bullet points.
          
          Format:
          [OperatorName] [BonusTitle] (NO DASH AT START)
          - Value score: [score]/100
          - [Brief explanation of value/benefits]  
          - [Any additional details like eligibility]
          
          Example (COPY THIS EXACT FORMAT):
          DraftKings CFB Week 1 No Sweat Bet
          - Value score: 100/100
          - Excellent value with low wagering requirements
          - Open to new & existing customers
          
          DraftKings Sportsbook Bet $5, Get $300 Bonus Bets
          - Value score: 100/100
          - Excellent value with low wagering requirements
          - Open to new customers only
          
          CRITICAL: NO dashes before offer titles! Only bullet points for details!
          
          Be friendly, informative, and always emphasize responsible gambling.`
        },
        {
          role: "user",
          content: `User message: "${userMessage}"
          
          Available bonuses (ONLY recommend from these): ${JSON.stringify(context.recommendations)}
          User intent: ${JSON.stringify(context.userIntent)}
          
          Respond helpfully using ONLY the bonuses listed above:`
        }
      ],
    });

    return response.choices[0].message.content || "I'm here to help you find the best bonus offers!";
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    if (error instanceof Error && error.message.includes('api key')) {
      console.error("🔑 OpenAI API key issue detected!");
      return "I'm having trouble processing your request. Please try again or check if the OpenAI API key is properly configured.";
    }
    return "I'm having trouble processing your request right now. Please try again.";
  }
}
