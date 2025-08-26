import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseUserIntent, generateBonusExplanation, generateChatResponse } from "./services/openai";
import type { UserIntent } from "@shared/schema";
import { filterBonusesByIntent, rankBonuses, calculateBonusValue } from "./services/bonusService";
import { registerScrapingRoutes } from "./routes/scraping";
import { z } from "zod";
import { insertOperatorSchema } from "@shared/schema";

const chatRequestSchema = z.object({
  message: z.string(),
  sessionId: z.string().nullable().optional(),
  userLocation: z.string().optional()
});

const recommendRequestSchema = z.object({
  query: z.string().optional(),
  budget: z.number().optional(),
  currency: z.string().default("USD"),
  location: z.string().optional(),
  productType: z.string().optional(),
  preferences: z.array(z.string()).default([])
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register scraping admin routes
  registerScrapingRoutes(app);
  
  // Chat endpoint for conversational interface
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, userLocation } = chatRequestSchema.parse(req.body);
      
      // Create or get existing session
      let session;
      if (sessionId && sessionId.trim() !== '') {
        try {
          session = await storage.getChatSession(sessionId);
        } catch (error) {
          console.error('Error getting chat session:', error);
          session = null;
        }
      }
      
      if (!session) {
        try {
          session = await storage.createChatSession({
            userId: null,
            sessionData: { userLocation } as any
          });
        } catch (error) {
          console.error('Error creating chat session:', error);
          throw new Error('Unable to create chat session. Please try again later.');
        }
      }

      // Save user message
      await storage.createChatMessage({
        sessionId: session.id,
        role: "user",
        content: message,
        metadata: {} as any
      });

      // Parse user intent
      const intent = await parseUserIntent(message);
      
      // Get all bonuses and filter/rank them
      const allBonuses = await storage.getAllBonuses();
      const filteredBonuses = filterBonusesByIntent(allBonuses, intent);
      const rankedBonuses = rankBonuses(filteredBonuses, intent);
      
      // Take top 3 recommendations
      const topRecommendations = rankedBonuses.slice(0, 3);
      
      // Save recommendations
      for (let i = 0; i < topRecommendations.length; i++) {
        const bonus = topRecommendations[i];
        await storage.createBonusRecommendation({
          sessionId: session.id,
          bonusId: bonus.id,
          rank: i + 1,
          rationale: bonus.rationale,
          calculatedValue: String(bonus.valueScore || 0)
        });
      }

      // Generate AI response
      const context = {
        recommendations: topRecommendations.map(b => ({
          operator: b.operator.name,
          title: b.title,
          valueScore: b.valueScore,
          rationale: b.rationale
        })),
        userIntent: intent
      };
      
      const aiResponse = await generateChatResponse(message, context);
      
      // Save AI message
      await storage.createChatMessage({
        sessionId: session.id,
        role: "assistant", 
        content: aiResponse,
        metadata: { recommendations: topRecommendations.map(b => b.id) } as any
      });

      res.json({
        message: aiResponse,
        sessionId: session.id,
        recommendations: topRecommendations.map(bonus => ({
          id: bonus.id,
          operator: bonus.operator,
          title: bonus.title,
          description: bonus.description,
          valueScore: bonus.valueScore,
          rationale: bonus.rationale,
          matchPercent: bonus.matchPercent,
          maxBonus: bonus.maxBonus,
          minDeposit: bonus.minDeposit,
          wageringRequirement: bonus.wageringRequirement,
          expiryDays: bonus.expiryDays,
          landingUrl: bonus.landingUrl
        })),
        intent
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get bonus recommendations
  app.post("/api/recommend", async (req, res) => {
    try {
      const params = recommendRequestSchema.parse(req.body);
      
      let intent;
      if (params.query) {
        intent = await parseUserIntent(params.query);
      } else {
        intent = {
          budget: params.budget,
          currency: params.currency,
          location: params.location,
          productType: params.productType,
          preferences: params.preferences
        };
      }

      const allBonuses = await storage.getAllBonuses();
      const filteredBonuses = filterBonusesByIntent(allBonuses, intent);
      const rankedBonuses = rankBonuses(filteredBonuses, intent);

      const recommendations = rankedBonuses.slice(0, 5).map(bonus => ({
        id: bonus.id,
        operator: bonus.operator,
        title: bonus.title,
        description: bonus.description,
        valueScore: bonus.valueScore,
        rationale: bonus.rationale,
        matchPercent: bonus.matchPercent,
        maxBonus: bonus.maxBonus,
        minDeposit: bonus.minDeposit,
        wageringRequirement: bonus.wageringRequirement,
        expiryDays: bonus.expiryDays,
        landingUrl: bonus.landingUrl,
        productType: bonus.productType
      }));

      res.json({
        recommendations,
        intent,
        total: filteredBonuses.length
      });

    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ 
        error: "Failed to get recommendations",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all bonuses with optional filters
  app.get("/api/bonuses", async (req, res) => {
    try {
      const { productType, location } = req.query;
      
      let bonuses = await storage.getAllBonuses();
      
      if (productType && typeof productType === "string") {
        bonuses = bonuses.filter(b => b.productType === productType);
      }
      
      // Add basic value scores
      const bonusesWithScores = bonuses.map(bonus => ({
        ...bonus,
        valueScore: Number(bonus.valueScore || 0)
      }));

      res.json({
        bonuses: bonusesWithScores,
        total: bonusesWithScores.length
      });

    } catch (error) {
      console.error("Bonuses error:", error);
      res.status(500).json({ 
        error: "Failed to get bonuses",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get specific bonus details
  app.get("/api/bonus/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bonus = await storage.getBonus(id);
      
      if (!bonus) {
        return res.status(404).json({ error: "Bonus not found" });
      }

      res.json(bonus);

    } catch (error) {
      console.error("Bonus detail error:", error);
      res.status(500).json({ 
        error: "Failed to get bonus details",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySession(sessionId);
      
      res.json({ messages });

    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ 
        error: "Failed to get chat history",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add/remove favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, bonusId } = req.body;
      
      if (!userId || !bonusId) {
        return res.status(400).json({ error: "userId and bonusId required" });
      }

      const favorite = await storage.createUserFavorite({ userId, bonusId });
      res.json(favorite);

    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ 
        error: "Failed to add favorite",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/favorites/:userId/:bonusId", async (req, res) => {
    try {
      const { userId, bonusId } = req.params;
      const removed = await storage.removeUserFavorite(userId, bonusId);
      
      if (!removed) {
        return res.status(404).json({ error: "Favorite not found" });
      }

      res.json({ success: true });

    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ 
        error: "Failed to remove favorite",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin API endpoints for bonus management
  app.get("/api/admin/operators", async (req, res) => {
    try {
      const operators = await storage.getAllOperators();
      res.json({ operators });
    } catch (error) {
      console.error("Get operators error:", error);
      res.status(500).json({ error: "Failed to get operators" });
    }
  });

  // Create new operator
  app.post("/api/admin/operators", async (req, res) => {
    try {
      const operatorData = insertOperatorSchema.parse(req.body);
      const operator = await storage.createOperator(operatorData);
      res.json({ operator, message: "Operator created successfully" });
    } catch (error) {
      console.error("Create operator error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid operator data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create operator" });
    }
  });

  // Update existing operator
  app.put("/api/admin/operators/:id", async (req, res) => {
    try {
      const operatorId = req.params.id;
      const operatorData = insertOperatorSchema.parse(req.body);
      const operator = await storage.updateOperator(operatorId, operatorData);
      res.json({ operator, message: "Operator updated successfully" });
    } catch (error) {
      console.error("Update operator error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid operator data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update operator" });
    }
  });

  app.post("/api/admin/bonuses", async (req, res) => {
    try {
      const bonusData = req.body;
      
      // Find operator by ID
      const operators = await storage.getAllOperators();
      const operator = operators.find(op => op.id === bonusData.operatorId);
      
      if (!operator) {
        return res.status(400).json({ error: "Operator not found" });
      }

      // Prepare bonus data for calculation
      const bonusForCalculation = {
        ...bonusData,
        operatorId: operator.id,
        matchPercent: String(bonusData.matchPercent),
        minDeposit: String(bonusData.minDeposit),
        maxBonus: String(bonusData.maxBonus),
        wageringRequirement: String(bonusData.wageringRequirement),
        valueScore: String(bonusData.valueScore)
      };

      // Auto-calculate EV score based on bonus terms
      const calculatedEV = calculateBonusValue(bonusForCalculation as any);
      
      // Update the valueScore with calculated value
      bonusForCalculation.valueScore = calculatedEV.valueScore.toString();

      const bonus = await storage.createBonus(bonusForCalculation);
      
      res.json({ 
        bonus, 
        calculatedEV: {
          valueScore: calculatedEV.valueScore,
          expectedValue: calculatedEV.expectedValue,
          breakdown: calculatedEV.breakdown
        }
      });
    } catch (error) {
      console.error("Create bonus error:", error);
      res.status(500).json({ error: "Failed to create bonus" });
    }
  });

  app.put("/api/admin/bonuses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bonusData = req.body;
      
      const updated = await storage.updateBonus(id, bonusData);
      if (!updated) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update bonus error:", error);
      res.status(500).json({ error: "Failed to update bonus" });
    }
  });

  app.delete("/api/admin/bonuses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await storage.deleteBonus(id);
      if (!deleted) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      res.json({ message: "Bonus deleted successfully" });
    } catch (error) {
      console.error("Delete bonus error:", error);
      res.status(500).json({ error: "Failed to delete bonus" });
    }
  });

  // Health check endpoint for Railway
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
