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
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Operators
  getOperator(id: string): Promise<Operator | undefined>;
  getAllOperators(): Promise<Operator[]>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperator(id: string, operator: InsertOperator): Promise<Operator>;

  // Jurisdictions
  getJurisdiction(id: string): Promise<Jurisdiction | undefined>;
  getAllJurisdictions(): Promise<Jurisdiction[]>;
  getJurisdictionByCode(code: string): Promise<Jurisdiction | undefined>;
  createJurisdiction(jurisdiction: InsertJurisdiction): Promise<Jurisdiction>;

  // Bonuses
  getBonus(id: string): Promise<BonusWithOperator | undefined>;
  getAllBonuses(): Promise<BonusWithOperator[]>;
  getBonusesByOperator(operatorId: string): Promise<BonusWithOperator[]>;
  getBonusesByProductType(productType: string): Promise<BonusWithOperator[]>;
  createBonus(bonus: InsertBonus): Promise<Bonus>;
  updateBonus(id: string, bonus: Partial<InsertBonus>): Promise<Bonus | undefined>;
  deleteBonus(id: string): Promise<boolean>;
  
  // Bonus Jurisdictions
  assignBonusJurisdictions(bonusId: string, jurisdictionIds: string[]): Promise<void>;
  getBonusJurisdictions(bonusId: string): Promise<Jurisdiction[]>;
  removeBonusJurisdiction(bonusId: string, jurisdictionId: string): Promise<void>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;

  // Chat Messages
  getMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Bonus Recommendations
  getRecommendationsBySession(sessionId: string): Promise<BonusRecommendation[]>;
  createBonusRecommendation(recommendation: InsertBonusRecommendation): Promise<BonusRecommendation>;

  // User Favorites
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  createUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeUserFavorite(userId: string, bonusId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private operators: Map<string, Operator> = new Map();
  private jurisdictions: Map<string, Jurisdiction> = new Map();
  private bonuses: Map<string, Bonus> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private bonusRecommendations: Map<string, BonusRecommendation> = new Map();
  private userFavorites: Map<string, UserFavorite> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed jurisdictions
    const nj: Jurisdiction = {
      id: "nj-1",
      name: "New Jersey",
      code: "NJ",
      country: "United States",
      minAge: 21,
      notes: "Licensed online gambling"
    };
    this.jurisdictions.set(nj.id, nj);

    const pa: Jurisdiction = {
      id: "pa-1", 
      name: "Pennsylvania",
      code: "PA",
      country: "United States",
      minAge: 21,
      notes: "Licensed online gambling"
    };
    this.jurisdictions.set(pa.id, pa);

    // Seed operators
    const draftKings: Operator = {
      id: "op-1",
      name: "DraftKings Casino",
      siteUrl: "https://casino.draftkings.com",
      brandCodes: ["DK"],
      trustScore: "9.2",
      logo: "fas fa-dice",
      active: true
    };
    this.operators.set(draftKings.id, draftKings);

    // Only DraftKings operator - removed BetMGM and FanDuel fake data

    // Seed bonuses
    const dkBonus: Bonus = {
      id: "bonus-1",
      operatorId: draftKings.id,
      title: "100% Match up to $2,000 + $50 Free Play",
      description: "Get a 100% deposit match up to $2,000 plus $50 in free play credits on your first deposit",
      productType: "casino",
      bonusType: "match_deposit",
      matchPercent: "1.00",
      minDeposit: "5.00",
      maxBonus: "2000.00",
      promoCode: null,
      landingUrl: "https://casino.draftkings.com/welcome",
      wageringRequirement: "15.0",
      wageringUnit: "bonus",
      eligibleGames: ["slots", "blackjack", "roulette"],
      gameWeightings: {"slots": 1.0, "blackjack": 0.1, "roulette": 0.5},
      minOdds: null,
      maxCashout: null,
      expiryDays: 30,
      paymentMethodExclusions: ["paypal"],
      existingUserEligible: false,
      valueScore: "96.8",
      startAt: new Date(),
      endAt: null,
      status: "active",
      createdAt: new Date()
    };
    this.bonuses.set(dkBonus.id, dkBonus);

    // Only DraftKings bonus - removed BetMGM and FanDuel fake bonuses
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      location: insertUser.location || null,
      preferredGameTypes: (insertUser.preferredGameTypes as string[]) ?? null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Operators
  async getOperator(id: string): Promise<Operator | undefined> {
    return this.operators.get(id);
  }

  async getAllOperators(): Promise<Operator[]> {
    return Array.from(this.operators.values()).filter(op => op.active);
  }

  async createOperator(insertOperator: InsertOperator): Promise<Operator> {
    const id = randomUUID();
    const operator: Operator = { 
      ...insertOperator, 
      id,
      brandCodes: (insertOperator.brandCodes as string[]) ?? null,
      trustScore: insertOperator.trustScore || null,
      logo: insertOperator.logo || null,
      active: insertOperator.active ?? true
    };
    this.operators.set(id, operator);
    return operator;
  }

  async updateOperator(id: string, insertOperator: InsertOperator): Promise<Operator> {
    const existing = this.operators.get(id);
    if (!existing) {
      throw new Error(`Operator with id ${id} not found`);
    }
    
    const updated: Operator = {
      ...insertOperator,
      id: existing.id,
      brandCodes: (insertOperator.brandCodes as string[]) ?? null,
      trustScore: insertOperator.trustScore || null,
      logo: insertOperator.logo || null,
      active: insertOperator.active ?? true
    };
    this.operators.set(id, updated);
    return updated;
  }

  // Jurisdictions
  async getJurisdiction(id: string): Promise<Jurisdiction | undefined> {
    return this.jurisdictions.get(id);
  }

  async getAllJurisdictions(): Promise<Jurisdiction[]> {
    return Array.from(this.jurisdictions.values());
  }

  async getJurisdictionByCode(code: string): Promise<Jurisdiction | undefined> {
    return Array.from(this.jurisdictions.values()).find(j => j.code === code);
  }

  async createJurisdiction(insertJurisdiction: InsertJurisdiction): Promise<Jurisdiction> {
    const id = randomUUID();
    const jurisdiction: Jurisdiction = { 
      ...insertJurisdiction, 
      id,
      minAge: insertJurisdiction.minAge || null,
      notes: insertJurisdiction.notes || null
    };
    this.jurisdictions.set(id, jurisdiction);
    return jurisdiction;
  }

  // Bonuses
  async getBonus(id: string): Promise<BonusWithOperator | undefined> {
    const bonus = this.bonuses.get(id);
    if (!bonus) return undefined;

    const operator = await this.getOperator(bonus.operatorId);
    if (!operator) return undefined;

    return {
      ...bonus,
      operator,
      jurisdictions: await this.getAllJurisdictions() // Simplified for demo
    };
  }

  async getAllBonuses(): Promise<BonusWithOperator[]> {
    const bonuses = Array.from(this.bonuses.values()).filter(b => b.status === "active");
    const result: BonusWithOperator[] = [];

    for (const bonus of bonuses) {
      const operator = await this.getOperator(bonus.operatorId);
      if (operator) {
        result.push({
          ...bonus,
          operator,
          jurisdictions: await this.getAllJurisdictions()
        });
      }
    }

    return result;
  }

  async getBonusesByOperator(operatorId: string): Promise<BonusWithOperator[]> {
    const allBonuses = await this.getAllBonuses();
    return allBonuses.filter(b => b.operatorId === operatorId);
  }

  async getBonusesByProductType(productType: string): Promise<BonusWithOperator[]> {
    const allBonuses = await this.getAllBonuses();
    return allBonuses.filter(b => b.productType === productType);
  }

  async createBonus(insertBonus: InsertBonus): Promise<Bonus> {
    const id = randomUUID();
    const bonus: Bonus = { 
      ...insertBonus, 
      id,
      status: insertBonus.status || "active",
      promoCode: insertBonus.promoCode || null,
      minOdds: insertBonus.minOdds || null,
      maxCashout: insertBonus.maxCashout || null,
      startAt: insertBonus.startAt || null,
      endAt: insertBonus.endAt || null,
      matchPercent: insertBonus.matchPercent || "0.00",
      minDeposit: insertBonus.minDeposit || "0.00",
      maxBonus: insertBonus.maxBonus || null,
      wageringRequirement: insertBonus.wageringRequirement || "1.0",
      wageringUnit: insertBonus.wageringUnit || "bonus",
      eligibleGames: insertBonus.eligibleGames || [],
      gameWeightings: insertBonus.gameWeightings || {},
      expiryDays: insertBonus.expiryDays || 30,
      paymentMethodExclusions: insertBonus.paymentMethodExclusions || [],
      existingUserEligible: insertBonus.existingUserEligible || false,
      valueScore: insertBonus.valueScore || "0.00",
      createdAt: new Date()
    };
    this.bonuses.set(id, bonus);
    return bonus;
  }

  async updateBonus(id: string, updates: Partial<InsertBonus>): Promise<Bonus | undefined> {
    const existing = this.bonuses.get(id);
    if (!existing) return undefined;

    const updated: Bonus = { 
      ...existing, 
      ...updates,
      id // Ensure ID doesn't change
    };
    this.bonuses.set(id, updated);
    return updated;
  }

  async deleteBonus(id: string): Promise<boolean> {
    return this.bonuses.delete(id);
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = { 
      ...insertSession, 
      id,
      userId: insertSession.userId || null,
      sessionData: insertSession.sessionData || {},
      createdAt: new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }

  // Chat Messages  
  async getMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      metadata: insertMessage.metadata || {},
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Bonus Recommendations
  async getRecommendationsBySession(sessionId: string): Promise<BonusRecommendation[]> {
    return Array.from(this.bonusRecommendations.values())
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  async createBonusRecommendation(insertRecommendation: InsertBonusRecommendation): Promise<BonusRecommendation> {
    const id = randomUUID();
    const recommendation: BonusRecommendation = { 
      ...insertRecommendation, 
      id,
      rationale: insertRecommendation.rationale || null,
      calculatedValue: insertRecommendation.calculatedValue || null,
      createdAt: new Date()
    };
    this.bonusRecommendations.set(id, recommendation);
    return recommendation;
  }

  // User Favorites
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return Array.from(this.userFavorites.values()).filter(f => f.userId === userId);
  }

  async createUserFavorite(insertFavorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = randomUUID();
    const favorite: UserFavorite = { 
      ...insertFavorite, 
      id,
      createdAt: new Date()
    };
    this.userFavorites.set(id, favorite);
    return favorite;
  }

  async removeUserFavorite(userId: string, bonusId: string): Promise<boolean> {
    const favorite = Array.from(this.userFavorites.values())
      .find(f => f.userId === userId && f.bonusId === bonusId);
    
    if (favorite) {
      this.userFavorites.delete(favorite.id);
      return true;
    }
    return false;
  }
}

import { DatabaseStorage } from './dbStorage';

// Safely initialize storage with fallback
let storage: IStorage;

try {
  if (process.env.DATABASE_URL) {
    console.log('🗄️ Using PostgreSQL database storage');
    storage = new DatabaseStorage();
  } else {
    console.log('💾 Using memory storage');
    storage = new MemStorage();
  }
} catch (error) {
  console.error('❌ Database connection failed, falling back to memory storage:', error);
  storage = new MemStorage();
}

export { storage };
