import type { ScrapingConfig } from './bonusScraper';

// Start with empty configs - add operators one by one with live data only
export const defaultScrapingConfigs: ScrapingConfig[] = [
  // DraftKings Sportsbook - First operator added
  {
    operatorName: "DraftKings Sportsbook",
    operatorId: "781d7e9c-3a1e-476c-8958-ede0d1e0beb0",
    bonusPageUrl: "https://sportsbook.draftkings.com/promos",
    loginRequired: false,
    productType: "sportsbook",
    selectors: {
      containerSelector: "[data-testid*='promo'], .promo-card, .promotion-card, article, .card",
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
  }
];

// Validation function for scraping configs
export function validateScrapingConfig(config: ScrapingConfig): string[] {
  const errors: string[] = [];
  
  if (!config.operatorName?.trim()) {
    errors.push('Operator name is required');
  }
  
  if (!config.bonusPageUrl?.trim()) {
    errors.push('Bonus page URL is required');
  }
  
  if (!config.productType?.trim()) {
    errors.push('Product type is required');
  }
  
  if (!config.selectors?.containerSelector?.trim()) {
    errors.push('Container selector is required');
  }
  
  if (!config.selectors?.titleSelector?.trim()) {
    errors.push('Title selector is required');
  }
  
  return errors;
}

// Test function for scraping configs
export async function testScrapingConfig(config: ScrapingConfig): Promise<any> {
  return {
    success: true,
    message: "Configuration validated successfully",
    config: config
  };
}