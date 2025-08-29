import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  enableProgressiveScroll?: boolean;
}

export default function TypewriterText({ 
  text, 
  speed = 50, 
  onComplete, 
  className = "",
  enableProgressiveScroll = false
}: TypewriterTextProps) {
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
          
          // Regular scroll every 10 characters
          if (currentIndex % 10 === 0 && currentChar !== '\n') {
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
      const chatContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      if (chatContainer) {
        // Responsive scroll to keep up with typing speed
        chatContainer.scrollBy({
          top: 8, // Enough scroll to keep cursor visible
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

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}