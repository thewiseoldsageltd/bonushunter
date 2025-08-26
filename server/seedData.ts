import { db } from './db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Seeding comprehensive multi-operator database...');
  
  console.log('🧹 Clearing existing data for fresh seed...');
  
  // Clear existing data
  try {
    await db.delete(schema.bonusRecommendations);
    await db.delete(schema.bonusJurisdictions);
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
    // Seed Jurisdictions (US States + International)
    const jurisdictions = await db.insert(schema.jurisdictions).values([
      // US States
      { name: "New Jersey", code: "NJ", country: "United States", minAge: 21 },
      { name: "Pennsylvania", code: "PA", country: "United States", minAge: 21 },
      { name: "Nevada", code: "NV", country: "United States", minAge: 21 },
      { name: "New York", code: "NY", country: "United States", minAge: 21 },
      { name: "Michigan", code: "MI", country: "United States", minAge: 21 },
      { name: "Illinois", code: "IL", country: "United States", minAge: 21 },
      { name: "Colorado", code: "CO", country: "United States", minAge: 21 },
      { name: "Indiana", code: "IN", country: "United States", minAge: 21 },
      { name: "Virginia", code: "VA", country: "United States", minAge: 21 },
      { name: "Arizona", code: "AZ", country: "United States", minAge: 21 },
      // International
      { name: "United Kingdom", code: "UK", country: "United Kingdom", minAge: 18 },
      { name: "Ontario", code: "ON", country: "Canada", minAge: 19 },
      { name: "Germany", code: "DE", country: "Germany", minAge: 18 },
      { name: "Sweden", code: "SE", country: "Sweden", minAge: 18 },
      { name: "Malta", code: "MT", country: "Malta", minAge: 18 }
    ]).returning();

    // Seed Operators (Major US + International)
    const operators = await db.insert(schema.operators).values([
      // US Major Operators
      {
        name: "DraftKings",
        siteUrl: "https://sportsbook.draftkings.com",
        brandCodes: ["DK", "DRAFTKINGS"],
        trustScore: "9.2",
        logo: "draftkings-logo.png",
        active: true
      },
      {
        name: "FanDuel",
        siteUrl: "https://sportsbook.fanduel.com",
        brandCodes: ["FD", "FANDUEL"],
        trustScore: "9.1",
        logo: "fanduel-logo.png",
        active: true
      },
      {
        name: "BetMGM",
        siteUrl: "https://sports.betmgm.com",
        brandCodes: ["MGM", "BETMGM"],
        trustScore: "8.9",
        logo: "betmgm-logo.png",
        active: true
      },
      {
        name: "Caesars Sportsbook",
        siteUrl: "https://sportsbook.caesars.com",
        brandCodes: ["CZR", "CAESARS"],
        trustScore: "8.7",
        logo: "caesars-logo.png",
        active: true
      },
      {
        name: "PointsBet",
        siteUrl: "https://pointsbet.com",
        brandCodes: ["PB", "POINTSBET"],
        trustScore: "8.5",
        logo: "pointsbet-logo.png",
        active: true
      },
      // Crypto Operators
      {
        name: "Stake.com",
        siteUrl: "https://stake.com",
        brandCodes: ["STAKE"],
        trustScore: "8.8",
        logo: "stake-logo.png",
        active: true
      },
      {
        name: "BC.Game",
        siteUrl: "https://bc.game",
        brandCodes: ["BC", "BCGAME"],
        trustScore: "8.4",
        logo: "bcgame-logo.png",
        active: true
      },
      // International Operators
      {
        name: "Bet365",
        siteUrl: "https://www.bet365.com",
        brandCodes: ["BET365"],
        trustScore: "9.3",
        logo: "bet365-logo.png",
        active: true
      },
      {
        name: "William Hill",
        siteUrl: "https://www.williamhill.com",
        brandCodes: ["WH", "WILLIAMHILL"],
        trustScore: "8.6",
        logo: "williamhill-logo.png",
        active: true
      },
      {
        name: "Betfair",
        siteUrl: "https://www.betfair.com",
        brandCodes: ["BETFAIR"],
        trustScore: "8.8",
        logo: "betfair-logo.png",
        active: true
      }
    ]).returning();

    // Create operator lookup
    const opLookup = Object.fromEntries(operators.map(op => [op.name, op]));

    // Seed Comprehensive Bonuses (Multiple Verticals)
    const bonuses = await db.insert(schema.bonuses).values([
      // DraftKings Bonuses
      {
        operatorId: opLookup["DraftKings"].id,
        title: "Bet $5, Get $300 in Bonus Bets",
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
        minOdds: "-200",
        maxCashout: null,
        expiryDays: 7,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "95.2",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      {
        operatorId: opLookup["DraftKings"].id,
        title: "100% Casino Match up to $2,000 + 100 Free Spins",
        description: "Double your first casino deposit up to $2,000 and get 100 free spins on Starburst!",
        productType: "casino",
        bonusType: "deposit_match",
        matchPercent: "100.00",
        minDeposit: "10.00",
        maxBonus: "2000.00",
        promoCode: null,
        landingUrl: "https://casino.draftkings.com/promos",
        wageringRequirement: "15.0",
        wageringUnit: "deposit_plus_bonus",
        eligibleGames: ["slots", "table_games"],
        gameWeightings: {"slots": 1.0, "table_games": 0.1},
        minOdds: null,
        maxCashout: "10000.00",
        expiryDays: 30,
        paymentMethodExclusions: ["skrill", "neteller"],
        existingUserEligible: false,
        valueScore: "88.7",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      
      // FanDuel Bonuses
      {
        operatorId: opLookup["FanDuel"].id,
        title: "Bet $5, Get $150 in Bonus Bets",
        description: "Place your first $5 bet and receive $150 in bonus bets regardless of outcome!",
        productType: "sportsbook",
        bonusType: "first_bet_bonus",
        matchPercent: "0.00",
        minDeposit: "5.00",
        maxBonus: "150.00",
        promoCode: null,
        landingUrl: "https://sportsbook.fanduel.com/welcome",
        wageringRequirement: "1.0",
        wageringUnit: "bonus",
        eligibleGames: ["sports_betting"],
        gameWeightings: {"sports_betting": 1.0},
        minOdds: "-200",
        maxCashout: null,
        expiryDays: 7,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "92.1",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      {
        operatorId: opLookup["FanDuel"].id,
        title: "Play $10, Get $100 Casino Credit",
        description: "Play $10 on any casino game and get $100 in casino credits plus 50 free spins!",
        productType: "casino",
        bonusType: "play_bonus",
        matchPercent: "0.00",
        minDeposit: "10.00",
        maxBonus: "100.00",
        promoCode: "PLAY100",
        landingUrl: "https://casino.fanduel.com/promotions",
        wageringRequirement: "10.0",
        wageringUnit: "bonus",
        eligibleGames: ["slots"],
        gameWeightings: {"slots": 1.0},
        minOdds: null,
        maxCashout: "500.00",
        expiryDays: 14,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "85.3",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },

      // BetMGM Bonuses
      {
        operatorId: opLookup["BetMGM"].id,
        title: "Bet $10, Get $150 in Free Bets",
        description: "Place a $10 first bet and receive $150 in free bets win or lose!",
        productType: "sportsbook",
        bonusType: "first_bet_bonus",
        matchPercent: "0.00",
        minDeposit: "10.00",
        maxBonus: "150.00",
        promoCode: "BETMGM150",
        landingUrl: "https://sports.betmgm.com/promos",
        wageringRequirement: "1.0",
        wageringUnit: "bonus",
        eligibleGames: ["sports_betting"],
        gameWeightings: {"sports_betting": 1.0},
        minOdds: "-200",
        maxCashout: null,
        expiryDays: 7,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "90.5",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      {
        operatorId: opLookup["BetMGM"].id,
        title: "100% Match up to $1,500 + 200 Free Spins",
        description: "Double your first deposit up to $1,500 and get 200 free spins on popular slots!",
        productType: "casino",
        bonusType: "deposit_match",
        matchPercent: "100.00",
        minDeposit: "10.00",
        maxBonus: "1500.00",
        promoCode: "MGMCASINO",
        landingUrl: "https://casino.betmgm.com/promotions",
        wageringRequirement: "20.0",
        wageringUnit: "deposit_plus_bonus",
        eligibleGames: ["slots"],
        gameWeightings: {"slots": 1.0},
        minOdds: null,
        maxCashout: "7500.00",
        expiryDays: 30,
        paymentMethodExclusions: ["paypal", "skrill"],
        existingUserEligible: false,
        valueScore: "82.8",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },

      // Caesars Bonuses
      {
        operatorId: opLookup["Caesars Sportsbook"].id,
        title: "First Bet on Caesars up to $1,000",
        description: "Get your first bet back up to $1,000 if it doesn't win!",
        productType: "sportsbook",
        bonusType: "first_bet_protection",
        matchPercent: "0.00",
        minDeposit: "10.00",
        maxBonus: "1000.00",
        promoCode: "CAESARSFULL",
        landingUrl: "https://sportsbook.caesars.com/promos",
        wageringRequirement: "1.0",
        wageringUnit: "bonus",
        eligibleGames: ["sports_betting"],
        gameWeightings: {"sports_betting": 1.0},
        minOdds: "-200",
        maxCashout: null,
        expiryDays: 14,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "89.2",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },
      
      // Crypto Casino Bonuses
      {
        operatorId: opLookup["Stake.com"].id,
        title: "200% Crypto Welcome Bonus up to 1 BTC",
        description: "Get a massive 200% match bonus up to 1 Bitcoin on your first crypto deposit!",
        productType: "crypto_casino",
        bonusType: "deposit_match",
        matchPercent: "200.00",
        minDeposit: "20.00",
        maxBonus: "50000.00",
        promoCode: null,
        landingUrl: "https://stake.com/casino/home",
        wageringRequirement: "40.0",
        wageringUnit: "deposit_plus_bonus",
        eligibleGames: ["slots", "live_casino"],
        gameWeightings: {"slots": 1.0, "live_casino": 0.1},
        minOdds: null,
        maxCashout: null,
        expiryDays: 30,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "76.4",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },

      // Poker Bonus
      {
        operatorId: opLookup["PointsBet"].id,
        title: "100% Poker Bonus up to $600",
        description: "Get a 100% match bonus up to $600 for poker play plus entry to weekly freerolls!",
        productType: "poker",
        bonusType: "deposit_match",
        matchPercent: "100.00",
        minDeposit: "25.00",
        maxBonus: "600.00",
        promoCode: "POKER100",
        landingUrl: "https://pointsbet.com/poker",
        wageringRequirement: "25.0",
        wageringUnit: "bonus",
        eligibleGames: ["poker"],
        gameWeightings: {"poker": 1.0},
        minOdds: null,
        maxCashout: null,
        expiryDays: 60,
        paymentMethodExclusions: [],
        existingUserEligible: false,
        valueScore: "79.6",
        startAt: new Date(),
        endAt: null,
        status: "active"
      },

      // International Bonuses
      {
        operatorId: opLookup["Bet365"].id,
        title: "Up to £100 in Bet Credits",
        description: "Bet £10 and get up to £100 in bet credits for new UK customers!",
        productType: "sportsbook",
        bonusType: "bet_credits",
        matchPercent: "0.00",
        minDeposit: "10.00",
        maxBonus: "100.00",
        promoCode: null,
        landingUrl: "https://www.bet365.com/offer",
        wageringRequirement: "1.0",
        wageringUnit: "bonus",
        eligibleGames: ["sports_betting"],
        gameWeightings: {"sports_betting": 1.0},
        minOdds: "1.20",
        maxCashout: null,
        expiryDays: 30,
        paymentMethodExclusions: ["skrill", "neteller"],
        existingUserEligible: false,
        valueScore: "87.9",
        startAt: new Date(),
        endAt: null,
        status: "active"
      }
    ]).returning();

    console.log(`✅ Database seeded successfully!`);
    console.log(`📊 Seeded ${jurisdictions.length} jurisdictions, ${operators.length} operators, ${bonuses.length} bonuses`);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}