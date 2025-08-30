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
    
    // Create a map of positions where we'll add claim links
    const linkPositions: Array<{index: number, length: number, rec: Recommendation}> = [];
    
    // Find all operator mentions without overlap
    recommendations.forEach((rec) => {
      const operatorName = rec.operator.name;
      const regex = new RegExp(`\\b${operatorName}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(processedText)) !== null) {
        // Check if this position overlaps with existing positions
        const hasOverlap = linkPositions.some(pos => 
          (match!.index >= pos.index && match!.index < pos.index + pos.length) ||
          (match!.index + match![0].length > pos.index && match!.index + match![0].length <= pos.index + pos.length)
        );
        
        if (!hasOverlap) {
          linkPositions.push({
            index: match.index,
            length: match[0].length,
            rec
          });
        }
      }
    });

    // Sort positions by index (earliest first)
    linkPositions.sort((a, b) => a.index - b.index);

    // Build elements with non-overlapping links
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    linkPositions.forEach((pos, i) => {
      // Add text before this match
      if (pos.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {processedText.slice(lastIndex, pos.index)}
          </span>
        );
      }
      
      // Add operator name with claim link
      const operatorText = processedText.slice(pos.index, pos.index + pos.length);
      elements.push(
        <span key={`operator-${pos.index}`} className="inline-flex items-center gap-1">
          <span>{operatorText}</span>
          <button
            onClick={() => window.open(pos.rec.landingUrl, '_blank')}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            data-testid={`link-claim-${pos.rec.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            Claim
          </button>
        </span>
      );
      
      lastIndex = pos.index + pos.length;
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