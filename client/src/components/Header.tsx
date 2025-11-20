import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, ChevronDown, MapPin } from "lucide-react";
import bonushunterUSLogo from "@assets/bonushunter-us-logo_1756567626654.webp";
import bonushunterUKLogo from "@assets/bonushunter-uk-logo_1756568894640.webp";
import bonushunterCALogo from "@assets/bonushunter-ca-logo_1763663717348.webp";

// Import all 50 optimized 64x64px state logos
import alabamaLogo from "@assets/Alabama 64x64_1763644327429.webp";
import alaskaLogo from "@assets/Alaska 64x64_1763644327430.webp";
import arizonaLogo from "@assets/Arizona 64x64_1763644327430.webp";
import arkansasLogo from "@assets/Arkansas 64x64_1763644327430.webp";
import californiaLogo from "@assets/California 64x64_1763644327430.webp";
import coloradoLogo from "@assets/Colorado 64x64_1763644327430.webp";
import connecticutLogo from "@assets/Connecticut 64x64_1763644327430.webp";
import delawareLogo from "@assets/Delaware 64x64_1763644327431.webp";
import floridaLogo from "@assets/Florida 64x64_1763644327431.webp";
import georgiaLogo from "@assets/Georgia 64x64_1763644327431.webp";
import hawaiiLogo from "@assets/Hawaii 64x64_1763644327431.webp";
import idahoLogo from "@assets/Idaho 64x64_1763644327431.webp";
import illinoisLogo from "@assets/Illinois 64x64_1763644327433.webp";
import indianaLogo from "@assets/Indiana 64x64_1763644327433.webp";
import iowaLogo from "@assets/Iowa 64x64_1763644327434.webp";
import kansasLogo from "@assets/Kansas 64x64_1763644327434.webp";
import kentuckyLogo from "@assets/Kentucky 64x64_1763644327434.webp";
import louisianaLogo from "@assets/Louisiana 64x64_1763644327434.webp";
import maineLogo from "@assets/Maine 64x64_1763644327434.webp";
import marylandLogo from "@assets/Maryland 64x64_1763644327434.webp";
import massachusettsLogo from "@assets/Massachusetts 64x64_1763644386885.webp";
import michiganLogo from "@assets/Michigan 64x64_1763644386886.webp";
import minnesotaLogo from "@assets/Minnesota 64x64_1763644386886.webp";
import mississippiLogo from "@assets/Mississippi 64x64_1763644386886.webp";
import missouriLogo from "@assets/Missouri 64x64_1763644386886.webp";
import montanaLogo from "@assets/Montana 64x64_1763644386886.webp";
import nebraskaLogo from "@assets/Nebraska 64x64_1763644386886.webp";
import nevadaLogo from "@assets/Nevada 64x64_1763644386887.webp";
import newHampshireLogo from "@assets/New Hampshire 64x64_1763644386887.webp";
import newJerseyLogo from "@assets/New Jersey 64x64_1763644386887.webp";
import newMexicoLogo from "@assets/New Mexico 64x64_1763644386887.webp";
import newYorkLogo from "@assets/New York 64x64_1763644386887.webp";
import northCarolinaLogo from "@assets/North Carolina 64x64_1763644386887.webp";
import northDakotaLogo from "@assets/North Dakota 64x64_1763644386887.webp";
import ohioLogo from "@assets/Ohio 64x64_1763644386888.webp";
import oklahomaLogo from "@assets/Oklahoma 64x64_1763644386888.webp";
import oregonLogo from "@assets/Oregon 64x64_1763644386888.webp";
import pennsylvaniaLogo from "@assets/Pennsylvania 64x64_1763644386888.webp";
import rhodeIslandLogo from "@assets/Rhode Island 64x64_1763644386888.webp";
import southCarolinaLogo from "@assets/South Carolina 64x64_1763644386888.webp";
import southDakotaLogo from "@assets/South Dakota 64x64_1763644432927.webp";
import tennesseeLogo from "@assets/Tennessee 64x64_1763644432927.webp";
import texasLogo from "@assets/Texas 64x64_1763644432927.webp";
import utahLogo from "@assets/Utah 64x64_1763644432927.webp";
import vermontLogo from "@assets/Vermont 64x64_1763644432926.webp";
import virginiaLogo from "@assets/Virginia 64x64_1763644432926.webp";
import washingtonLogo from "@assets/Washington 64x64_1763644432926.webp";
import westVirginiaLogo from "@assets/West Virginia 64x64_1763644432926.webp";
import wisconsinLogo from "@assets/Wisconsin 64x64_1763644432926.webp";
import wyomingLogo from "@assets/Wyoming 64x64_1763644432926.webp";

interface HeaderProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedState?: string;
  onStateChange?: (state: string) => void;
  onGetStarted?: () => void;
  onTestModeToggle?: () => void;
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

// Canadian Provinces - main provinces for now
const CANADIAN_PROVINCES = [
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Quebec' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'AB', name: 'Alberta' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'YT', name: 'Yukon' },
  { code: 'NU', name: 'Nunavut' },
];

export default function Header({ selectedRegion, onRegionChange, selectedState, onStateChange, onGetStarted, onTestModeToggle }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayRegion = selectedRegion;
  const currentState = US_STATES.find(s => s.code === (selectedState || 'NJ')) || US_STATES.find(s => s.code === 'NJ')!;
  const currentProvince = CANADIAN_PROVINCES.find(p => p.code === (selectedState || 'ON')) || CANADIAN_PROVINCES.find(p => p.code === 'ON')!;

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
            ) : displayRegion === 'CA' ? (
              <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1">
                <img 
                  src={bonushunterCALogo} 
                  alt="Bonushunter CA Logo"
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
              href="#how-it-works" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it Works
            </a>
            <a 
              href="#bonuses" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-bonuses"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('bonuses')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Bonuses
            </a>
            <a 
              href="#about" 
              className="text-gray-300 hover:text-white transition-colors"
              data-testid="link-about"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
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
                      src={displayRegion === 'US' ? bonushunterUSLogo : displayRegion === 'UK' ? bonushunterUKLogo : bonushunterCALogo} 
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
                <DropdownMenuItem onClick={() => onRegionChange('CA')}>
                  <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                    <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                  </div>
                  CA
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
            
            {selectedRegion === 'CA' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 h-8 text-gray-900 hover:text-gray-900 bg-white"
                  >
                    <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                      <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                    </div>
                    <span>{currentProvince.code}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48 max-h-96 overflow-y-auto">
                  {CANADIAN_PROVINCES.map(province => (
                    <DropdownMenuItem 
                      key={province.code} 
                      onClick={() => onStateChange?.(province.code)}
                    >
                      <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                        <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                      </div>
                      {province.code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Development-only test mode button - completely excluded from production builds */}
            {import.meta.env.DEV && (
              <Button 
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="button-test-mode"
                onClick={onTestModeToggle}
                title="Toggle Location Test Mode (Dev Only)"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              className="bg-primary hover:bg-primary/90 transition-colors"
              data-testid="button-get-started"
              onClick={onGetStarted}
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
                  href="#how-it-works" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                >
                  How it Works
                </a>
                <a 
                  href="#bonuses" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    setTimeout(() => {
                      document.getElementById('bonuses')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                >
                  Bonuses
                </a>
                <a 
                  href="#about" 
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
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
                              src={displayRegion === 'US' ? bonushunterUSLogo : displayRegion === 'UK' ? bonushunterUKLogo : bonushunterCALogo} 
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
                      <DropdownMenuItem onClick={() => onRegionChange('CA')}>
                        <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                          <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                        </div>
                        CA
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
                  
                  {selectedRegion === 'CA' && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Province</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-between text-gray-900 hover:text-gray-900 bg-white hover:bg-gray-50 focus:bg-white active:bg-white"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                                <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                              </div>
                              <span>{currentProvince.code}</span>
                            </div>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="center" className="w-full max-h-96 overflow-y-auto">
                          {CANADIAN_PROVINCES.map(province => (
                            <DropdownMenuItem 
                              key={province.code} 
                              onClick={() => onStateChange?.(province.code)}
                            >
                              <div className="w-4 h-4 bg-white rounded-sm overflow-hidden flex items-center justify-center mr-2">
                                <img src={bonushunterCALogo} alt="CA Logo" className="w-full h-full object-contain" />
                              </div>
                              {province.code}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="bg-primary hover:bg-primary/90 w-full"
                  onClick={() => {
                    setIsOpen(false); // Close menu first
                    onGetStarted?.(); // Then trigger the scroll and chat activation
                  }}
                >
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
