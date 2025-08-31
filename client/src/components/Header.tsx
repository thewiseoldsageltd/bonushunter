import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, ChevronDown } from "lucide-react";
import { RegionSwitcher } from "./RegionSwitcher";
import { useRegion } from "@/hooks/useRegion";
import bonushunterUSLogo from "@assets/bonushunter-us-logo_1756570284184.png";
import bonushunterUKLogo from "@assets/bonushunter-uk-logo_1756570284184.png";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { getRegionBrandName, currentRegion, isLoading } = useRegion();
  
  // Use dynamic region code for dropdown
  const displayRegion = currentRegion?.regionCode || 'UK';
  

  return (
    <header className="bg-dark-light/50 backdrop-blur-lg border-b border-dark-lighter sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {displayRegion === 'US' ? (
              <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1">
                <img 
                  src={bonushunterUSLogo} 
                  alt="Bonushunter US Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : displayRegion === 'UK' ? (
              <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1">
                <img 
                  src={bonushunterUKLogo} 
                  alt="Bonushunter UK Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Search className="text-white text-lg" />
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-xl" data-testid="text-app-title">
                Bonushunter
              </h1>
              <p className="text-xs text-gray-400">
                AI-Powered Bonus Hunter
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-how-it-works"
            >
              How it Works
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-bonuses"
            >
              Bonuses
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-about"
            >
              About
            </a>
            
            {/* Region Switcher with Roundels */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900 bg-white"
                  data-testid="button-region-switcher"
                >
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                    <img 
                      src={displayRegion === 'US' ? bonushunterUSLogo : bonushunterUKLogo} 
                      alt={`${displayRegion} Logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span>{displayRegion}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => window.location.href = '/uk'}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUKLogo} alt="UK Logo" className="w-full h-full object-contain" />
                  </div>
                  UK
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/us'}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUSLogo} alt="US Logo" className="w-full h-full object-contain" />
                  </div>
                  US
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/ca'}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUKLogo} alt="CA Logo" className="w-full h-full object-contain" />
                  </div>
                  CA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/eu'}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUKLogo} alt="EU Logo" className="w-full h-full object-contain" />
                  </div>
                  EU
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              className="bg-primary hover:bg-primary/90 transition-colors"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="text-gray-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-dark border-dark-lighter">
              <div className="flex flex-col space-y-4 mt-8">
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  How it Works
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Bonuses
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </a>
                
                {/* Mobile Region Switcher */}
                <div className="py-2">
                  <RegionSwitcher />
                </div>
                
                <Button className="bg-primary hover:bg-primary/90 w-full">
                  Get Started
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
