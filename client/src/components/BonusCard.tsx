import { Button } from "@/components/ui/button";
import { Heart, Star, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { BonusRecommendation } from "@/types";

interface BonusCardProps {
  bonus: BonusRecommendation;
  compact?: boolean;
  showFavorite?: boolean;
  "data-testid"?: string;
}

export default function BonusCard({ 
  bonus, 
  compact = false, 
  showFavorite = true,
  "data-testid": testId 
}: BonusCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite API call
  };

  const handleClaim = () => {
    window.open(bonus.landingUrl, '_blank');
  };

  const getStarRating = (score: number) => {
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'fill-secondary text-secondary' : 'text-gray-600'}`} 
      />
    ));
  };

  const getIconFromLogo = (logo: string) => {
    if (logo.includes('dice')) return '🎲';
    if (logo.includes('spade')) return '♠️';
    if (logo.includes('football')) return '🏈';
    return '🎯';
  };

  return (
    <div 
      className={`bg-dark-light/50 backdrop-blur-lg border border-dark-lighter rounded-2xl ${
        compact ? 'p-4' : 'p-6'
      } hover:border-primary/50 transition-all group`}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center`}>
          <span className="text-lg">{getIconFromLogo(bonus.operator.logo)}</span>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-accent`} data-testid={`text-value-score-${bonus.id}`}>
              {bonus.valueScore}
            </span>
            <span className="text-sm text-gray-400">Value Score</span>
          </div>
          <div className="flex">
            {getStarRating(bonus.valueScore)}
          </div>
        </div>
      </div>
      
      <h3 className={`font-display font-semibold ${compact ? 'text-lg' : 'text-xl'} mb-2`} data-testid={`text-operator-name-${bonus.id}`}>
        {bonus.operator.name}
      </h3>
      <p className="text-gray-300 mb-4" data-testid={`text-bonus-title-${bonus.id}`}>
        {bonus.title}
      </p>
      
      {!compact && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Wagering:</span>
            <span className="text-white" data-testid={`text-wagering-${bonus.id}`}>
              {bonus.wageringRequirement}x
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valid for:</span>
            <span className="text-white" data-testid={`text-expiry-${bonus.id}`}>
              {bonus.expiryDays} days
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Min deposit:</span>
            <span className="text-white" data-testid={`text-min-deposit-${bonus.id}`}>
              ${bonus.minDeposit}
            </span>
          </div>
          {bonus.rationale && (
            <div className="mt-3 p-3 bg-dark/50 rounded-lg">
              <p className="text-xs text-gray-300" data-testid={`text-rationale-${bonus.id}`}>
                {bonus.rationale}
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button 
          onClick={handleClaim}
          className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
          data-testid={`button-claim-${bonus.id}`}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Claim Bonus
        </Button>
        {showFavorite && (
          <Button 
            onClick={handleFavorite}
            variant="outline"
            className="border-dark-lighter hover:border-gray-400 transition-colors"
            data-testid={`button-favorite-${bonus.id}`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
