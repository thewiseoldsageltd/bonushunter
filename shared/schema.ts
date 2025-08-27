import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: text("location"),
  preferredGameTypes: jsonb("preferred_game_types").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  siteUrl: text("site_url").notNull(),
  brandCodes: jsonb("brand_codes").$type<string[]>().default([]),
  trustScore: decimal("trust_score", { precision: 3, scale: 1 }).default("0.0"),
  logo: text("logo"),
  active: boolean("active").default(true),
  
  // Enhanced operator details for review pages
  description: text("description"),
  foundedYear: integer("founded_year"),
  headquarters: text("headquarters"),
  licenses: jsonb("licenses").$type<string[]>().default([]),
  languages: jsonb("languages").$type<string[]>().default([]),
  currencies: jsonb("currencies").$type<string[]>().default([]),
  paymentMethods: jsonb("payment_methods").$type<string[]>().default([]),
  withdrawalMethods: jsonb("withdrawal_methods").$type<string[]>().default([]),
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }),
  maxWithdrawal: decimal("max_withdrawal", { precision: 10, scale: 2 }),
  withdrawalTimeframe: text("withdrawal_timeframe"),
  customerSupportMethods: jsonb("customer_support_methods").$type<string[]>().default([]),
  liveChat: boolean("live_chat").default(false),
  mobileApp: boolean("mobile_app").default(false),
  sportsOffered: jsonb("sports_offered").$type<string[]>().default([]),
  casinoGames: boolean("casino_games").default(false),
  liveCasino: boolean("live_casino").default(false),
  esports: boolean("esports").default(false),
  virtuals: boolean("virtuals").default(false),
  prosAndCons: jsonb("pros_and_cons").$type<{pros: string[], cons: string[]}>().default({pros: [], cons: []}),
  overallRating: decimal("overall_rating", { precision: 2, scale: 1 }).default("0.0"),
  bonusRating: decimal("bonus_rating", { precision: 2, scale: 1 }).default("0.0"),
  oddsRating: decimal("odds_rating", { precision: 2, scale: 1 }).default("0.0"),
  uiRating: decimal("ui_rating", { precision: 2, scale: 1 }).default("0.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jurisdictions = pgTable("jurisdictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  country: text("country").notNull(),
  minAge: integer("min_age").default(21),
  notes: text("notes"),
});

export const bonuses = pgTable("bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").notNull().references(() => operators.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  productType: text("product_type").notNull(), // casino, sportsbook, poker, bingo
  bonusType: text("bonus_type").notNull(), // match_deposit, free_bet, free_spins, etc.
  matchPercent: decimal("match_percent", { precision: 5, scale: 2 }).default("0.00"),
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }).default("0.00"),
  maxBonus: decimal("max_bonus", { precision: 10, scale: 2 }),
  promoCode: text("promo_code"),
  landingUrl: text("landing_url").notNull(),
  wageringRequirement: decimal("wagering_requirement", { precision: 5, scale: 1 }).default("0.0"),
  wageringUnit: text("wagering_unit").default("bonus"), // bonus, deposit_plus_bonus
  eligibleGames: jsonb("eligible_games").$type<string[]>().default([]),
  gameWeightings: jsonb("game_weightings").$type<Record<string, number>>().default({}),
  minOdds: decimal("min_odds", { precision: 5, scale: 2 }),
  maxCashout: decimal("max_cashout", { precision: 10, scale: 2 }),
  expiryDays: integer("expiry_days").default(30),
  paymentMethodExclusions: jsonb("payment_method_exclusions").$type<string[]>().default([]),
  existingUserEligible: boolean("existing_user_eligible").default(false),
  valueScore: decimal("value_score", { precision: 5, scale: 2 }).default("0.00"),
  termsAndConditions: text("terms_and_conditions"), // Raw T&C text for AI analysis
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  timezone: varchar("timezone", { length: 50 }).default("America/New_York"),
  status: text("status").default("active"), // active, inactive, expired
  createdAt: timestamp("created_at").defaultNow(),
});

export const bonusJurisdictions = pgTable("bonus_jurisdictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bonusId: varchar("bonus_id").notNull().references(() => bonuses.id),
  jurisdictionId: varchar("jurisdiction_id").notNull().references(() => jurisdictions.id),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionData: jsonb("session_data").$type<any>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<any>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bonusRecommendations = pgTable("bonus_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  bonusId: varchar("bonus_id").notNull().references(() => bonuses.id),
  rank: integer("rank").notNull(),
  rationale: text("rationale"),
  calculatedValue: decimal("calculated_value", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bonusId: varchar("bonus_id").notNull().references(() => bonuses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJurisdictionSchema = createInsertSchema(jurisdictions).omit({
  id: true,
});

export const insertBonusSchema = createInsertSchema(bonuses).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertBonusRecommendationSchema = createInsertSchema(bonusRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Operator = typeof operators.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;

export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type InsertJurisdiction = z.infer<typeof insertJurisdictionSchema>;

export type Bonus = typeof bonuses.$inferSelect;
export type InsertBonus = z.infer<typeof insertBonusSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type BonusRecommendation = typeof bonusRecommendations.$inferSelect;
export type InsertBonusRecommendation = z.infer<typeof insertBonusRecommendationSchema>;

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;

// User Intent interface
export interface UserIntent {
  budget?: number;
  currency?: string;
  location?: string;
  operator?: string;
  productType?: string;
  games?: string[];
  userStatus?: "new" | "existing";
  preferences?: string[];
  riskTolerance?: "low" | "medium" | "high";
}

// Extended types for API responses
export type BonusWithOperator = Bonus & {
  operator: Operator;
  jurisdictions: Jurisdiction[];
};

export type RecommendationWithBonus = BonusRecommendation & {
  bonus: BonusWithOperator;
};
