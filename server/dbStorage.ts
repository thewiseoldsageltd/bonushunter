import { eq, and } from 'drizzle-orm';
import { db } from './db';
import * as schema from '@shared/schema';
import type { 
  User, InsertUser, 
  Operator, InsertOperator,
  Jurisdiction, InsertJurisdiction,
  Bonus, InsertBonus, BonusWithOperator,
  ChatSession, InsertChatSession,
  ChatMessage, InsertChatMessage,
  BonusRecommendation, InsertBonusRecommendation,
  UserFavorite, InsertUserFavorite
} from "@shared/schema";
import type { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Operators
  async getOperator(id: string): Promise<Operator | undefined> {
    const result = await db.select().from(schema.operators).where(eq(schema.operators.id, id)).limit(1);
    return result[0];
  }

  async getAllOperators(): Promise<Operator[]> {
    return await db.select().from(schema.operators).where(eq(schema.operators.active, true));
  }

  async createOperator(operator: InsertOperator): Promise<Operator> {
    const result = await db.insert(schema.operators).values(operator).returning();
    return result[0];
  }

  async updateOperator(id: string, operator: InsertOperator): Promise<Operator> {
    const result = await db.update(schema.operators)
      .set(operator)
      .where(eq(schema.operators.id, id))
      .returning();
    return result[0];
  }

  // Jurisdictions
  async getJurisdiction(id: string): Promise<Jurisdiction | undefined> {
    const result = await db.select().from(schema.jurisdictions).where(eq(schema.jurisdictions.id, id)).limit(1);
    return result[0];
  }

  async getAllJurisdictions(): Promise<Jurisdiction[]> {
    return await db.select().from(schema.jurisdictions);
  }

  async getJurisdictionByCode(code: string): Promise<Jurisdiction | undefined> {
    const result = await db.select().from(schema.jurisdictions).where(eq(schema.jurisdictions.code, code)).limit(1);
    return result[0];
  }

  async createJurisdiction(jurisdiction: InsertJurisdiction): Promise<Jurisdiction> {
    const result = await db.insert(schema.jurisdictions).values(jurisdiction).returning();
    return result[0];
  }

  // Bonuses
  async getBonus(id: string): Promise<BonusWithOperator | undefined> {
    const result = await db.select({
      id: schema.bonuses.id,
      operatorId: schema.bonuses.operatorId,
      title: schema.bonuses.title,
      description: schema.bonuses.description,
      productType: schema.bonuses.productType,
      bonusType: schema.bonuses.bonusType,
      matchPercent: schema.bonuses.matchPercent,
      minDeposit: schema.bonuses.minDeposit,
      maxBonus: schema.bonuses.maxBonus,
      promoCode: schema.bonuses.promoCode,
      landingUrl: schema.bonuses.landingUrl,
      wageringRequirement: schema.bonuses.wageringRequirement,
      wageringUnit: schema.bonuses.wageringUnit,
      eligibleGames: schema.bonuses.eligibleGames,
      gameWeightings: schema.bonuses.gameWeightings,
      minOdds: schema.bonuses.minOdds,
      maxCashout: schema.bonuses.maxCashout,
      expiryDays: schema.bonuses.expiryDays,
      paymentMethodExclusions: schema.bonuses.paymentMethodExclusions,
      existingUserEligible: schema.bonuses.existingUserEligible,
      valueScore: schema.bonuses.valueScore,
      startAt: schema.bonuses.startAt,
      endAt: schema.bonuses.endAt,
      status: schema.bonuses.status,
      createdAt: schema.bonuses.createdAt,
      operator: schema.operators
    }).from(schema.bonuses)
      .leftJoin(schema.operators, eq(schema.bonuses.operatorId, schema.operators.id))
      .where(eq(schema.bonuses.id, id))
      .limit(1);
    
    return result[0] as BonusWithOperator;
  }

  async getAllBonuses(): Promise<BonusWithOperator[]> {
    const result = await db.select().from(schema.bonuses)
      .leftJoin(schema.operators, eq(schema.bonuses.operatorId, schema.operators.id))
      .where(eq(schema.bonuses.status, 'active'));
    
    // Get jurisdictions for each bonus
    const bonusesWithOperators = await Promise.all(
      result.map(async (row) => {
        const jurisdictions = await this.getBonusJurisdictions(row.bonuses.id);
        return {
          ...row.bonuses,
          operator: row.operators || {
            id: '',
            name: 'Unknown Operator',
            siteUrl: '',
            description: null,
            logo: null,
            trustScore: null,
            overallRating: null,
            headquarters: null,
            foundedYear: null,
            paymentMethods: [],
            withdrawalMethods: [],
            withdrawalTimeframe: null,
            minDeposit: null,
            maxWithdrawal: null,
            liveChat: false,
            mobileApp: false,
            casinoGames: false,
            liveCasino: false,
            esports: false,
            virtuals: false,
            bonusRating: null,
            oddsRating: null,
            uiRating: null,
            prosAndCons: null,
            active: false,
            createdAt: new Date(),
            updatedAt: null
          },
          jurisdictions
        };
      })
    );
    
    return bonusesWithOperators as BonusWithOperator[];
  }

  async getBonusesByOperator(operatorId: string): Promise<BonusWithOperator[]> {
    const result = await db.select({
      id: schema.bonuses.id,
      operatorId: schema.bonuses.operatorId,
      title: schema.bonuses.title,
      description: schema.bonuses.description,
      productType: schema.bonuses.productType,
      bonusType: schema.bonuses.bonusType,
      matchPercent: schema.bonuses.matchPercent,
      minDeposit: schema.bonuses.minDeposit,
      maxBonus: schema.bonuses.maxBonus,
      promoCode: schema.bonuses.promoCode,
      landingUrl: schema.bonuses.landingUrl,
      wageringRequirement: schema.bonuses.wageringRequirement,
      wageringUnit: schema.bonuses.wageringUnit,
      eligibleGames: schema.bonuses.eligibleGames,
      gameWeightings: schema.bonuses.gameWeightings,
      minOdds: schema.bonuses.minOdds,
      maxCashout: schema.bonuses.maxCashout,
      expiryDays: schema.bonuses.expiryDays,
      paymentMethodExclusions: schema.bonuses.paymentMethodExclusions,
      existingUserEligible: schema.bonuses.existingUserEligible,
      valueScore: schema.bonuses.valueScore,
      startAt: schema.bonuses.startAt,
      endAt: schema.bonuses.endAt,
      status: schema.bonuses.status,
      createdAt: schema.bonuses.createdAt,
      operator: schema.operators
    }).from(schema.bonuses)
      .leftJoin(schema.operators, eq(schema.bonuses.operatorId, schema.operators.id))
      .where(and(eq(schema.bonuses.operatorId, operatorId), eq(schema.bonuses.status, 'active')));
    
    return result as BonusWithOperator[];
  }

  async getBonusesByProductType(productType: string): Promise<BonusWithOperator[]> {
    const result = await db.select({
      id: schema.bonuses.id,
      operatorId: schema.bonuses.operatorId,
      title: schema.bonuses.title,
      description: schema.bonuses.description,
      productType: schema.bonuses.productType,
      bonusType: schema.bonuses.bonusType,
      matchPercent: schema.bonuses.matchPercent,
      minDeposit: schema.bonuses.minDeposit,
      maxBonus: schema.bonuses.maxBonus,
      promoCode: schema.bonuses.promoCode,
      landingUrl: schema.bonuses.landingUrl,
      wageringRequirement: schema.bonuses.wageringRequirement,
      wageringUnit: schema.bonuses.wageringUnit,
      eligibleGames: schema.bonuses.eligibleGames,
      gameWeightings: schema.bonuses.gameWeightings,
      minOdds: schema.bonuses.minOdds,
      maxCashout: schema.bonuses.maxCashout,
      expiryDays: schema.bonuses.expiryDays,
      paymentMethodExclusions: schema.bonuses.paymentMethodExclusions,
      existingUserEligible: schema.bonuses.existingUserEligible,
      valueScore: schema.bonuses.valueScore,
      startAt: schema.bonuses.startAt,
      endAt: schema.bonuses.endAt,
      status: schema.bonuses.status,
      createdAt: schema.bonuses.createdAt,
      operator: schema.operators
    }).from(schema.bonuses)
      .leftJoin(schema.operators, eq(schema.bonuses.operatorId, schema.operators.id))
      .where(and(eq(schema.bonuses.productType, productType), eq(schema.bonuses.status, 'active')));
    
    return result as BonusWithOperator[];
  }

  async createBonus(bonus: InsertBonus): Promise<Bonus> {
    const result = await db.insert(schema.bonuses).values(bonus).returning();
    return result[0];
  }

  async updateBonus(id: string, bonus: Partial<InsertBonus>): Promise<Bonus | undefined> {
    const result = await db.update(schema.bonuses)
      .set(bonus)
      .where(eq(schema.bonuses.id, id))
      .returning();
    return result[0];
  }

  async deleteBonus(id: string): Promise<boolean> {
    const result = await db.delete(schema.bonuses)
      .where(eq(schema.bonuses.id, id))
      .returning();
    return result.length > 0;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await db.select().from(schema.chatSessions).where(eq(schema.chatSessions.id, id)).limit(1);
    return result[0];
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(schema.chatSessions).values(session).returning();
    return result[0];
  }

  // Chat Messages
  async getMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(schema.chatMessages).where(eq(schema.chatMessages.sessionId, sessionId));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(schema.chatMessages).values(message).returning();
    return result[0];
  }

  // Bonus Recommendations
  async getRecommendationsBySession(sessionId: string): Promise<BonusRecommendation[]> {
    return await db.select().from(schema.bonusRecommendations).where(eq(schema.bonusRecommendations.sessionId, sessionId));
  }

  async createBonusRecommendation(recommendation: InsertBonusRecommendation): Promise<BonusRecommendation> {
    const result = await db.insert(schema.bonusRecommendations).values(recommendation).returning();
    return result[0];
  }

  // User Favorites
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return await db.select().from(schema.userFavorites).where(eq(schema.userFavorites.userId, userId));
  }

  async createUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const result = await db.insert(schema.userFavorites).values(favorite).returning();
    return result[0];
  }

  async removeUserFavorite(userId: string, bonusId: string): Promise<boolean> {
    const result = await db.delete(schema.userFavorites)
      .where(and(eq(schema.userFavorites.userId, userId), eq(schema.userFavorites.bonusId, bonusId)));
    return true; // Assume success if no error thrown
  }

  // Bonus Jurisdictions
  async assignBonusJurisdictions(bonusId: string, jurisdictionIds: string[]): Promise<void> {
    // First, remove existing assignments
    await db.delete(schema.bonusJurisdictions).where(eq(schema.bonusJurisdictions.bonusId, bonusId));
    
    // Then add new assignments
    if (jurisdictionIds.length > 0) {
      const assignments = jurisdictionIds.map(jurisdictionId => ({
        bonusId,
        jurisdictionId,
        id: randomUUID()
      }));
      await db.insert(schema.bonusJurisdictions).values(assignments);
    }
  }

  async getBonusJurisdictions(bonusId: string): Promise<Jurisdiction[]> {
    const result = await db.select({
      id: schema.jurisdictions.id,
      name: schema.jurisdictions.name,
      code: schema.jurisdictions.code,
      country: schema.jurisdictions.country,
      minAge: schema.jurisdictions.minAge,
      notes: schema.jurisdictions.notes
    })
    .from(schema.bonusJurisdictions)
    .leftJoin(schema.jurisdictions, eq(schema.bonusJurisdictions.jurisdictionId, schema.jurisdictions.id))
    .where(eq(schema.bonusJurisdictions.bonusId, bonusId));
    
    return result as Jurisdiction[];
  }

  async removeBonusJurisdiction(bonusId: string, jurisdictionId: string): Promise<void> {
    await db.delete(schema.bonusJurisdictions)
      .where(and(
        eq(schema.bonusJurisdictions.bonusId, bonusId),
        eq(schema.bonusJurisdictions.jurisdictionId, jurisdictionId)
      ));
  }
}