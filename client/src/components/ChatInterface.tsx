import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BonusCard from "@/components/BonusCard";
import type { ChatMessage, ChatResponse } from "@/types";

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI bonus assistant. Tell me about your budget, location, and what games you like to play, and I'll find the best value bonuses for you!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Smooth scroll within chat area only, not the entire page
  useEffect(() => {
    if (scrollAreaRef.current && chatContainerRef.current) {
      // Scroll within the chat container, not the entire page
      const chatContainer = chatContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
            <MessageCircle className="text-white text-sm" />
          </div>
          <span className="font-medium">Bonus AI Assistant</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
          <div className="w-3 h-3 bg-accent rounded-full"></div>
        </div>
      </div>

      <ScrollArea ref={chatContainerRef} className="flex-1 mb-4" data-testid="chat-messages">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-primary/20 rounded-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle className="text-white text-xs" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-dark-lighter rounded-lg px-4 py-3">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {message.recommendations && message.recommendations.length > 0 && (
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
              <div className="w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                <MessageCircle className="text-white text-xs" />
              </div>
              <div className="bg-dark-lighter rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollAreaRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about bonuses..."
          className="flex-1 bg-dark border-dark-lighter text-white placeholder-gray-400 focus:border-primary"
          disabled={chatMutation.isPending}
          data-testid="input-chat-message"
        />
        <Button 
          type="submit"
          disabled={!input.trim() || chatMutation.isPending}
          className="bg-primary hover:bg-primary/90 transition-colors"
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
