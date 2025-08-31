import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

interface HeroSectionProps {
  selectedRegion?: string;
  selectedState?: string;
}

export default function HeroSection({ selectedRegion, selectedState }: HeroSectionProps) {
  const [showChat, setShowChat] = useState(false);

  const handleStartChat = () => {
    setShowChat(true);
    // Scroll to show the full chat box on mobile
    setTimeout(() => {
      const chatElement = document.querySelector('[data-testid="chat-container"]');
      if (chatElement && window.innerWidth < 1024) {
        chatElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add extra scroll to ensure full visibility
        setTimeout(() => {
          window.scrollBy({ top: -65, behavior: 'smooth' });
        }, 500);
      }
    }, 100);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-light to-dark">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight mb-6">
              Find the Perfect
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Gambling Bonus{" "}
              </span>
              with AI
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Skip the endless comparison tables. Chat with our AI to discover personalized casino, sportsbook, and poker bonuses that match your budget, location, and preferences.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button 
                onClick={handleStartChat}
                className="bg-primary hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
                data-testid="button-start-chatting"
              >
                <MessageCircle className="mr-2" />
                Start Chatting
              </Button>
            </div>
          </div>
          
          <div 
            className="bg-dark-light/50 backdrop-blur-lg rounded-2xl border border-dark-lighter p-6 shadow-2xl"
            data-testid="chat-container"
          >
            {showChat ? (
              <ChatInterface selectedRegion={selectedRegion} selectedState={selectedState} />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="text-white text-sm" />
                    </div>
                    <div>
                      <span className="font-medium">Artemis</span>
                      <div className="text-xs text-gray-400">AI Bonus Hunter</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-4 h-64 overflow-y-auto">
                  <div className="flex justify-end">
                    <div className="bg-primary/20 rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm">I've got $50 to spend on blackjack in New Jersey</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="text-white text-xs" />
                    </div>
                    <div className="bg-dark-lighter rounded-lg px-4 py-3 flex-1">
                      <p className="text-sm mb-2">⚡ Excellent! I've analyzed bonuses across all operators and found 3 high-value blackjack options for New Jersey with your $50 budget:</p>
                      <div className="space-y-2">
                        <div className="bg-dark/50 rounded p-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-secondary">DraftKings Casino</span>
                            <span className="text-accent">96.8% Value Score</span>
                          </div>
                          <p className="text-gray-400">100% match up to $2,000 + $50 free</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="text-white text-xs" />
                    </div>
                    <div className="bg-dark-lighter rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartChat}
                  className="w-full bg-primary hover:bg-primary/90 transition-colors"
                  data-testid="button-start-chat-demo"
                >
                  Start Real Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
