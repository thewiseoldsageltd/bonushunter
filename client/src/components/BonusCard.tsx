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

  const getIconFromLogo = (logo: string | null) => {
    // If there's an uploaded logo (starts with /public-objects/), show it as an image
    if (logo && logo.startsWith('/public-objects/')) {
      return (
        <img 
          src={logo} 
          alt={`${bonus.operator.name} logo`}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling!.style.display = 'block';
          }}
        />
      );
    }
    
    // Fallback to emoji icons
    if (!logo) return '🎯';
    if (logo.includes('draftkings') || logo.includes('crown')) return '👑';
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
        <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-white rounded-xl overflow-hidden flex items-center justify-center`}>
          {bonus.operator.logo && bonus.operator.logo.startsWith('/public-objects/') ? (
            <img 
              src={(() => {
                // Use Replit backend in production, relative URLs in development
                const BACKEND_URL = import.meta.env.PROD 
                  ? 'https://def70970-e455-49b3-94a8-84862a055de9-00-1os3u94dmcw5t.picard.replit.dev'
                  : '';
                return `${BACKEND_URL}${bonus.operator.logo}`;
              })()} 
              alt={`${bonus.operator.name} logo`}
              className="w-full h-full object-contain"
              onLoad={(e) => {
                console.log(`✅ LOGO LOADED: ${bonus.operator.name}`);
              }}
              onError={(e) => {
                console.log(`❌ Logo failed: ${bonus.operator.name} - ${e.currentTarget.src}`);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-lg text-white">{getIconFromLogo(bonus.operator.logo)}</span>
            </div>
          )}
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
      
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-display font-semibold ${compact ? 'text-lg' : 'text-xl'}`} data-testid={`text-operator-name-${bonus.id}`}>
          {bonus.operator.name}
        </h3>
        {bonus.existingUserEligible === true ? (
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            👥 Existing Users
          </div>
        ) : (
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            🎁 New Users
          </div>
        )}
      </div>
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
