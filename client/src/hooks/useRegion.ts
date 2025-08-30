import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RegionLogo {
  standard: string;
  compact: string;
  favicon: string;
  alt: string;
}

interface RegionBranding {
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
  tagline: string;
  currency: string;
  locale: string;
}

interface ComplianceConfig {
  legalNotice: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  regulatoryBody: string;
  minAge: number;
  restrictedAds: boolean;
  cookieConsent: boolean;
}

interface RegionFeatures {
  showCrypto: boolean;
  showSports: boolean;
  showCasino: boolean;
  showPoker: boolean;
  multiCurrency: boolean;
  vpnBlocking: boolean;
}

export interface RegionConfig {
  regionCode: string;
  regionName: string;
  logos: RegionLogo;
  branding: RegionBranding;
  compliance: ComplianceConfig;
  features: RegionFeatures;
  supportedJurisdictions: string[];
}

export interface DetectedLocation {
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  timezone: string;
  currency: string;
  continent: string;
  isEU: boolean;
  detectedIP: string;
}

interface RegionResponse {
  region: RegionConfig;
  availableRegions: string[];
  detectedLocation: DetectedLocation;
}

/**
 * Hook to manage region configuration and detection
 */
export function useRegion() {
  const queryClient = useQueryClient();

  // Fetch current region configuration
  const {
    data: regionData,
    isLoading,
    error
  } = useQuery<RegionResponse>({
    queryKey: ['/api/region-config'],
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 1
  });

  // Manual region switching mutation (if user wants to override detection)
  const switchRegionMutation = useMutation({
    mutationFn: async (newRegionCode: string) => {
      // In a real app, this would update user preferences
      // For now, we'll just invalidate the cache to re-fetch
      console.log(`🌍 User manually switching to region: ${newRegionCode}`);
      
      // Store user preference in localStorage for consistency
      localStorage.setItem('bonushunter-preferred-region', newRegionCode);
      
      // We could make an API call to store user preference
      // await apiRequest('/api/user/region-preference', 'POST', { regionCode: newRegionCode });
      
      return { regionCode: newRegionCode };
    },
    onSuccess: () => {
      // Invalidate region config to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/region-config'] });
      // Also invalidate bonuses since they're region-filtered
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
    }
  });

  // Helper functions
  const getCurrentRegion = (): RegionConfig | undefined => {
    return regionData?.region;
  };

  const getDetectedLocation = (): DetectedLocation | undefined => {
    return regionData?.detectedLocation;
  };

  const getAvailableRegions = (): string[] => {
    return regionData?.availableRegions || [];
  };

  const isRegionSupported = (regionCode: string): boolean => {
    return getAvailableRegions().includes(regionCode);
  };

  const shouldShowProduct = (productType: 'crypto' | 'sports' | 'casino' | 'poker'): boolean => {
    const region = getCurrentRegion();
    if (!region) return true;

    switch (productType) {
      case 'crypto': return region.features.showCrypto;
      case 'sports': return region.features.showSports;
      case 'casino': return region.features.showCasino;
      case 'poker': return region.features.showPoker;
      default: return true;
    }
  };

  const getRegionCurrency = (): string => {
    return getCurrentRegion()?.branding.currency || 'USD';
  };

  const getRegionBrandName = (): string => {
    return getCurrentRegion()?.branding.brandName || 'Bonushunter';
  };

  const getLegalNotice = (): string => {
    return getCurrentRegion()?.compliance.legalNotice || '';
  };

  const shouldShowCookieConsent = (): boolean => {
    return getCurrentRegion()?.compliance.cookieConsent || false;
  };

  return {
    // Data
    regionData,
    currentRegion: getCurrentRegion(),
    detectedLocation: getDetectedLocation(),
    availableRegions: getAvailableRegions(),
    
    // Loading states
    isLoading,
    error,
    isSwitching: switchRegionMutation.isPending,
    
    // Actions
    switchRegion: switchRegionMutation.mutate,
    
    // Helper methods
    isRegionSupported,
    shouldShowProduct,
    getRegionCurrency,
    getRegionBrandName,
    getLegalNotice,
    shouldShowCookieConsent
  };
}