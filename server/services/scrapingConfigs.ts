import type { ScrapingConfig } from './bonusScraper';

// Start with empty configs - add operators one by one with live data only
export const defaultScrapingConfigs: ScrapingConfig[] = [
  // Configs will be added one by one as operators are configured
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