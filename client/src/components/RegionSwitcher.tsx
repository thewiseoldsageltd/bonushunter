import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { useRegion } from "@/hooks/useRegion";

export function RegionSwitcher() {
  const { currentRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  // Simple region switcher that always shows
  const regionCode = currentRegion?.regionCode || 'UK';
  
  const handleRegionSelect = (newRegion: string) => {
    window.location.href = `/${newRegion.toLowerCase()}`;
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900 bg-white"
          data-testid="button-region-switcher"
        >
          <Globe className="w-4 h-4" />
          <span>{regionCode}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => handleRegionSelect('US')}>
          🇺🇸 US
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRegionSelect('UK')}>
          🇬🇧 UK  
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRegionSelect('CA')}>
          🇨🇦 CA
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRegionSelect('EU')}>
          🇪🇺 EU
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}