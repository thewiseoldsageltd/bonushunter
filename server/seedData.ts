import { db } from './db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  // Force fresh seed to ensure only DraftKings bonuses  
  console.log('🧹 Clearing existing data for fresh seed...');
  
  // Clear existing data
  try {
    await db.delete(schema.bonusRecommendations);
    await db.delete(schema.chatMessages); 
    await db.delete(schema.chatSessions);
    await db.delete(schema.bonuses);
    await db.delete(schema.operators);
    await db.delete(schema.jurisdictions);
    console.log('🗑️ Existing data cleared');
  } catch (error) {
    console.log('ℹ️ No existing data to clear (fresh database)');
  }

  try {
    // Seed Operators
    const [draftkingsOp] = await db.insert(schema.operators).values({
      name: "DraftKings",
      siteUrl: "https://sportsbook.draftkings.com",
      brandCodes: ["DK", "DRAFTKINGS"],
      trustScore: "9.2",
      logo: null,
      active: true
    }).returning();

    // Seed Jurisdictions
    const [njJuris] = await db.insert(schema.jurisdictions).values({
      name: "New Jersey",
      code: "NJ", 
      country: "United States",
      minAge: 21
    }).returning();

    // Seed DraftKings Bonuses
    await db.insert(schema.bonuses).values([
      {
        operatorId: draftkingsOp.id,
        title: "Bet $5 and Get $300 in Bonus Bets",
        description: "Place your first bet of $5+ and receive $300 in bonus bets instantly! No promo code needed for new customers.",
        productType: "sportsbook",
        bonusType: "first_bet_bonus",
        matchPercent: "0.00",
        minDeposit: "5.00", 
        maxBonus: "300.00",
        promoCode: null,
        landingUrl: "https://sportsbook.draftkings.com/promos",
        wageringRequirement: "1.0",
        wageringUnit: "bonus",
        eligibleGames: ["sports_betting"],
        gameWeightings: {"sports_betting": 1.0},
        minOdds: null,
        maxCashout: null,
        expiryDays: 7,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "95.0",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      {
        operatorId: draftkingsOp.id,
        title: "100% First Deposit Match up to $1,000",
        description: "Double your first casino deposit! Get 100% bonus up to $1,000 plus 100 free spins on popular slots.",
        productType: "casino",
        bonusType: "deposit_match",
        matchPercent: "100.00",
        minDeposit: "10.00",
        maxBonus: "1000.00", 
        promoCode: null,
        landingUrl: "https://casino.draftkings.com/promos",
        wageringRequirement: "15.0",
        wageringUnit: "deposit_plus_bonus",
        eligibleGames: ["slots", "table_games"],
        gameWeightings: {"slots": 1.0, "table_games": 0.1},
        minOdds: null,
        maxCashout: "5000.00",
        expiryDays: 30,
        paymentMethodExclusions: ["skrill", "neteller"],
        existingUserEligible: false,
        valueScore: "87.5",
        startAt: new Date(),
        endAt: null,
        status: "active"
      }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}