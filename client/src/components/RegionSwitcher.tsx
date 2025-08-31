import { useState } from "react";
import { useRegion } from "@/hooks/useRegion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Globe, CheckCircle, ChevronDown } from "lucide-react";
import bonushunterUSLogo from "@assets/bonushunter-us-logo_1756570284184.png";
import bonushunterUKLogo from "@assets/bonushunter-uk-logo_1756570284184.png";

/**
 * Region switcher component that shows detected location
 * and allows manual region switching for compliance
 */
export function RegionSwitcher() {
  const {
    currentRegion,
    detectedLocation,
    availableRegions,
    isLoading,
    isSwitching,
    switchRegion
  } = useRegion();

  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !currentRegion || !detectedLocation) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Globe className="w-4 h-4 animate-spin" />
        <span>Detecting location...</span>
      </div>
    );
  }

  const regionConfig: Record<string, { name: string; logo?: string }> = {
    'US': { name: 'US', logo: bonushunterUSLogo },
    'UK': { name: 'UK', logo: bonushunterUKLogo }, 
    'CA': { name: 'CA' },
    'EU': { name: 'EU' },
    'NJ': { name: 'NJ', logo: bonushunterUSLogo },
    'PA': { name: 'PA', logo: bonushunterUSLogo },
    'NV': { name: 'NV', logo: bonushunterUSLogo },
    'NY': { name: 'NY', logo: bonushunterUSLogo },
    'MI': { name: 'MI', logo: bonushunterUSLogo }
  };

  const getRegionInfo = (regionCode: string) => {
    return regionConfig[regionCode] || { name: regionCode };
  };

  const currentRegionInfo = getRegionInfo(currentRegion.regionCode);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isSwitching}
          className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900"
          data-testid="button-region-switcher"
        >
          {currentRegionInfo.logo ? (
            <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
              <img 
                src={currentRegionInfo.logo} 
                alt={`${currentRegionInfo.name} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <Globe className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
          )}
          <span className="hidden sm:inline text-sm">{currentRegionInfo.name}</span>
          <span className="sm:hidden text-sm">{currentRegion.regionCode}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
        
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Region</DropdownMenuLabel>
        <DropdownMenuSeparator />
          
        {availableRegions.map((regionCode) => {
          const regionInfo = getRegionInfo(regionCode);
          return (
            <DropdownMenuItem
              key={regionCode}
              onClick={() => switchRegion(regionCode)}
              className="flex items-center gap-3 py-2"
              data-testid={`option-region-${regionCode.toLowerCase()}`}
            >
              {regionInfo.logo ? (
                <div className="w-6 h-6 bg-white rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img 
                    src={regionInfo.logo} 
                    alt={`${regionInfo.name} Logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-gray-500" />
                </div>
              )}
              <span className="flex-1">{regionInfo.name}</span>
              {currentRegion.regionCode === regionCode && (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}