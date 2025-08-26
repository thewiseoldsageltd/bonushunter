import type { ScrapingConfig } from './bonusScraper';

// DraftKings scraping configurations - separate URLs for each product type
export const defaultScrapingConfigs: ScrapingConfig[] = [
  // DraftKings Sportsbook
  {
    operatorName: "DraftKings Sportsbook",
    operatorId: "op-1",
    bonusPageUrl: "https://sportsbook.draftkings.com/promos",
    loginRequired: false,
    productType: "sportsbook",
    selectors: {
      containerSelector: "[data-testid*='promo'], .promo-card, .promotion-card, article, .card", // Multiple fallbacks
      titleSelector: "a[href*='promo'], h2, h3, .title, .promo-title, .headline", // Link text or headings
      descriptionSelector: ".description, .promo-description, p, .text", 
      amountSelector: "a[href*='promo'], h2, h3, .title", // Amount likely in main title
      wageringSelector: ".terms, .fine-print, .wagering, small",
      endDateSelector: ".expires, .expiry, .end-date, time",
      claimLinkSelector: "a[href*='signup'], button:contains('Sign Up'), .cta-button, .signup-btn"
    },
    parsingRules: {
      amountRegex: /\$(\d+(?:,\d{3})*)/,
      wageringRegex: /(\d+)x\s*wagering/i,
      dateFormat: "MM/dd/yyyy",
      excludeKeywords: ["expired", "ended", "no longer available"]
    }
  },
  
  // DraftKings Casino
  {
    operatorName: "DraftKings Casino", 
    operatorId: "op-1",
    bonusPageUrl: "https://casino.draftkings.com/promos",
    loginRequired: false,
    productType: "casino",
    selectors: {
      containerSelector: "[data-testid*='promo'], .promo-card, .promotion-card, article, .card", // Same structure as sportsbook
      titleSelector: "a[href*='promo'], h2, h3, .title, .promo-title, .headline",
      descriptionSelector: ".description, .promo-description, p, .text", 
      amountSelector: "a[href*='promo'], h2, h3, .title",
      wageringSelector: ".terms, .fine-print, .wagering, small",
      endDateSelector: ".expires, .expiry, .end-date, time",
      claimLinkSelector: "a[href*='signup'], button:contains('Sign Up'), .cta-button, .signup-btn"
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
  },
  
  // BetMGM Sportsbook 
  {
    operatorName: "BetMGM Sportsbook",
    operatorId: "betmgm-sportsbook",
    bonusPageUrl: "https://www.nj.betmgm.com/en/promo/offers/p/sportsbook",
    loginRequired: false,
    productType: "sportsbook",
    selectors: {
      containerSelector: ".promo-card, .offer-card, .promotion-item",
      titleSelector: "h2, h3, .title, .promo-title",
      descriptionSelector: ".description, .promo-description, .offer-description",
      amountSelector: ".amount, .bonus-amount, .offer-amount",
      wageringSelector: ".terms, .wagering-requirements",
      endDateSelector: ".expiry, .end-date, .expires",
      claimLinkSelector: "a[href*='signup'], .cta-button, .claim-button"
    },
    parsingRules: {
      amountRegex: /\$(\d+(?:,\d{3})*)/,
      wageringRegex: /(\d+)x\s*wagering/i,
      dateFormat: "MM/dd/yyyy",
      excludeKeywords: ["expired", "ended", "no longer available"]
    }
  }
];

// Configuration validation
export function validateScrapingConfig(config: ScrapingConfig): string[] {
  const errors: string[] = [];
  
  if (!config.operatorName) errors.push("Operator name is required");
  if (!config.operatorId) errors.push("Operator ID is required");
  if (!config.bonusPageUrl) errors.push("Bonus page URL is required");
  if (!config.selectors?.containerSelector) errors.push("Container selector is required");
  if (!config.selectors?.titleSelector) errors.push("Title selector is required");
  if (!config.parsingRules?.amountRegex) errors.push("Amount regex is required");
  
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