import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Loader2, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BonusCard from "@/components/BonusCard";
import TypewriterText from "@/components/TypewriterText";
import type { ChatMessage, ChatResponse } from "@/types";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "artemis-welcome",
      role: "assistant", 
      content: "⚡ Hi! I'm Artemis, your AI bonus hunter. Tell me your budget, location, and favorite games - I'll find the best value bonuses for you!",
      timestamp: new Date(),
      isInitialMessage: true
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedTypewriterMessages, setCompletedTypewriterMessages] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
        userLocation: "New Jersey" // Default for demo
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        recommendations: data.recommendations
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant", 
        content: "I'm having trouble processing your request. Please try again or check if the OpenAI API key is properly configured.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  // Smart scroll behavior - anchor AI responses at top, scroll progressively
  useEffect(() => {
    if (scrollAreaRef.current && chatContainerRef.current) {
      const chatContainer = chatContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (chatContainer) {
        const lastMessage = messages[messages.length - 1];
        
        // For user messages, adjust scroll based on device type
        if (lastMessage?.role === 'user') {
          const isMobile = window.innerWidth < 1024;
          
          if (isMobile) {
            // On mobile, gentle scroll to avoid pushing chat box off-screen
            chatContainer.scrollBy({
              top: 40, // Small scroll to show user message without losing chat position
              behavior: "smooth"
            });
          } else {
            // On desktop, scroll to bottom
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: "smooth"
            });
          }
        }
        // For AI messages, adjust scroll based on device type
        else if (lastMessage?.role === 'assistant' && !lastMessage.isInitialMessage) {
          const isMobile = window.innerWidth < 1024;
          
          if (isMobile) {
            // On mobile, gentle scroll to keep AI response visible  
            chatContainer.scrollBy({
              top: 30, // Much smaller scroll to keep response in view
              behavior: "smooth"
            });
          } else {
            // On desktop, gentle scroll down
            chatContainer.scrollBy({
              top: 60,
              behavior: "smooth"
            });
          }
        }
      }
    }
  }, [messages]);

  // Handle mobile keyboard visibility to keep chat in view
  useEffect(() => {
    const handleInputFocus = () => {
      if (window.innerWidth < 1024) {
        // When keyboard appears on mobile, adjust scroll to keep chat visible
        setTimeout(() => {
          const chatElement = document.querySelector('[data-testid="chat-container"]');
          if (chatElement) {
            // Scroll to position chat optimally when keyboard is open
            chatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              window.scrollBy({ top: -100, behavior: 'smooth' });
            }, 300);
          }
        }, 300); // Wait for keyboard animation
      }
    };

    const handleInputBlur = () => {
      if (window.innerWidth < 1024) {
        // When keyboard closes, return to normal position
        setTimeout(() => {
          const chatElement = document.querySelector('[data-testid="chat-container"]');
          if (chatElement) {
            chatElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              window.scrollBy({ top: -65, behavior: 'smooth' });
            }, 300);
          }
        }, 300); // Wait for keyboard close animation
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleInputFocus);
      inputElement.addEventListener('blur', handleInputBlur);
      
      return () => {
        inputElement.removeEventListener('focus', handleInputFocus);
        inputElement.removeEventListener('blur', handleInputBlur);
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-80">
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

      <div ref={chatContainerRef} className="flex-1 mb-4 overflow-visible" data-testid="chat-messages">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} data-message-id={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary/20 rounded-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="text-white text-xs" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-dark-lighter rounded-lg px-4 py-3">
                      {message.isInitialMessage ? (
                        <div className="text-sm whitespace-pre-wrap">
                          <TypewriterText 
                            text={message.content} 
                            speed={30}
                          />
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          <TypewriterText 
                            text={message.content} 
                            speed={35}
                            enableProgressiveScroll={true}
                            onComplete={() => {
                              setCompletedTypewriterMessages(prev => new Set([...Array.from(prev), message.id]));
                              // Final scroll to show cards after typewriter completes
                              setTimeout(() => {
                                window.scrollTo({
                                  top: document.body.scrollHeight,
                                  behavior: "smooth"
                                });
                              }, 300);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {message.recommendations && message.recommendations.length > 0 && completedTypewriterMessages.has(message.id) && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-medium text-gray-300">Recommended Bonuses:</p>
                        {message.recommendations.map((bonus) => (
                          <BonusCard 
                            key={bonus.id} 
                            bonus={bonus} 
                            compact={true}
                            data-testid={`bonus-card-${bonus.id}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Zap className="text-white text-xs" />
              </div>
              <div className="bg-dark-lighter rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-400">Artemis is analyzing bonuses...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollAreaRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about bonuses..."
          className="flex-1 bg-gray-600 border-gray-400 text-white placeholder-gray-200 focus:border-primary focus:bg-gray-500 focus:placeholder-white transition-colors"
          disabled={chatMutation.isPending}
          data-testid="input-chat-message"
        />
        <Button 
          type="submit"
          disabled={!input.trim() || chatMutation.isPending}
          className="bg-primary hover:bg-primary/90 transition-colors px-4 py-2"
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
