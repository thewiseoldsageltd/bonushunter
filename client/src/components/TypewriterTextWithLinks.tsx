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

    // Typing complete - add claim links at end of offer lines
    let processedText = displayText;
    
    // Split text into lines and add claim links at end of relevant offer lines
    const lines = processedText.split('\n');
    const processedLines: JSX.Element[] = [];

    lines.forEach((line, lineIndex) => {
      let lineContent = line;
      let claimButton: JSX.Element | null = null;

      // Check if this line mentions an operator and contains offer details
      const relevantRec = recommendations.find(rec => {
        const operatorName = rec.operator.name;
        const hasOperator = new RegExp(`\\b${operatorName}\\b`, 'i').test(line);
        const hasOfferInfo = /(\$|bet|bonus|value score|excellent|wagering)/i.test(line);
        return hasOperator && hasOfferInfo;
      });

      if (relevantRec) {
        claimButton = (
          <button
            key={`claim-${lineIndex}`}
            onClick={() => window.open(relevantRec.landingUrl, '_blank')}
            className="inline-flex items-center gap-1 ml-2 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            data-testid={`link-claim-${relevantRec.id}`}
          >
            <ExternalLink className="w-3 h-3" />
            Claim
          </button>
        );
      }

      // Enhanced value score display
      const valueScoreMatch = line.match(/Value score[:\s]*(\d+(?:\.\d+)?\/\d+(?:\.\d+)?|\d+(?:\.\d+)?)/i);
      if (valueScoreMatch) {
        const scoreText = valueScoreMatch[1];
        const [score, maxScore] = scoreText.includes('/') ? scoreText.split('/') : [scoreText, '100'];
        const numericScore = parseFloat(score);
        
        // Replace the value score text with enhanced version
        lineContent = line.replace(
          valueScoreMatch[0],
          ''
        );
        
        processedLines.push(
          <div key={lineIndex} className="flex items-center justify-between">
            <span>{lineContent}</span>
            <div className="inline-flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-md">
                <span className="text-xs text-gray-400">Value Score:</span>
                <span className={`font-bold text-sm ${
                  numericScore >= 80 ? 'text-green-400' : 
                  numericScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {scoreText}
                </span>
              </div>
              {claimButton}
            </div>
          </div>
        );
      } else {
        processedLines.push(
          <span key={lineIndex}>
            {lineContent}
            {claimButton}
            {lineIndex < lines.length - 1 && '\n'}
          </span>
        );
      }
    });

    return processedLines;
  };

  return (
    <span className={className}>
      {renderTextWithLinks()}
    </span>
  );
}