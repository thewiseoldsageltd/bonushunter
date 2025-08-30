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

  // Track which offers have been completed during typing
  const getCompletedOffers = () => {
    const completedOffers: Array<{operatorName: string, rec: Recommendation}> = [];
    
    // Find offer sections that are fully typed based on current progress
    recommendations.forEach(rec => {
      const operatorName = rec.operator.name;
      const operatorRegex = new RegExp(`\\b${operatorName}\\b.*?(?=\\n\\s*-|\\n\\n|$)`, 'gis');
      const matches = Array.from(text.matchAll(operatorRegex));
      
      matches.forEach(match => {
        const offerEndIndex = match.index! + match[0].length;
        if (currentIndex >= offerEndIndex) {
          completedOffers.push({operatorName, rec});
        }
      });
    });
    
    return completedOffers;
  };

  // Parse text and insert claim links
  const renderTextWithLinks = () => {
    let processedText = displayText;
    const elements: JSX.Element[] = [];
    const completedOffers = getCompletedOffers();
    const isFullyTyped = currentIndex >= text.length;

    // If still typing, show progressive enhancement
    if (!isFullyTyped) {
      // Add completed offer enhancements to current display text
      completedOffers.forEach(({operatorName, rec}) => {
        // Find value score pattern in the completed section
        const valueScoreRegex = new RegExp(`(${operatorName}.*?)Value score[:\\s]*(\\d+(?:\\.\\d+)?(?:/\\d+(?:\\.\\d+)?)?|\\d+(?:\\.\\d+)?)([^\\n]*)`, 'gi');
        
        processedText = processedText.replace(valueScoreRegex, (match, beforeScore, scoreText, afterScore) => {
          const [score] = scoreText.includes('/') ? scoreText.split('/') : [scoreText, '100'];
          const numericScore = parseFloat(score);
          
          return `${beforeScore}Value Score: <span class="font-bold ${
            numericScore >= 80 ? 'text-green-400' : 
            numericScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
          }">${scoreText}</span>${afterScore} <button class="inline-flex items-center gap-1 ml-2 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors" onclick="window.open('${rec.landingUrl}', '_blank')" data-testid="link-claim-${rec.id}"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>Claim</button>`;
        });
      });

      return (
        <span dangerouslySetInnerHTML={{
          __html: processedText + '<span class="animate-pulse">|</span>'
        }} />
      );
    }

    // Fully typed - clean up and add proper React elements
    const lines = processedText.split('\n');
    
    lines.forEach((line, lineIndex) => {
      let lineContent = line;
      let enhancements: JSX.Element[] = [];

      // Find relevant recommendation for this line
      const relevantRec = recommendations.find(rec => {
        const operatorName = rec.operator.name;
        const hasOperator = new RegExp(`\\b${operatorName}\\b`, 'i').test(line);
        const hasOfferInfo = /(\$|bet|bonus|value score|excellent|wagering)/i.test(line);
        return hasOperator && hasOfferInfo;
      });

      // Enhanced value score display
      const valueScoreMatch = line.match(/Value score[:\s]*(\d+(?:\.\d+)?\/\d+(?:\.\d+)?|\d+(?:\.\d+)?)/i);
      if (valueScoreMatch && relevantRec) {
        const scoreText = valueScoreMatch[1];
        const [score] = scoreText.includes('/') ? scoreText.split('/') : [scoreText, '100'];
        const numericScore = parseFloat(score);
        
        // Replace value score with enhanced inline version
        lineContent = line.replace(
          valueScoreMatch[0],
          `Value Score: `
        );
        
        enhancements.push(
          <span key={`score-${lineIndex}`} className={`font-bold ${
            numericScore >= 80 ? 'text-green-400' : 
            numericScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
          }`}>
            {scoreText}
          </span>
        );

        if (relevantRec) {
          enhancements.push(
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
      }

      elements.push(
        <span key={lineIndex}>
          {lineContent}
          {enhancements}
          {lineIndex < lines.length - 1 && '\n'}
        </span>
      );
    });

    return elements;
  };

  return (
    <span className={className}>
      {renderTextWithLinks()}
    </span>
  );
}