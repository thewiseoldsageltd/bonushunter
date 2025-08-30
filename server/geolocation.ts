interface GeolocationResponse {
  country_code2: string;  // "US", "UK", "CA"
  country_name: string;   // "United States"
  state_prov: string;     // "New Jersey", "California" 
  city: string;          
  continent_code: string; // "NA", "EU"
  continent_name: string;
  timezone: string;      // "America/New_York"
  currency: {
    code: string;        // "USD", "GBP"
    name: string;
  };
  is_eu: boolean;
}

interface DetectedLocation {
  country: string;        // "United States"
  countryCode: string;    // "US"
  region: string;         // "New Jersey" or "UK" for countries
  regionCode: string;     // "NJ" or "UK"
  timezone: string;
  currency: string;
  continent: string;
  isEU: boolean;
}

export class GeolocationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ipgeolocation.io/ipgeo';

  constructor() {
    this.apiKey = process.env.IPGEOLOCATION_API_KEY || '';
    if (!this.apiKey) {
      console.warn('IPGEOLOCATION_API_KEY not set - geolocation will use fallback');
    }
  }

  /**
   * Detect user location from IP address
   */
  async detectLocation(ip: string): Promise<DetectedLocation> {
    try {
      // Skip local/private IPs - return default
      if (this.isPrivateIP(ip)) {
        return this.getDefaultLocation();
      }

      // If no API key, return default (for development)
      if (!this.apiKey) {
        console.log(`No API key - using default location for IP: ${ip}`);
        return this.getDefaultLocation();
      }

      const response = await fetch(`${this.baseUrl}?apiKey=${this.apiKey}&ip=${ip}&format=json`);
      
      if (!response.ok) {
        console.error(`Geolocation API error: ${response.status}`);
        return this.getDefaultLocation();
      }

      const data: GeolocationResponse = await response.json();
      
      return this.transformResponse(data);
    } catch (error) {
      console.error('Geolocation detection failed:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Get user's real IP from request (handles proxies/load balancers)
   */
  extractClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const remoteAddr = req.connection?.remoteAddress || req.socket?.remoteAddress;

    // Priority order for IP detection
    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, use the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }

    return remoteAddr || '127.0.0.1';
  }

  /**
   * Check if IP is private/local (127.x, 192.168.x, 10.x, etc.)
   */
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^127\./,           // 127.x.x.x (localhost)
      /^192\.168\./,      // 192.168.x.x (private)
      /^10\./,            // 10.x.x.x (private)
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.x.x - 172.31.x.x (private)
      /^::1$/,            // IPv6 localhost
      /^::ffff:127\./     // IPv4-mapped IPv6 localhost
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Transform API response to our format
   */
  private transformResponse(data: GeolocationResponse): DetectedLocation {
    // Map country codes to our jurisdiction codes
    const regionMapping: Record<string, { region: string; code: string }> = {
      'US': { region: data.state_prov || 'New Jersey', code: this.getUSStateCode(data.state_prov) },
      'GB': { region: 'United Kingdom', code: 'UK' },
      'UK': { region: 'United Kingdom', code: 'UK' },
      'CA': { region: data.state_prov || 'Ontario', code: data.state_prov === 'Ontario' ? 'ON' : 'CA' },
      'DE': { region: 'Germany', code: 'DE' },
      'SE': { region: 'Sweden', code: 'SE' },
      'MT': { region: 'Malta', code: 'MT' }
    };

    const mapping = regionMapping[data.country_code2] || {
      region: data.country_name,
      code: data.country_code2
    };

    return {
      country: data.country_name,
      countryCode: data.country_code2,
      region: mapping.region,
      regionCode: mapping.code,
      timezone: data.timezone,
      currency: data.currency?.code || 'USD',
      continent: data.continent_name,
      isEU: data.is_eu
    };
  }

  /**
   * Map US state names to codes for our jurisdiction system
   */
  private getUSStateCode(stateName: string): string {
    const stateMapping: Record<string, string> = {
      'New Jersey': 'NJ',
      'Pennsylvania': 'PA', 
      'Nevada': 'NV',
      'New York': 'NY',
      'Michigan': 'MI',
      'Illinois': 'IL',
      'Colorado': 'CO',
      'Indiana': 'IN',
      'Virginia': 'VA',
      'Arizona': 'AZ'
    };

    return stateMapping[stateName] || 'NJ'; // Default to NJ if state not found
  }

  /**
   * Default location for development/fallback
   */
  private getDefaultLocation(): DetectedLocation {
    return {
      country: 'United States',
      countryCode: 'US', 
      region: 'New Jersey',
      regionCode: 'NJ',
      timezone: 'America/New_York',
      currency: 'USD',
      continent: 'North America',
      isEU: false
    };
  }
}

// Singleton instance
export const geolocationService = new GeolocationService();