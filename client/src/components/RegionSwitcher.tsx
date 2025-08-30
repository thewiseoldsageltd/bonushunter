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
import { Globe, MapPin, CheckCircle } from "lucide-react";

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

  const regionDisplayNames: Record<string, string> = {
    'US': '🇺🇸 United States',
    'UK': '🇬🇧 United Kingdom', 
    'CA': '🇨🇦 Canada',
    'EU': '🇪🇺 European Union',
    'NJ': '🇺🇸 New Jersey',
    'PA': '🇺🇸 Pennsylvania',
    'NV': '🇺🇸 Nevada',
    'NY': '🇺🇸 New York',
    'MI': '🇺🇸 Michigan'
  };

  const getRegionDisplay = (regionCode: string) => {
    return regionDisplayNames[regionCode] || `🌍 ${regionCode}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Detected Location Indicator */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
        <MapPin className="w-3 h-3" />
        <span>{detectedLocation.country}</span>
      </div>

      {/* Region Switcher */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isSwitching}
            className="flex items-center gap-2"
            data-testid="button-region-switcher"
          >
            <Globe className={`w-4 h-4 ${isSwitching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{getRegionDisplay(currentRegion.regionCode)}</span>
            <span className="sm:hidden">{currentRegion.regionCode}</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Select Region
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Detected: {detectedLocation.region}
          </div>
          <DropdownMenuSeparator />
          
          {availableRegions.map((regionCode) => (
            <DropdownMenuItem
              key={regionCode}
              onClick={() => switchRegion(regionCode)}
              className="flex items-center justify-between"
              data-testid={`option-region-${regionCode.toLowerCase()}`}
            >
              <span>{getRegionDisplay(regionCode)}</span>
              {currentRegion.regionCode === regionCode && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Automatic region detection ensures compliance with local gambling laws.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}