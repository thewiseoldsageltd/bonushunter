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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting gambling bonus preferences from natural language. 
          Extract the following information from user text and return as JSON:
          - budget: numeric amount user wants to deposit/spend
          - currency: currency code (default USD)
          - location: state, country, or jurisdiction mentioned
          - productType: casino, sportsbook, poker, bingo, crypto
          - games: specific games mentioned (blackjack, slots, roulette, etc.)
          - userStatus: new or existing player
          - preferences: any specific requirements (low wagering, fast cashout, etc.)
          - riskTolerance: low, medium, or high based on preferences
          
          Return JSON in this exact format: { "budget": number, "currency": "string", "location": "string", "productType": "string", "games": ["string"], "userStatus": "string", "preferences": ["string"], "riskTolerance": "string" }`
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
      model: "gpt-4o",
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant specializing in gambling bonuses. 
          You help users find the best value bonuses based on their preferences and location.
          Be friendly, informative, and always emphasize responsible gambling.
          If asked about specific bonuses, refer to the recommendations provided.`
        },
        {
          role: "user",
          content: `User message: "${userMessage}"
          Context: ${JSON.stringify(context)}
          
          Respond helpfully and conversationally:`
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
