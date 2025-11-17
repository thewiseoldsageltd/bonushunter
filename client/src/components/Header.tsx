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
import bonushunterUSLogo from "@assets/bonushunter-us-logo_1756570284184.png";
import bonushunterUKLogo from "@assets/bonushunter-uk-logo_1756570284184.png";

// Import all 50 state logos with exact filenames
import alabamaLogo from "@assets/map-alabama-green-white_1763409234670.webp";
import alaskaLogo from "@assets/map-alaska-green-white_1763409234675.webp";
import arizonaLogo from "@assets/map-arizona-green-white_1763409234675.webp";
import arkansasLogo from "@assets/map-arkansas-green-white_1763409234675.webp";
import californiaLogo from "@assets/map-california-green-white_1763409234676.webp";
import coloradoLogo from "@assets/map-colorado-green-white_1763409234676.webp";
import connecticutLogo from "@assets/map-connecticut-green-white_1763409234676.webp";
import delawareLogo from "@assets/map-delaware-green-white_1763409234676.webp";
import floridaLogo from "@assets/map-florida-green-white_1763409234676.webp";
import georgiaLogo from "@assets/map-georgia-green-white_1763409234676.webp";
import hawaiiLogo from "@assets/map-hawaii-green-white_1763409234676.webp";
import idahoLogo from "@assets/map-idaho-green-white_1763409234676.webp";
import illinoisLogo from "@assets/map-illinois-green-white_1763409234676.webp";
import indianaLogo from "@assets/map-indiana-green-white_1763409234677.webp";
import iowaLogo from "@assets/map-iowa-green-white_1763409234677.webp";
import kansasLogo from "@assets/map-kansas-green-white_1763409234677.webp";
import kentuckyLogo from "@assets/map-kentucky-green-white_1763409234677.webp";
import louisianaLogo from "@assets/map-louisiana-green-white_1763409234677.webp";
import maineLogo from "@assets/map-maine-green-white_1763409234677.webp";
import marylandLogo from "@assets/map-maryland-green-white_1763409234677.webp";
import massachusettsLogo from "@assets/map-massachusetts-green-white_1763409315475.webp";
import michiganLogo from "@assets/map-michigan-green-white_1763409315481.webp";
import minnesotaLogo from "@assets/map-minnesota-green-white_1763409315481.webp";
import mississippiLogo from "@assets/map-mississippi-green-white_1763409315481.webp";
import missouriLogo from "@assets/map-missouri-green-white_1763409315481.webp";
import montanaLogo from "@assets/map-montana-green-white_1763409315481.webp";
import nebraskaLogo from "@assets/map-nebraska-green-white_1763409315481.webp";
import nevadaLogo from "@assets/map-nevada-green-white_1763409315482.webp";
import newHampshireLogo from "@assets/map-new-hampshire-green-white_1763409315482.webp";
import newJerseyLogo from "@assets/New Jersey Green White 500x500_1756880814789.webp";
import newMexicoLogo from "@assets/map-new-mexico-green-white_1763409315482.webp";
import newYorkLogo from "@assets/map-new-york-green-white_1763409315482.webp";
import northCarolinaLogo from "@assets/map-north-carolina-green-white_1763409315482.webp";
import northDakotaLogo from "@assets/map-north-dakota-green-white_1763409315482.webp";
import ohioLogo from "@assets/map-ohio-green-white_1763409315483.webp";
import oklahomaLogo from "@assets/map-oklahoma-green-white_1763409315483.webp";
import oregonLogo from "@assets/map-oregon-green-white_1763409315483.webp";
import pennsylvaniaLogo from "@assets/map-pennsylvania-green-white_1763409315483.webp";
import rhodeIslandLogo from "@assets/map-rhode-island-green-white_1763409315483.webp";
import southCarolinaLogo from "@assets/map-south-carolina-green-white_1763409315483.webp";
import southDakotaLogo from "@assets/map-south-dakota-green-white_1763409549840.webp";
import tennesseeLogo from "@assets/map-tennessee-green-white_1763409549840.webp";
import texasLogo from "@assets/map-texas-green-white_1763409549840.webp";
import utahLogo from "@assets/map-utah-green-white_1763409549840.webp";
import vermontLogo from "@assets/map-vermont-green-white_1763409549839.webp";
import virginiaLogo from "@assets/map-virginia-green-white_1763409549834.webp";
import washingtonLogo from "@assets/map-washington-green-white_1763409549834.webp";
import westVirginiaLogo from "@assets/map-west-virginia-green-white_1763409549834.webp";
import wisconsinLogo from "@assets/map-wisconsin-green-white_1763409549834.webp";
import wyomingLogo from "@assets/map-wyoming-green-white_1763409549834.webp";

interface HeaderProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedState?: string;
  onStateChange?: (state: string) => void;
}

// All 50 US states with their logos
const US_STATES = [
  { code: 'AL', name: 'Alabama', logo: alabamaLogo },
  { code: 'AK', name: 'Alaska', logo: alaskaLogo },
  { code: 'AZ', name: 'Arizona', logo: arizonaLogo },
  { code: 'AR', name: 'Arkansas', logo: arkansasLogo },
  { code: 'CA', name: 'California', logo: californiaLogo },
  { code: 'CO', name: 'Colorado', logo: coloradoLogo },
  { code: 'CT', name: 'Connecticut', logo: connecticutLogo },
  { code: 'DE', name: 'Delaware', logo: delawareLogo },
  { code: 'FL', name: 'Florida', logo: floridaLogo },
  { code: 'GA', name: 'Georgia', logo: georgiaLogo },
  { code: 'HI', name: 'Hawaii', logo: hawaiiLogo },
  { code: 'ID', name: 'Idaho', logo: idahoLogo },
  { code: 'IL', name: 'Illinois', logo: illinoisLogo },
  { code: 'IN', name: 'Indiana', logo: indianaLogo },
  { code: 'IA', name: 'Iowa', logo: iowaLogo },
  { code: 'KS', name: 'Kansas', logo: kansasLogo },
  { code: 'KY', name: 'Kentucky', logo: kentuckyLogo },
  { code: 'LA', name: 'Louisiana', logo: louisianaLogo },
  { code: 'ME', name: 'Maine', logo: maineLogo },
  { code: 'MD', name: 'Maryland', logo: marylandLogo },
  { code: 'MA', name: 'Massachusetts', logo: massachusettsLogo },
  { code: 'MI', name: 'Michigan', logo: michiganLogo },
  { code: 'MN', name: 'Minnesota', logo: minnesotaLogo },
  { code: 'MS', name: 'Mississippi', logo: mississippiLogo },
  { code: 'MO', name: 'Missouri', logo: missouriLogo },
  { code: 'MT', name: 'Montana', logo: montanaLogo },
  { code: 'NE', name: 'Nebraska', logo: nebraskaLogo },
  { code: 'NV', name: 'Nevada', logo: nevadaLogo },
  { code: 'NH', name: 'New Hampshire', logo: newHampshireLogo },
  { code: 'NJ', name: 'New Jersey', logo: newJerseyLogo },
  { code: 'NM', name: 'New Mexico', logo: newMexicoLogo },
  { code: 'NY', name: 'New York', logo: newYorkLogo },
  { code: 'NC', name: 'North Carolina', logo: northCarolinaLogo },
  { code: 'ND', name: 'North Dakota', logo: northDakotaLogo },
  { code: 'OH', name: 'Ohio', logo: ohioLogo },
  { code: 'OK', name: 'Oklahoma', logo: oklahomaLogo },
  { code: 'OR', name: 'Oregon', logo: oregonLogo },
  { code: 'PA', name: 'Pennsylvania', logo: pennsylvaniaLogo },
  { code: 'RI', name: 'Rhode Island', logo: rhodeIslandLogo },
  { code: 'SC', name: 'South Carolina', logo: southCarolinaLogo },
  { code: 'SD', name: 'South Dakota', logo: southDakotaLogo },
  { code: 'TN', name: 'Tennessee', logo: tennesseeLogo },
  { code: 'TX', name: 'Texas', logo: texasLogo },
  { code: 'UT', name: 'Utah', logo: utahLogo },
  { code: 'VT', name: 'Vermont', logo: vermontLogo },
  { code: 'VA', name: 'Virginia', logo: virginiaLogo },
  { code: 'WA', name: 'Washington', logo: washingtonLogo },
  { code: 'WV', name: 'West Virginia', logo: westVirginiaLogo },
  { code: 'WI', name: 'Wisconsin', logo: wisconsinLogo },
  { code: 'WY', name: 'Wyoming', logo: wyomingLogo },
];

export default function Header({ selectedRegion, onRegionChange, selectedState, onStateChange }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayRegion = selectedRegion;
  const currentState = US_STATES.find(s => s.code === (selectedState || 'NJ')) || US_STATES.find(s => s.code === 'NJ')!;

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900 bg-white"
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
                <DropdownMenuItem onClick={() => onRegionChange('UK')}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUKLogo} alt="UK Logo" className="w-full h-full object-contain" />
                  </div>
                  UK
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRegionChange('US')}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterUSLogo} alt="US Logo" className="w-full h-full object-contain" />
                  </div>
                  US
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedRegion === 'US' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900 bg-white"
                  >
                    <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                      <img 
                        src={currentState.logo} 
                        alt={`${currentState.name} Logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span>{currentState.code}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-40 max-h-96 overflow-y-auto">
                  {US_STATES.map(state => (
                    <DropdownMenuItem 
                      key={state.code} 
                      onClick={() => onStateChange?.(state.code)}
                    >
                      <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                        <img src={state.logo} alt={`${state.name} Logo`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      {state.code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button 
              className="bg-primary hover:bg-primary/90 transition-colors"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </nav>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="md:hidden hover:bg-transparent focus:bg-transparent active:bg-transparent focus:ring-0 focus:outline-none" 
                data-testid="button-mobile-menu"
              >
                <Menu className="text-gray-300 hover:text-white transition-colors" />
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
                
                <div className="py-2 border-t border-dark-lighter">
                  <p className="text-gray-400 text-sm mb-3">Region</p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between mb-3 text-gray-900 hover:text-gray-900 bg-white hover:bg-gray-50 focus:bg-white active:bg-white"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                            <img 
                              src={displayRegion === 'US' ? bonushunterUSLogo : bonushunterUKLogo} 
                              alt={`${displayRegion} Logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span>{displayRegion}</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="center" className="w-full">
                      <DropdownMenuItem onClick={() => onRegionChange('UK')}>
                        <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                          <img src={bonushunterUKLogo} alt="UK Logo" className="w-full h-full object-contain" />
                        </div>
                        UK
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRegionChange('US')}>
                        <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                          <img src={bonushunterUSLogo} alt="US Logo" className="w-full h-full object-contain" />
                        </div>
                        US
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {selectedRegion === 'US' && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">State</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-between text-gray-900 hover:text-gray-900 bg-white hover:bg-gray-50 focus:bg-white active:bg-white"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                                <img 
                                  src={currentState.logo} 
                                  alt={`${currentState.name} Logo`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span>{currentState.code}</span>
                            </div>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="center" className="w-full max-h-96 overflow-y-auto">
                          {US_STATES.map(state => (
                            <DropdownMenuItem 
                              key={state.code} 
                              onClick={() => onStateChange?.(state.code)}
                            >
                              <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                                <img src={state.logo} alt={`${state.name} Logo`} className="w-full h-full object-contain" loading="lazy" />
                              </div>
                              {state.code}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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
