import { Request, Response, NextFunction } from 'express';
import { geolocationService } from '../geolocation';

// Extend Express Request type to include location data
declare global {
  namespace Express {
    interface Request {
      userLocation?: {
        country: string;
        countryCode: string;
        region: string;
        regionCode: string;
        timezone: string;
        currency: string;
        continent: string;
        isEU: boolean;
        detectedIP: string;
      };
    }
  }
}

/**
 * Middleware to detect user location from IP address
 * Adds location data to req.userLocation
 */
export const geolocationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract client IP address
    const clientIP = geolocationService.extractClientIP(req);
    
    // Detect location from IP
    const location = await geolocationService.detectLocation(clientIP);
    
    // Add location data to request
    req.userLocation = {
      ...location,
      detectedIP: clientIP
    };

    // Log detection for debugging (remove in production)
    console.log(`🌍 Location detected for ${clientIP}:`, {
      country: location.country,
      region: location.region,
      regionCode: location.regionCode
    });

    next();
  } catch (error) {
    console.error('Geolocation middleware error:', error);
    
    // Fallback to default location if detection fails
    req.userLocation = {
      country: 'United States',
      countryCode: 'US',
      region: 'New Jersey', 
      regionCode: 'NJ',
      timezone: 'America/New_York',
      currency: 'USD',
      continent: 'North America',
      isEU: false,
      detectedIP: geolocationService.extractClientIP(req)
    };
    
    next();
  }
};

/**
 * Optional: Middleware to cache location detection per IP
 * Reduces API calls for repeated visitors
 */
const locationCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const cachedGeolocationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = geolocationService.extractClientIP(req);
    
    // Check cache first
    const cached = locationCache.get(clientIP);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      req.userLocation = {
        ...cached.location,
        detectedIP: clientIP
      };
      return next();
    }
    
    // Detect location
    const location = await geolocationService.detectLocation(clientIP);
    
    // Cache result
    locationCache.set(clientIP, {
      location,
      timestamp: Date.now()
    });
    
    // Add to request
    req.userLocation = {
      ...location,
      detectedIP: clientIP
    };

    console.log(`🌍 Location detected & cached for ${clientIP}:`, {
      country: location.country,
      region: location.region,
      regionCode: location.regionCode
    });

    next();
  } catch (error) {
    console.error('Cached geolocation middleware error:', error);
    
    // Fallback to default
    req.userLocation = {
      country: 'United States',
      countryCode: 'US',
      region: 'New Jersey',
      regionCode: 'NJ', 
      timezone: 'America/New_York',
      currency: 'USD',
      continent: 'North America',
      isEU: false,
      detectedIP: geolocationService.extractClientIP(req)
    };
    
    next();
  }
};

/**
 * Cleanup cache periodically
 */
setInterval(() => {
  const now = Date.now();
  locationCache.forEach((data, ip) => {
    if (now - data.timestamp > CACHE_DURATION) {
      locationCache.delete(ip);
    }
  });
}, 60 * 60 * 1000); // Cleanup every hour