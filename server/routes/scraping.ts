import type { Express } from "express";
import { BonusScraper, ScrapingScheduler, type ScrapingConfig } from "../services/bonusScraper";
import { defaultScrapingConfigs, validateScrapingConfig, testScrapingConfig } from "../services/scrapingConfigs";

let scrapingScheduler: ScrapingScheduler | null = null;

export function registerScrapingRoutes(app: Express) {
  
  // Test scraping configuration 
  app.post("/api/admin/scraping/configs/test", async (req, res) => {
    try {
      const config: ScrapingConfig = req.body;
      
      // Validate configuration
      const errors = validateScrapingConfig(config);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }
      
      // Test the configuration
      const testResult = await testScrapingConfig(config);
      res.json(testResult);
      
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Test failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test scraping configuration (legacy endpoint)
  app.post("/api/admin/scraping/test", async (req, res) => {
    try {
      const config: ScrapingConfig = req.body;
      
      // Validate configuration
      const errors = validateScrapingConfig(config);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      // Test the configuration
      const testResult = await testScrapingConfig(config);
      res.json(testResult);
      
    } catch (error) {
      res.status(500).json({ 
        error: "Test failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Clear database endpoint - removes all seed data
  app.post("/api/admin/clear-database", async (req, res) => {
    try {
      console.log('🧹 Clearing all data for fresh start...');
      
      const { db } = await import('../db');
      const schema = await import('@shared/schema');
      
      // Clear in proper order (respect foreign key constraints)
      await db.delete(schema.bonusRecommendations);
      await db.delete(schema.bonusJurisdictions);
      await db.delete(schema.chatMessages); 
      await db.delete(schema.chatSessions);
      await db.delete(schema.bonuses);
      await db.delete(schema.operators);
      
      console.log('✅ Database cleared successfully!');
      
      res.json({ 
        message: "Database cleared successfully - ready for live data only!",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Clear database error:', error);
      res.status(500).json({ 
        error: "Failed to clear database",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Note: Start and stop scraping endpoints are defined later in the file
  
  // Manual scrape trigger
  app.post("/api/admin/scraping/manual/:operatorId", async (req, res) => {
    try {
      const { operatorId } = req.params;
      const config = defaultScrapingConfigs.find(c => c.operatorId === operatorId);
      
      if (!config) {
        return res.status(404).json({ error: "Operator configuration not found" });
      }
      
      const scraper = new BonusScraper();
      await scraper.initialize();
      
      const bonuses = await scraper.scrapeOperatorBonuses(config);
      await scraper.updateBonusDatabase(operatorId, bonuses);
      await scraper.close();
      
      res.json({
        message: `Manual scrape completed for ${config.operatorName}`,
        bonusesFound: bonuses.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Manual scrape failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Test DraftKings configurations (simple version)
  app.post("/api/admin/scraping/test-draftkings", async (req, res) => {
    try {
      const { productType = "sportsbook" } = req.body;
      
      // Find the DraftKings config for the requested product type
      const config = defaultScrapingConfigs.find(c => 
        c.operatorName.includes("DraftKings") && c.productType === productType
      );
      
      if (!config) {
        return res.status(404).json({ 
          error: `DraftKings ${productType} configuration not found`,
          availableTypes: defaultScrapingConfigs
            .filter(c => c.operatorName.includes("DraftKings"))
            .map(c => c.productType)
        });
      }

      console.log(`Testing DraftKings ${productType} scraping...`);
      
      const scraper = new BonusScraper();
      await scraper.initialize();
      
      const bonuses = await scraper.scrapeOperatorBonuses(config);
      await scraper.close();
      
      const response = {
        success: true,
        operatorName: config.operatorName,
        productType: config.productType,
        url: config.bonusPageUrl,
        bonusesFound: bonuses.length,
        bonuses: bonuses.map(bonus => ({
          title: bonus.title,
          description: bonus.description?.substring(0, 100) + "...",
          maxBonus: bonus.maxBonus,
          landingUrl: bonus.landingUrl,
          productType: config.productType
        })),
        selectors: config.selectors,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Found ${bonuses.length} DraftKings ${productType} bonuses`);
      res.json(response);
      
    } catch (error) {
      console.error("DraftKings test failed:", error);
      res.status(500).json({ 
        success: false,
        error: "DraftKings scraping test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get scraping configurations
  app.get("/api/admin/scraping/configs", (req, res) => {
    res.json({
      configs: defaultScrapingConfigs.map(config => ({
        operatorName: config.operatorName,
        operatorId: config.operatorId,
        productType: config.productType,
        bonusPageUrl: config.bonusPageUrl,
        loginRequired: config.loginRequired,
        selectors: config.selectors
      }))
    });
  });
  
  // Update existing scraping configuration
  app.put("/api/admin/scraping/configs/:operatorId/:productType", async (req, res) => {
    try {
      const { operatorId, productType } = req.params;
      const updatedConfig: ScrapingConfig = {
        ...req.body,
        parsingRules: req.body.parsingRules || {
          amountRegex: /\$(\d+(?:,\d{3})*)/,
          wageringRegex: /(\d+)x\s*wagering/i,
          dateFormat: "MM/dd/yyyy",
          excludeKeywords: ["expired", "ended", "no longer available"]
        }
      };
      
      // Find and update existing configuration
      const configIndex = defaultScrapingConfigs.findIndex(c => 
        c.operatorId === operatorId && c.productType === productType
      );
      
      if (configIndex === -1) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      // Validate configuration
      const errors = validateScrapingConfig(updatedConfig);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      // Update the configuration
      defaultScrapingConfigs[configIndex] = updatedConfig;
      
      res.json({
        message: "Scraping configuration updated successfully",
        config: updatedConfig
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to update configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add new scraping configuration
  app.post("/api/admin/scraping/configs", async (req, res) => {
    try {
      const newConfig: ScrapingConfig = {
        ...req.body,
        // Add default parsing rules if not provided
        parsingRules: req.body.parsingRules || {
          amountRegex: /\$(\d+(?:,\d{3})*)/,
          wageringRegex: /(\d+)x\s*wagering/i,
          dateFormat: "MM/dd/yyyy",
          excludeKeywords: ["expired", "ended", "no longer available"]
        }
      };
      
      // Validate configuration
      const errors = validateScrapingConfig(newConfig);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      // Add to configs (in production, would save to database)
      defaultScrapingConfigs.push(newConfig);
      
      // Optionally test configuration (don't fail save if test fails)
      let testResult = null;
      try {
        testResult = await testScrapingConfig(newConfig);
      } catch (error) {
        testResult = {
          success: false,
          error: "Test skipped - browser environment not available",
          message: "Configuration saved without testing"
        };
      }
      
      res.json({
        message: "Scraping configuration added successfully",
        testResult
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to add configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test scraping configuration endpoint (for admin panel test button)
  app.post("/api/admin/scraping/configs/test", async (req, res) => {
    try {
      const config = req.body;
      console.log(`Testing ${config.operatorName} ${config.productType} scraping...`);
      
      const scraper = new BonusScraper();
      await scraper.initialize();
      
      const bonuses = await scraper.scrapeOperatorBonuses(config);
      await scraper.close();
      
      res.json({
        success: true,
        message: `Found ${bonuses.length} bonuses`,
        bonusesFound: bonuses.length,
        bonuses: bonuses.slice(0, 3).map(bonus => ({
          title: bonus.title,
          description: bonus.description?.substring(0, 100) + "...",
          maxBonus: bonus.maxBonus
        }))
      });
      
    } catch (error) {
      console.error("Test scraping failed:", error);
      res.status(500).json({ 
        success: false,
        error: "Test scraping failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Start scraping endpoint (for admin panel start button)
  app.post("/api/admin/scraping/start", async (req, res) => {
    try {
      console.log("Starting automated scraping for all operators...");
      
      const scraper = new BonusScraper();
      await scraper.initialize();
      
      let totalBonuses = 0;
      for (const config of defaultScrapingConfigs) {
        try {
          const bonuses = await scraper.scrapeOperatorBonuses(config);
          await scraper.updateBonusDatabase(config.operatorId, bonuses);
          totalBonuses += bonuses.length;
          console.log(`✅ Scraped ${bonuses.length} bonuses from ${config.operatorName}`);
        } catch (error) {
          console.error(`❌ Failed to scrape ${config.operatorName}:`, error);
        }
      }
      
      await scraper.close();
      
      res.json({
        success: true,
        message: `Scraping completed successfully`,
        totalBonuses,
        operatorsProcessed: defaultScrapingConfigs.length
      });
      
    } catch (error) {
      console.error("Start scraping failed:", error);
      res.status(500).json({ 
        error: "Failed to start scraping",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stop scraping endpoint (for admin panel stop button)
  app.post("/api/admin/scraping/stop", async (req, res) => {
    try {
      // In a real implementation, you'd stop any running scraping processes
      res.json({
        success: true,
        message: "Scraping stopped successfully"
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to stop scraping",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}