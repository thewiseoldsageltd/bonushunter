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
  
  // Start scraping scheduler
  app.post("/api/admin/scraping/start", async (req, res) => {
    try {
      if (scrapingScheduler) {
        return res.status(400).json({ error: "Scraping is already running" });
      }
      
      const configs = req.body.configs || defaultScrapingConfigs;
      scrapingScheduler = new ScrapingScheduler(configs);
      await scrapingScheduler.scheduleIntelligentScraping();
      
      res.json({ 
        message: "Scraping scheduler started successfully",
        configCount: configs.length
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to start scraping scheduler",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Stop scraping scheduler  
  app.post("/api/admin/scraping/stop", async (req, res) => {
    try {
      if (scrapingScheduler) {
        // Would implement stop method in scheduler
        scrapingScheduler = null;
        res.json({ message: "Scraping scheduler stopped" });
      } else {
        res.status(400).json({ error: "No scraping scheduler is running" });
      }
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to stop scraping scheduler",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
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
        c.operatorId === "op-1" && c.productType === productType
      );
      
      if (!config) {
        return res.status(404).json({ 
          error: `DraftKings ${productType} configuration not found`,
          availableTypes: defaultScrapingConfigs
            .filter(c => c.operatorId === "op-1")
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
        loginRequired: config.loginRequired
      }))
    });
  });
  
  // Add new scraping configuration
  app.post("/api/admin/scraping/configs", async (req, res) => {
    try {
      const newConfig: ScrapingConfig = req.body;
      
      // Validate configuration
      const errors = validateScrapingConfig(newConfig);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      // Test configuration before adding
      const testResult = await testScrapingConfig(newConfig);
      if (!testResult.success) {
        return res.status(400).json({ 
          error: "Configuration test failed", 
          details: testResult.error 
        });
      }
      
      // Add to configs (in production, would save to database)
      defaultScrapingConfigs.push(newConfig);
      
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
}