import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface Recommendation {
  id: string;
  operator: {
    name: string;
  };
  landingUrl: string;
  title: string;
}

interface TypewriterTextWithLinksProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  enableProgressiveScroll?: boolean;
  recommendations?: Recommendation[];
}

export default function TypewriterTextWithLinks({ 
  text, 
  speed = 50, 
  onComplete, 
  className = "",
  enableProgressiveScroll = false,
  recommendations = []
}: TypewriterTextWithLinksProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Trigger progressive scroll with smart paragraph handling
        if (enableProgressiveScroll) {
          const currentChar = text[currentIndex];
          const prevChar = currentIndex > 0 ? text[currentIndex - 1] : '';
          
          // Regular scroll every 5 characters
          if (currentIndex % 5 === 0 && currentChar !== '\n') {
            setShouldScroll(prev => prev + 1);
          }
          
          // Extra scroll compensation for paragraph breaks
          if (prevChar === '\n' && currentChar === '\n') {
            // We just created a paragraph break, add extra scroll
            setTimeout(() => setShouldScroll(prev => prev + 1), 100);
          }
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, enableProgressiveScroll]);

  // Progressive scroll effect - follow typing cursor
  useEffect(() => {
    if (enableProgressiveScroll && shouldScroll > 0) {
      // Find the chat container and scroll within it
      const chatContainer = document.querySelector('[data-testid="chat-messages"]');
      if (chatContainer) {
        chatContainer.scrollBy({
          top: 15, // More aggressive scroll for better tracking
          behavior: 'smooth'
        });
      }
    }
  }, [shouldScroll, enableProgressiveScroll]);

  useEffect(() => {
    // Reset when text changes
    setDisplayText("");
    setCurrentIndex(0);
    setShouldScroll(0);
  }, [text]);

  // Parse text and insert claim links
  const renderTextWithLinks = () => {
    if (currentIndex < text.length) {
      // Still typing - show current text with cursor
      return (
        <>
          {displayText}
          <span className="animate-pulse">|</span>
        </>
      );
    }

    // Typing complete - add claim links
    let processedText = displayText;
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    // Find operator mentions and add claim buttons
    recommendations.forEach((rec) => {
      const operatorName = rec.operator.name;
      const regex = new RegExp(`\\b${operatorName}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(processedText)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          elements.push(
            <span key={`text-${lastIndex}`}>
              {processedText.slice(lastIndex, match.index)}
            </span>
          );
        }
        
        // Add operator name with claim link
        elements.push(
          <span key={`operator-${match.index}`} className="inline-flex items-center gap-1">
            <span>{match[0]}</span>
            <button
              onClick={() => window.open(rec.landingUrl, '_blank')}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              data-testid={`link-claim-${rec.id}`}
            >
              <ExternalLink className="w-3 h-3" />
              Claim
            </button>
          </span>
        );
        
        lastIndex = match.index + match[0].length;
      }
    });

    // Add remaining text
    if (lastIndex < processedText.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {processedText.slice(lastIndex)}
        </span>
      );
    }

    return elements.length > 0 ? elements : displayText;
  };

  return (
    <span className={className}>
      {renderTextWithLinks()}
    </span>
  );
}