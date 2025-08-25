import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-dark-light/50 backdrop-blur-lg border-b border-dark-lighter sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Search className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl" data-testid="text-app-title">Bonushunter</h1>
              <p className="text-xs text-gray-400">AI-Powered Bonus Finder</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
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
