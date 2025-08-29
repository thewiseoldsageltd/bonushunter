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
        
        // Trigger progressive scroll to follow typing
        if (enableProgressiveScroll && currentIndex % 30 === 0) {
          setShouldScroll(prev => prev + 1);
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
        // Gentle but consistent scroll to follow typing
        chatContainer.scrollBy({
          top: 8, // Small, consistent scroll amount
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