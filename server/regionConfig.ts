/**
 * Region-specific configuration for multi-market Bonushunter deployment
 * Handles logos, branding, compliance, and localization per jurisdiction
 */

interface RegionLogo {
  standard: string;    // Main logo URL/path
  compact: string;     // Smaller version for mobile
  favicon: string;     // Icon for browser tab
  alt: string;        // Alt text
}

interface RegionBranding {
  primaryColor: string;   // Main brand color
  secondaryColor: string; // Accent color  
  brandName: string;      // "Bonushunter US" vs "Bonushunter UK"
  tagline: string;        // Region-specific tagline
  currency: string;       // Default currency display
  locale: string;         // en-US, en-GB, etc.
}

interface ComplianceConfig {
  legalNotice: string;           // Footer legal text
  privacyPolicyUrl: string;      // Region-specific privacy policy
  termsOfServiceUrl: string;     // Region-specific terms
  regulatoryBody: string;        // "Licensed by NJ Gaming Commission"
  minAge: number;                // Legal gambling age
  restrictedAds: boolean;        // Whether to show promotional ads
  cookieConsent: boolean;        // EU cookie consent requirements
}

interface RegionConfig {
  regionCode: string;      // "US", "UK", "NJ", etc.
  regionName: string;      // "United States", "United Kingdom"
  logos: RegionLogo;
  branding: RegionBranding;
  compliance: ComplianceConfig;
  features: {
    showCrypto: boolean;         // Show crypto gambling options
    showSports: boolean;         // Show sportsbook bonuses  
    showCasino: boolean;         // Show casino bonuses
    showPoker: boolean;          // Show poker bonuses
    multiCurrency: boolean;      // Support multiple currencies
    vpnBlocking: boolean;        // Block VPN/proxy access
  };
  supportedJurisdictions: string[]; // Jurisdiction codes this region supports
}

export class RegionConfigService {
  private readonly configs: Map<string, RegionConfig> = new Map();

  constructor() {
    this.initializeRegionConfigs();
  }

  /**
   * Get configuration for a region/country code
   */
  getRegionConfig(regionCode: string): RegionConfig {
    const config = this.configs.get(regionCode.toUpperCase());
    if (config) {
      return config;
    }

    // Fallback to country-level config for US states
    if (this.isUSState(regionCode)) {
      return this.configs.get('US') || this.getDefaultConfig();
    }

    // Default fallback
    return this.getDefaultConfig();
  }

  /**
   * Get all available region codes
   */
  getAvailableRegions(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Check if a jurisdiction is supported in a region
   */
  isJurisdictionSupported(regionCode: string, jurisdictionCode: string): boolean {
    const config = this.getRegionConfig(regionCode);
    return config.supportedJurisdictions.includes(jurisdictionCode);
  }

  private initializeRegionConfigs() {
    // United States Configuration  
    this.configs.set('US', {
      regionCode: 'US',
      regionName: 'United States',
      logos: {
        standard: '/public-objects/logos/bonushunter-us-logo.png',
        compact: '/public-objects/logos/bonushunter-us-compact.png', 
        favicon: '/public-objects/logos/bonushunter-us-favicon.ico',
        alt: 'Bonushunter US - America\'s Bonus Hunter'
      },
      branding: {
        primaryColor: '#6366F1',      // Patriot blue
        secondaryColor: '#EF4444',    // Freedom red  
        brandName: 'Bonushunter US',
        tagline: 'America\'s Premier Bonus Hunter',
        currency: 'USD',
        locale: 'en-US'
      },
      compliance: {
        legalNotice: 'Licensed operators only. Must be 21+ and located in a regulated state.',
        privacyPolicyUrl: '/legal/privacy-policy-us',
        termsOfServiceUrl: '/legal/terms-of-service-us', 
        regulatoryBody: 'State Gaming Commissions',
        minAge: 21,
        restrictedAds: true,
        cookieConsent: false
      },
      features: {
        showCrypto: false,    // US doesn't allow crypto gambling
        showSports: true,     // Legal in many US states
        showCasino: true,     // Legal in some US states  
        showPoker: true,      // Legal in some US states
        multiCurrency: false, // USD only
        vpnBlocking: true     // Strict location verification
      },
      supportedJurisdictions: ['NJ', 'PA', 'NV', 'NY', 'MI', 'IL', 'CO', 'IN', 'VA', 'AZ']
    });

    // United Kingdom Configuration
    this.configs.set('UK', {
      regionCode: 'UK',
      regionName: 'United Kingdom', 
      logos: {
        standard: '/public-objects/logos/bonushunter-uk-logo.png',
        compact: '/public-objects/logos/bonushunter-uk-compact.png',
        favicon: '/public-objects/logos/bonushunter-uk-favicon.ico',
        alt: 'Bonushunter UK - Britain\'s Bonus Hunter'
      },
      branding: {
        primaryColor: '#1E40AF',      // Royal blue
        secondaryColor: '#DC2626',    // British red
        brandName: 'Bonushunter UK',  
        tagline: 'Britain\'s Premier Bonus Hunter',
        currency: 'GBP',
        locale: 'en-GB'
      },
      compliance: {
        legalNotice: 'Licensed by the UK Gambling Commission. Must be 18+.',
        privacyPolicyUrl: '/legal/privacy-policy-uk',
        termsOfServiceUrl: '/legal/terms-of-service-uk',
        regulatoryBody: 'UK Gambling Commission',
        minAge: 18,
        restrictedAds: true,
        cookieConsent: true    // GDPR requirements
      },
      features: {
        showCrypto: false,     // UK banned crypto gambling 
        showSports: true,      // Fully legal
        showCasino: true,      // Fully legal
        showPoker: true,       // Fully legal
        multiCurrency: true,   // GBP, EUR support
        vpnBlocking: true      // UKGC requires location verification
      },
      supportedJurisdictions: ['UK']
    });

    // Canadian Configuration
    this.configs.set('CA', {
      regionCode: 'CA', 
      regionName: 'Canada',
      logos: {
        standard: '/public-objects/logos/bonushunter-ca-logo.png',
        compact: '/public-objects/logos/bonushunter-ca-compact.png',
        favicon: '/public-objects/logos/bonushunter-ca-favicon.ico',
        alt: 'Bonushunter Canada - Canada\'s Bonus Hunter'
      },
      branding: {
        primaryColor: '#DC2626',      // Canada red
        secondaryColor: '#1F2937',    // Charcoal
        brandName: 'Bonushunter Canada',
        tagline: 'Canada\'s Premier Bonus Hunter', 
        currency: 'CAD',
        locale: 'en-CA'
      },
      compliance: {
        legalNotice: 'Provincial licensing varies. Must be 18+ or 19+ depending on province.',
        privacyPolicyUrl: '/legal/privacy-policy-ca',
        termsOfServiceUrl: '/legal/terms-of-service-ca',
        regulatoryBody: 'Provincial Gaming Authorities',
        minAge: 19,
        restrictedAds: false,
        cookieConsent: false
      },
      features: {
        showCrypto: true,      // More permissive crypto rules
        showSports: true,      // Legal in Ontario
        showCasino: true,      // Legal in Ontario  
        showPoker: true,       // Legal in Ontario
        multiCurrency: true,   // CAD, USD
        vpnBlocking: false     // Less restrictive
      },
      supportedJurisdictions: ['ON']
    });

    // European Union Default (Malta/Sweden/Germany)
    this.configs.set('EU', {
      regionCode: 'EU',
      regionName: 'European Union',
      logos: {
        standard: '/public-objects/logos/bonushunter-eu-logo.png', 
        compact: '/public-objects/logos/bonushunter-eu-compact.png',
        favicon: '/public-objects/logos/bonushunter-eu-favicon.ico',
        alt: 'Bonushunter Europe - Europe\'s Bonus Hunter'
      },
      branding: {
        primaryColor: '#1E3A8A',      // EU blue
        secondaryColor: '#FBBF24',    // EU gold
        brandName: 'Bonushunter Europe',
        tagline: 'Europe\'s Premier Bonus Hunter',
        currency: 'EUR', 
        locale: 'en-EU'
      },
      compliance: {
        legalNotice: 'MGA licensed operators. Must be 18+. GDPR compliant.',
        privacyPolicyUrl: '/legal/privacy-policy-eu',
        termsOfServiceUrl: '/legal/terms-of-service-eu',
        regulatoryBody: 'Malta Gaming Authority',
        minAge: 18,
        restrictedAds: true,
        cookieConsent: true    // GDPR mandatory
      },
      features: {
        showCrypto: false,     // Most EU countries restrict crypto gambling
        showSports: true,      // Generally legal  
        showCasino: true,      // MGA licensed
        showPoker: true,       // MGA licensed
        multiCurrency: true,   // EUR, GBP, SEK, etc.
        vpnBlocking: false     // More lenient for EU travelers
      },
      supportedJurisdictions: ['MT', 'DE', 'SE']  
    });
  }

  private isUSState(code: string): boolean {
    const usStates = ['NJ', 'PA', 'NV', 'NY', 'MI', 'IL', 'CO', 'IN', 'VA', 'AZ'];
    return usStates.includes(code.toUpperCase());
  }

  private getDefaultConfig(): RegionConfig {
    return this.configs.get('US')!; // Fallback to US config
  }
}

// Singleton instance
export const regionConfigService = new RegionConfigService();