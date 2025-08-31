import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseUserIntent, generateBonusExplanation, generateChatResponse } from "./services/openai";
import type { UserIntent } from "@shared/schema";
import { filterBonusesByIntent, rankBonuses, calculateBonusValue } from "./services/bonusService";
import { registerScrapingRoutes } from "./routes/scraping";
import { aiAnalysisService } from "./services/aiAnalysisService";
import { z } from "zod";
import { insertOperatorSchema } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { cachedGeolocationMiddleware } from "./middleware/geolocation";
import { regionConfigService } from "./regionConfig";

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
  
  // Add geolocation detection to all routes (except admin)
  app.use('/api/chat', cachedGeolocationMiddleware);
  app.use('/api/bonuses', cachedGeolocationMiddleware);
  app.use('/api/recommend', cachedGeolocationMiddleware);
  
  // Region configuration endpoint (with inline middleware)
  app.get("/api/region-config", cachedGeolocationMiddleware, (req, res) => {
    // Check for user's preferred region (from query param)
    const preferredRegion = req.query.region as string;
    const detectedRegion = req.userLocation?.regionCode || 'US';
    
    // Use preferred region if provided and valid, otherwise use detected region
    const regionCode = preferredRegion && regionConfigService.getAvailableRegions().includes(preferredRegion) 
      ? preferredRegion 
      : detectedRegion;
      
    const config = regionConfigService.getRegionConfig(regionCode);
    
    if (preferredRegion && preferredRegion !== detectedRegion) {
      console.log(`🌍 Manual region override - Detected: ${detectedRegion}, Using: ${regionCode}`);
    }
    
    res.json({
      region: config,
      availableRegions: regionConfigService.getAvailableRegions(),
      detectedLocation: req.userLocation
    });
  });

  // Jurisdictions endpoint for admin
  app.get("/api/jurisdictions", async (req, res) => {
    try {
      const jurisdictions = await storage.getAllJurisdictions();
      res.json(jurisdictions);
    } catch (error) {
      console.error("Error fetching jurisdictions:", error);
      res.status(500).json({ error: "Failed to fetch jurisdictions" });
    }
  });
  
  // Chat endpoint for conversational interface  
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      // Use detected location from middleware instead of body
      const detectedLocation = req.userLocation?.regionCode || 'NJ';
      const regionConfig = regionConfigService.getRegionConfig(detectedLocation);
      
      console.log(`🎯 Chat request in region: ${detectedLocation} (${req.userLocation?.country})`);
      
      
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
            sessionData: { 
              userLocation: detectedLocation,
              detectedCountry: req.userLocation?.country,
              detectedIP: req.userLocation?.detectedIP 
            } as any
          });
        } catch (error) {
          console.error('Error creating chat session:', error);
          throw new Error('Unable to create chat session. Please try again later.');
        }
      }

      // Save user message with analytics tracking for business intelligence
      await storage.createChatMessage({
        sessionId: session.id,
        role: "user",
        content: message,
        metadata: { 
          userLocation: detectedLocation,
          detectedCountry: req.userLocation?.country,
          regionConfig: regionConfig.regionName 
        } as any
      });

      // Parse user intent
      const intent = await parseUserIntent(message);
      
      // Analytics: Track user status for retention revenue model analysis
      if (intent.userStatus === "existing") {
        // Track existing user searches for operator CPC/retainer discussions
        // TODO: Implement proper analytics tracking for retention revenue model
      }
      
      // Get all bonuses and filter/rank them
      const allBonuses = await storage.getAllBonuses();
      let filteredBonuses = filterBonusesByIntent(allBonuses, intent);
      
      // Filter by jurisdiction compliance using detected region
      const userCountryCode = req.userLocation?.country === 'United States' ? 'US' : detectedLocation;
      const userStateCode = req.userLocation?.country === 'United States' ? detectedLocation : null;
      
      filteredBonuses = filteredBonuses.filter(bonus => {
        // Must have valid country data
        if (!bonus.country) {
          return false;
        }
        
        // If bonus is for US, check if user's state is included in the states list
        if (bonus.country === 'US') {
          if (!userStateCode || !bonus.states) {
            return false;
          }
          const bonusStates = bonus.states.split(',').map(s => s.trim().toUpperCase());
          const isIncluded = bonusStates.includes(userStateCode.toUpperCase());
          return isIncluded;
        }
        
        // For non-US bonuses, match country directly
        return bonus.country === userCountryCode;
      });
      
      console.log(`🎯 Filtered to ${filteredBonuses.length} bonuses for region: ${detectedLocation}`);
      
      // Fallback: if strict filtering returns no results, relax user status requirement
      if (filteredBonuses.length === 0 && intent.userStatus === "existing") {
        const relaxedIntent = { ...intent, userStatus: undefined };
        let relaxedBonuses = filterBonusesByIntent(allBonuses, relaxedIntent);
        
        // Apply jurisdiction filtering to relaxed results too
        filteredBonuses = relaxedBonuses.filter(bonus => {
          if (!bonus.country) {
            return false;
          }
          
          // If bonus is for US, check if user's state is included in the states list
          if (bonus.country === 'US') {
            if (!userStateCode || !bonus.states) {
              return false;
            }
            const bonusStates = bonus.states.split(',').map(s => s.trim().toUpperCase());
            return bonusStates.includes(userStateCode.toUpperCase());
          }
          
          // For non-US bonuses, match country directly
          return bonus.country === userCountryCode;
        });
      }
      
      const rankedBonuses = rankBonuses(filteredBonuses, intent);
      
      // Take top 5 recommendations (show more bonuses when available)
      const topRecommendations = rankedBonuses.slice(0, 5);
      
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
          landingUrl: bonus.landingUrl,
          existingUserEligible: bonus.existingUserEligible
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
      
      // Use detected location from middleware
      const detectedLocation = req.userLocation?.regionCode || 'NJ';
      const regionConfig = regionConfigService.getRegionConfig(detectedLocation);
      
      let intent;
      if (params.query) {
        intent = await parseUserIntent(params.query);
      } else {
        intent = {
          budget: params.budget,
          currency: params.currency,
          location: params.location || detectedLocation,
          productType: params.productType,
          preferences: params.preferences
        };
      }

      const allBonuses = await storage.getAllBonuses();
      let filteredBonuses = filterBonusesByIntent(allBonuses, intent);
      
      // Filter by jurisdiction compliance
      const userCountryCode = req.userLocation?.country === 'United States' ? 'US' : detectedLocation;
      const userStateCode = req.userLocation?.country === 'United States' ? detectedLocation : null;
      
      filteredBonuses = filteredBonuses.filter(bonus => {
        if (!bonus.country) {
          return false;
        }
        
        // If bonus is for US, check if user's state is included in the states list
        if (bonus.country === 'US') {
          if (!userStateCode || !bonus.states) {
            return false;
          }
          const bonusStates = bonus.states.split(',').map(s => s.trim().toUpperCase());
          return bonusStates.includes(userStateCode.toUpperCase());
        }
        
        // For non-US bonuses, match country directly
        return bonus.country === userCountryCode;
      });
      
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
        productType: bonus.productType,
        existingUserEligible: bonus.existingUserEligible
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
      const { productType, region } = req.query;
      
      // Check for user's preferred region (from query param) - same logic as region-config
      const preferredRegion = region as string;
      const detectedRegion = req.userLocation?.regionCode || 'NJ';
      
      // Use preferred region if provided and valid, otherwise use detected region
      const regionCode = preferredRegion && regionConfigService.getAvailableRegions().includes(preferredRegion) 
        ? preferredRegion 
        : detectedRegion;
        
      if (preferredRegion && preferredRegion !== detectedRegion) {
        console.log(`🌍 Bonuses manual region override - Detected: ${detectedRegion}, Using: ${regionCode}`);
      }
      
      const regionConfig = regionConfigService.getRegionConfig(regionCode);
      
      let bonuses = await storage.getAllBonuses();
      
      // Filter by jurisdiction compliance first
      const userCountryCode = req.userLocation?.country === 'United States' ? 'US' : regionCode;
      // If user manually selected US region, show all US bonuses. Otherwise use their actual state.
      const userStateCode = req.userLocation?.country === 'United States' 
        ? (preferredRegion === 'US' ? null : req.userLocation?.regionCode)
        : null;
      
      bonuses = bonuses.filter(bonus => {
        if (!bonus.country) {
          return false;
        }
        
        // If bonus is for US, check if user's state is included in the states list
        if (bonus.country === 'US') {
          // If no userStateCode (manual US selection), show all US bonuses
          if (!userStateCode) {
            return true;
          }
          if (!bonus.states) {
            return false;
          }
          const bonusStates = bonus.states.split(',').map(s => s.trim().toUpperCase());
          return bonusStates.includes(userStateCode.toUpperCase());
        }
        
        // For non-US bonuses, match country directly
        return bonus.country === userCountryCode;
      });
      
      if (productType && typeof productType === "string") {
        bonuses = bonuses.filter(b => b.productType === productType);
      }
      
      console.log(`🎯 API bonuses filtered to ${bonuses.length} for region: ${regionCode}`);
      
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
  // Admin endpoint to get ALL bonuses (bypasses geolocation filtering)
  app.get("/api/admin/bonuses", async (req, res) => {
    try {
      const { productType } = req.query;
      
      let bonuses = await storage.getAllBonuses();
      console.log(`🔍 Admin: Retrieved ${bonuses.length} bonuses from database`);
      
      if (productType && typeof productType === "string") {
        bonuses = bonuses.filter(b => b.productType === productType);
        console.log(`🔍 Admin: Filtered to ${bonuses.length} bonuses for productType: ${productType}`);
      }
      
      console.log(`📊 Admin bonuses returned: ${bonuses.length} (no geo-filtering)`);
      
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
      console.error("Admin bonuses error:", error);
      res.status(500).json({ 
        error: "Failed to get admin bonuses",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

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
      console.log('Received operator update data:', req.body);
      const operatorData = insertOperatorSchema.parse(req.body);
      const operator = await storage.updateOperator(operatorId, operatorData);
      res.json({ operator, message: "Operator updated successfully" });
    } catch (error) {
      console.error("Update operator error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
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
      
      // Convert date strings to Date objects for PostgreSQL
      const processedBonusData = {
        ...bonusData,
        startAt: bonusData.startAt ? new Date(bonusData.startAt) : undefined,
        endAt: bonusData.endAt ? new Date(bonusData.endAt) : undefined,
      };
      
      // Get the existing bonus to merge with update data for EV calculation
      const existingBonus = await storage.getBonus(id);
      if (!existingBonus) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      // Merge existing bonus data with updates for EV calculation
      const completeData = { ...existingBonus, ...processedBonusData };
      
      // Auto-calculate EV score based on updated bonus terms
      const calculatedEV = calculateBonusValue(completeData as any);
      
      // Update the valueScore with calculated value
      const bonusDataWithEV = {
        ...processedBonusData,
        valueScore: calculatedEV.valueScore.toString()
      };
      
      // Remove undefined values to avoid issues
      const cleanedData = Object.fromEntries(
        Object.entries(bonusDataWithEV).filter(([_, value]) => value !== undefined)
      );
      
      const updated = await storage.updateBonus(id, cleanedData);
      if (!updated) {
        return res.status(500).json({ error: "Failed to update bonus" });
      }
      
      res.json({ 
        bonus: updated, 
        message: "Bonus updated successfully",
        calculatedEV: {
          valueScore: calculatedEV.valueScore,
          expectedValue: calculatedEV.expectedValue,
          breakdown: calculatedEV.breakdown
        }
      });
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

  // AI Analysis endpoint for Terms & Conditions
  app.post("/api/admin/analyze-terms", async (req, res) => {
    try {
      const { termsText } = req.body;
      
      if (!termsText || typeof termsText !== 'string') {
        return res.status(400).json({ error: "Terms and conditions text is required" });
      }

      const analysisResult = await aiAnalysisService.analyzeBonusTerms(termsText);
      
      res.json({
        success: true,
        parameters: analysisResult,
        message: "Terms analyzed successfully"
      });
    } catch (error) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze terms",
        details: error instanceof Error ? error.message : "AI analysis failed"
      });
    }
  });

  // Enhanced health check endpoint with database connectivity
  app.get('/health', async (_req, res) => {
    try {
      // Test database connection by doing a simple query
      await db.select().from(users).limit(1);
      
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      });
    } catch (error) {
      console.error('Health check failed - database connection error:', error);
      res.status(500).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown database error'
      });
    }
  });

  // Keepalive endpoint to prevent sleeping
  // Logo upload endpoint
  app.post("/api/admin/logos/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getLogoUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting logo upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Update operator logo endpoint
  app.put("/api/admin/operators/:id/logo", async (req, res) => {
    try {
      const { id } = req.params;
      const { logoURL } = req.body;

      if (!logoURL) {
        return res.status(400).json({ error: "logoURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const logoPath = objectStorageService.normalizeLogoPath(logoURL);

      // Update operator with new logo path
      const operator = await storage.getOperator(id);
      if (!operator) {
        return res.status(404).json({ error: "Operator not found" });
      }
      
      await storage.updateOperator(id, { 
        ...operator, 
        logo: logoPath 
      });

      res.json({ logoPath });
    } catch (error) {
      console.error("Error updating operator logo:", error);
      res.status(500).json({ error: "Failed to update logo" });
    }
  });

  // Serve public objects (logos)
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/keepalive', (_req, res) => {
    res.status(200).json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
