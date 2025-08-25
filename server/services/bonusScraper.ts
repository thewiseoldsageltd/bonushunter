import puppeteer from 'puppeteer';
import { storage } from '../storage';
import type { InsertBonus } from '@shared/schema';

export interface FilterConfig {
  name: string;
  productType: 'casino' | 'sportsbook' | 'poker' | 'bingo';
  filterSelector?: string; // Button/tab to click
  waitAfterClick?: number; // Milliseconds to wait after clicking filter
}

export interface ScrapingConfig {
  operatorName: string;
  operatorId: string;
  bonusPageUrl: string;
  loginRequired: boolean;
  productType?: 'casino' | 'sportsbook' | 'poker' | 'bingo'; // Single product type per config
  filters?: FilterConfig[]; // Multiple filters on same page (alternative approach)
  selectors: {
    containerSelector: string;
    titleSelector: string;
    descriptionSelector: string;
    amountSelector?: string;
    wageringSelector?: string;
    endDateSelector?: string;
    termsLinkSelector?: string;
    claimLinkSelector?: string;
  };
  parsingRules: {
    amountRegex: RegExp;
    wageringRegex: RegExp;
    dateFormat?: string;
    excludeKeywords: string[];
  };
}

export interface ScrapedBonus {
  title: string;
  description: string;
  maxBonus?: string;
  wageringRequirement?: string;
  endDate?: Date;
  landingUrl: string;
  lastScraped: Date;
}

export class BonusScraper {
  private browser: any;
  
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async scrapeOperatorBonuses(config: ScrapingConfig): Promise<ScrapedBonus[]> {
    const page = await this.browser.newPage();
    
    try {
      console.log(`Scraping bonuses from ${config.operatorName}...`);
      
      // Navigate to bonus page
      await page.goto(config.bonusPageUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      let allBonuses: ScrapedBonus[] = [];

      // If no filters specified, scrape current page
      if (!config.filters || config.filters.length === 0) {
        await page.waitForSelector(config.selectors.containerSelector, { timeout: 10000 });
        const productType = config.productType || 'casino';
        const bonuses = await this.extractBonusesFromPage(page, config, productType);
        allBonuses = bonuses;
      } else {
        // Scrape each filter separately
        for (const filter of config.filters) {
          console.log(`Scraping ${filter.name} bonuses...`);
          
          // Click filter if selector provided
          if (filter.filterSelector) {
            try {
              await page.click(filter.filterSelector);
              await page.waitForTimeout(filter.waitAfterClick || 2000);
            } catch (error) {
              console.error(`Failed to click filter ${filter.name}:`, error);
              continue;
            }
          }

          // Wait for content to load
          try {
            await page.waitForSelector(config.selectors.containerSelector, { timeout: 10000 });
          } catch (error) {
            console.log(`No bonuses found for ${filter.name} filter`);
            continue;
          }

          // Extract bonuses for this filter
          const bonuses = await this.extractBonusesFromPage(page, config, filter.productType);
          allBonuses = allBonuses.concat(bonuses);
        }
      }

      console.log(`Found ${allBonuses.length} total bonuses for ${config.operatorName}`);
      return allBonuses;

    } catch (error) {
      console.error(`Scraping failed for ${config.operatorName}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  private async extractBonusesFromPage(page: any, config: ScrapingConfig, productType: string): Promise<ScrapedBonus[]> {
    // Extract bonus data
    const bonuses = await page.evaluate((config, productType) => {
        const containers = document.querySelectorAll(config.selectors.containerSelector);
        const bonuses: any[] = [];

        containers.forEach(container => {
          try {
            // Extract basic info
            const titleElement = container.querySelector(config.selectors.titleSelector);
            const descElement = container.querySelector(config.selectors.descriptionSelector);
            
            if (!titleElement || !descElement) return;

            const title = titleElement.textContent?.trim();
            const description = descElement.textContent?.trim();

            // Skip if contains exclude keywords
            const fullText = (title + ' ' + description).toLowerCase();
            if (config.parsingRules.excludeKeywords.some(keyword => fullText.includes(keyword))) {
              return;
            }

            const bonus: any = {
              title,
              description,
              lastScraped: new Date().toISOString()
            };

            // Extract bonus amount
            if (config.selectors.amountSelector) {
              const amountElement = container.querySelector(config.selectors.amountSelector);
              if (amountElement) {
                const amountText = amountElement.textContent || '';
                const amountMatch = amountText.match(config.parsingRules.amountRegex);
                if (amountMatch) {
                  bonus.maxBonus = amountMatch[1].replace(',', '');
                }
              }
            }

            // Extract wagering requirement
            if (config.selectors.wageringSelector) {
              const wageringElement = container.querySelector(config.selectors.wageringSelector);
              if (wageringElement) {
                const wageringText = wageringElement.textContent || '';
                const wageringMatch = wageringText.match(config.parsingRules.wageringRegex);
                if (wageringMatch) {
                  bonus.wageringRequirement = wageringMatch[1];
                }
              }
            }

            // Extract end date
            if (config.selectors.endDateSelector) {
              const endDateElement = container.querySelector(config.selectors.endDateSelector);
              if (endDateElement) {
                const dateText = endDateElement.textContent?.trim();
                if (dateText) {
                  // Basic date parsing - would enhance based on operator's format
                  const dateMatch = dateText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
                  if (dateMatch) {
                    bonus.endDate = new Date(dateMatch[1]).toISOString();
                  }
                }
              }
            }

            // Extract landing URL
            if (config.selectors.claimLinkSelector) {
              const linkElement = container.querySelector(config.selectors.claimLinkSelector);
              bonus.landingUrl = linkElement?.getAttribute('href') || config.bonusPageUrl;
            } else {
              bonus.landingUrl = config.bonusPageUrl;
            }

            // Add product type from filter
            bonus.productType = productType;

            bonuses.push(bonus);
          } catch (error) {
            console.error('Error processing bonus container:', error);
          }
        });

        return bonuses;
      }, config, productType);

      return bonuses.map((b: any) => ({
        ...b,
        endDate: b.endDate ? new Date(b.endDate) : undefined,
        lastScraped: new Date()
      }));
  }

  async updateBonusDatabase(operatorId: string, scrapedBonuses: ScrapedBonus[]) {
    // Get existing bonuses for this operator
    const existingBonuses = await storage.getBonusesByOperator(operatorId);
    
    for (const scrapedBonus of scrapedBonuses) {
      // Check if bonus already exists (match by title)
      const existingBonus = existingBonuses.find(b => 
        this.normalizeTitle(b.title) === this.normalizeTitle(scrapedBonus.title)
      );

      if (existingBonus) {
        // Check if bonus has changed significantly
        if (this.hasSignificantChange(existingBonus, scrapedBonus)) {
          console.log(`Bonus changed: ${scrapedBonus.title}`);
          // Update existing bonus - would implement update method in storage
          // await storage.updateBonus(existingBonus.id, scrapedBonus);
        }
      } else {
        // Create new bonus
        const newBonus: InsertBonus = {
          operatorId,
          title: scrapedBonus.title,
          description: scrapedBonus.description,
          productType: (scrapedBonus as any).productType || 'casino',
          bonusType: this.detectBonusType(scrapedBonus.title, scrapedBonus.description),
          maxBonus: scrapedBonus.maxBonus || null,
          wageringRequirement: scrapedBonus.wageringRequirement || null,
          landingUrl: scrapedBonus.landingUrl,
          endAt: scrapedBonus.endDate || null,
          status: 'active',
          // Set other required fields with sensible defaults
          matchPercent: null,
          minDeposit: null,
          promoCode: null,
          wageringUnit: 'bonus',
          eligibleGames: [],
          gameWeightings: {},
          minOdds: null,
          maxCashout: null,
          expiryDays: scrapedBonus.endDate ? this.getDaysUntil(scrapedBonus.endDate) : 30,
          paymentMethodExclusions: [],
          existingUserEligible: false,
          valueScore: null,
          startAt: null
        };

        await storage.createBonus(newBonus);
        console.log(`Created new bonus: ${scrapedBonus.title}`);
      }
    }
  }

  private normalizeTitle(title: string): string {
    return title.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  private hasSignificantChange(existing: any, scraped: ScrapedBonus): boolean {
    return existing.maxBonus !== scraped.maxBonus ||
           existing.wageringRequirement !== scraped.wageringRequirement ||
           existing.description !== scraped.description;
  }

  private getDaysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private detectBonusType(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('free bet') || text.includes('risk free')) return 'free_bet';
    if (text.includes('no deposit')) return 'no_deposit';
    if (text.includes('match') || text.includes('%')) return 'match_deposit';
    if (text.includes('free spin') || text.includes('free play')) return 'free_spins';
    if (text.includes('cashback') || text.includes('cash back')) return 'cashback';
    
    return 'match_deposit'; // Default fallback
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Smart scheduling based on end dates
export class ScrapingScheduler {
  private scraper: BonusScraper;
  private configs: ScrapingConfig[];

  constructor(configs: ScrapingConfig[]) {
    this.scraper = new BonusScraper();
    this.configs = configs;
  }

  async scheduleIntelligentScraping() {
    await this.scraper.initialize();

    // Schedule regular scraping twice daily
    setInterval(() => {
      this.runFullScrape();
    }, 12 * 60 * 60 * 1000); // Every 12 hours

    // Schedule priority scraping for bonuses ending soon
    setInterval(() => {
      this.scrapeEndingSoon();
    }, 2 * 60 * 60 * 1000); // Every 2 hours

    console.log('Scraping scheduler initialized');
  }

  private async runFullScrape() {
    console.log('Starting full bonus scrape...');
    
    for (const config of this.configs) {
      try {
        const bonuses = await this.scraper.scrapeOperatorBonuses(config);
        await this.scraper.updateBonusDatabase(config.operatorId, bonuses);
        
        // Small delay between operators to be respectful
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Failed to scrape ${config.operatorName}:`, error);
      }
    }
    
    console.log('Full scrape completed');
  }

  private async scrapeEndingSoon() {
    console.log('Checking bonuses ending soon...');
    
    // Get bonuses ending in next 48 hours
    const endingSoon = await this.getBonusesEndingSoon();
    
    if (endingSoon.length > 0) {
      console.log(`Found ${endingSoon.length} bonuses ending soon, re-scraping...`);
      
      // Group by operator and re-scrape those operators
      const operatorIds = [...new Set(endingSoon.map(b => b.operatorId))];
      const configsToScrape = this.configs.filter(c => operatorIds.includes(c.operatorId));
      
      for (const config of configsToScrape) {
        const bonuses = await this.scraper.scrapeOperatorBonuses(config);
        await this.scraper.updateBonusDatabase(config.operatorId, bonuses);
      }
    }
  }

  private async getBonusesEndingSoon() {
    // This would query the database for bonuses ending in next 48 hours
    // For now, return empty array - would implement with actual DB query
    return [];
  }
}