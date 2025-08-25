import type { ScrapingConfig } from './bonusScraper';

// Example scraping configurations
export const defaultScrapingConfigs: ScrapingConfig[] = [
  // DraftKings Casino Example
  {
    operatorName: "DraftKings Casino",
    operatorId: "op-1", // Should match operator ID in database
    bonusPageUrl: "https://casino.draftkings.com/promotions",
    loginRequired: false,
    selectors: {
      containerSelector: ".promotion-tile", // Each bonus container
      titleSelector: ".promotion-tile__title",
      descriptionSelector: ".promotion-tile__description", 
      amountSelector: ".promotion-tile__offer",
      wageringSelector: ".promotion-tile__terms",
      endDateSelector: ".promotion-tile__expiry",
      claimLinkSelector: ".promotion-tile__cta-button"
    },
    parsingRules: {
      amountRegex: /\$(\d+(?:,\d{3})*)/,
      wageringRegex: /(\d+)x\s*wagering/i,
      dateFormat: "MM/dd/yyyy",
      excludeKeywords: ["expired", "ended", "no longer available"]
    }
  },
  
  // BetMGM Casino Example  
  {
    operatorName: "BetMGM Casino",
    operatorId: "op-2",
    bonusPageUrl: "https://casino.betmgm.com/promotions",
    loginRequired: false,
    selectors: {
      containerSelector: ".promo-card",
      titleSelector: ".promo-card-title",
      descriptionSelector: ".promo-card-description",
      amountSelector: ".promo-amount",
      wageringSelector: ".wagering-info",
      endDateSelector: ".promo-expiry",
      claimLinkSelector: ".promo-cta"
    },
    parsingRules: {
      amountRegex: /\$(\d+(?:,\d{3})*)/,
      wageringRegex: /(\d+)x/i,
      excludeKeywords: ["expired", "ended"]
    }
  }
];

// Configuration validation
export function validateScrapingConfig(config: ScrapingConfig): string[] {
  const errors: string[] = [];
  
  if (!config.operatorName) errors.push("Operator name is required");
  if (!config.operatorId) errors.push("Operator ID is required");
  if (!config.bonusPageUrl) errors.push("Bonus page URL is required");
  if (!config.selectors.containerSelector) errors.push("Container selector is required");
  if (!config.selectors.titleSelector) errors.push("Title selector is required");
  if (!config.parsingRules.amountRegex) errors.push("Amount regex is required");
  
  // Validate URL format
  try {
    new URL(config.bonusPageUrl);
  } catch {
    errors.push("Invalid bonus page URL format");
  }
  
  return errors;
}

// Test scraping configuration
export async function testScrapingConfig(config: ScrapingConfig) {
  const { BonusScraper } = await import('./bonusScraper');
  const scraper = new BonusScraper();
  
  try {
    await scraper.initialize();
    const testResults = await scraper.scrapeOperatorBonuses(config);
    await scraper.close();
    
    return {
      success: true,
      bonusesFound: testResults.length,
      sampleData: testResults.slice(0, 2), // Return first 2 for preview
      message: `Successfully scraped ${testResults.length} bonuses`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Scraping test failed'
    };
  }
}