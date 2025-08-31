import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedBonuses from "@/components/FeaturedBonuses";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Brain, 
  Trophy, 
  Calculator, 
  Shield, 
  UserCog,
  Rocket,
  Phone,
  Search,
  Twitter,
  Linkedin
} from "lucide-react";


export default function Home() {
  const [location, setLocation] = useLocation();
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const [selectedState, setSelectedState] = useState('NJ');
  
  // Get region from URL path or auto-detect
  useEffect(() => {
    // First check URL path
    let pathRegion = null;
    if (location === '/us') pathRegion = 'US';
    else if (location === '/uk') pathRegion = 'UK';
    else if (location === '/ca') pathRegion = 'CA';
    else if (location === '/eu') pathRegion = 'EU';
    
    if (pathRegion) {
      console.log(`🌍 Setting region from URL path: ${pathRegion}`);
      setSelectedRegion(pathRegion);
      return;
    }
    
    // Otherwise auto-detect
    fetch('/api/region-config')
      .then(res => res.json())
      .then(data => {
        if (data.region?.regionCode) {
          console.log(`🌍 Auto-detected region: ${data.region.regionCode}`);
          setSelectedRegion(data.region.regionCode);
        }
      })
      .catch(err => console.log('Region detection failed:', err));
  }, [location]);
  
  // Handle region changes by updating URL
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setLocation(region === 'UK' ? '/' : `/${region.toLowerCase()}`);
  };
  
  // Handle state changes
  const handleStateChange = (state: string) => {
    setSelectedState(state);
  };
  
  return (
    <div className="min-h-screen bg-dark text-white">
      <Header 
        selectedRegion={selectedRegion} 
        onRegionChange={handleRegionChange}
        selectedState={selectedState}
        onStateChange={handleStateChange}
      />
      <HeroSection />
      
      {/* How It Works Section */}
      <section className="py-20 bg-dark-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">How Bonushunter Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI-powered platform makes finding the perfect gambling bonus as easy as having a conversation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="text-white text-2xl" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">Chat Naturally</h3>
              <p className="text-gray-300 leading-relaxed">
                Tell our AI about your budget, location, and gaming preferences in plain English. No forms to fill out.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Brain className="text-white text-2xl" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">AI Analysis</h3>
              <p className="text-gray-300 leading-relaxed">
                Our smart algorithm considers wagering requirements, RTP, and regulatory compliance to rank offers by true value.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="text-white text-2xl" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">Perfect Match</h3>
              <p className="text-gray-300 leading-relaxed">
                Get personalized bonus recommendations ranked by value, not just marketing appeal. Make smarter choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedBonuses selectedRegion={selectedRegion} selectedState={selectedState} />

      {/* AI Features Section */}
      <section className="py-20 bg-gradient-to-br from-dark-light/50 to-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our intelligent system goes beyond simple comparisons to find bonuses with real value
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calculator className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2">Value Formula Analysis</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our AI evaluates true player value by calculating expected RTP after wagering requirements, eligible games, and withdrawal restrictions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2">Regulatory Compliance</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Automatically filters bonuses to show only licensed, legal operators in your specific region for complete peace of mind.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCog className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2">Smart Personalization</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Considers your budget, preferred games, location, and playing style to recommend bonuses that actually fit your needs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-light/50 backdrop-blur-lg rounded-2xl border border-dark-lighter p-8">
              <h4 className="font-display font-semibold text-xl mb-6">Sample Value Calculation</h4>
              
              <div className="space-y-4">
                <div className="bg-dark/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Bonus Amount</span>
                    <span className="text-white font-semibold">$100</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Wagering Requirement</span>
                    <span className="text-white">20x</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Eligible Games RTP</span>
                    <span className="text-white">96.5%</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Expected Value</span>
                      <span className="text-accent font-bold text-lg">$67.50</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 leading-relaxed">
                  *Calculation factors in wagering requirements, game restrictions, and statistical RTP to show real expected value
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">
            Ready to Find Your Perfect Bonus?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of smart players who use Bonushunter to make informed decisions about their gambling bonuses. Start chatting with our AI today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
              data-testid="button-start-finding-bonuses"
            >
              <Rocket className="mr-2" />
              Start Finding Bonuses
            </Button>
            <Button 
              variant="outline"
              className="border-dark-lighter hover:border-gray-400 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
              data-testid="button-contact-sales"
            >
              <Phone className="mr-2" />
              Contact Sales
            </Button>
          </div>
          
          {/* Admin Access */}
          <div className="mt-8 text-center">
            <a 
              href="/admin" 
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm"
            >
              <UserCog className="mr-2 h-4 w-4" />
              Admin Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-light border-t border-dark-lighter py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Search className="text-white text-sm" />
                </div>
                <span className="font-display font-bold text-lg">Bonushunter</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The smartest way to find gambling bonuses with real value. Powered by AI, trusted by players.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">How it Works</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">AI Technology</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Bonus Database</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">API Access</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">About Us</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Careers</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Press</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Contact</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Responsible Gaming</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Cookie Policy</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-dark-lighter mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bonushunter. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
