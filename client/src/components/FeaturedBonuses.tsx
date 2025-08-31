import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BonusCard from "./BonusCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/hooks/useRegion";
import type { BonusRecommendation } from "@/types";

export default function FeaturedBonuses() {
  const [productType, setProductType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const { currentRegion } = useRegion();

  // Construct query string for filtering
  const queryString = (() => {
    const params = new URLSearchParams();
    if (productType !== "all") params.append("productType", productType);
    if (location !== "all") params.append("location", location);
    // Add region parameter to ensure bonuses match the selected region
    if (currentRegion?.regionCode) params.append("region", currentRegion.regionCode);
    return params.toString() ? `?${params.toString()}` : '';
  })();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/bonuses", productType, location, currentRegion?.regionCode],
    select: (data: any) => ({
      ...data,
      bonuses: data.bonuses.map((bonus: any) => ({
        id: bonus.id,
        operator: bonus.operator,
        title: bonus.title,
        description: bonus.description,
        valueScore: bonus.valueScore,
        rationale: `Value score: ${bonus.valueScore}/100`,
        matchPercent: bonus.matchPercent,
        maxBonus: bonus.maxBonus,
        minDeposit: bonus.minDeposit,
        wageringRequirement: bonus.wageringRequirement,
        expiryDays: bonus.expiryDays,
        landingUrl: bonus.landingUrl,
        productType: bonus.productType,
        existingUserEligible: bonus.existingUserEligible
      }))
    })
  });

  if (error) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display font-bold text-3xl mb-4">Top-Rated Bonuses</h2>
            <div className="bg-dark-light/50 rounded-2xl p-8 border border-dark-lighter">
              <p className="text-red-400 mb-4">Failed to load bonuses</p>
              <p className="text-gray-400 text-sm">
                {error?.message || 'Unable to fetch bonus data. Please try refreshing the page.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">Top-Rated Bonuses</h2>
            <p className="text-xl text-gray-300">
              Discover the highest-value offers analyzed by our AI
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger className="bg-dark-light border-dark-lighter text-white" data-testid="select-product-type">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border-dark-lighter">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="casino">Casino</SelectItem>
                <SelectItem value="sportsbook">Sportsbook</SelectItem>
                <SelectItem value="poker">Poker</SelectItem>
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-dark-light border-dark-lighter text-white" data-testid="select-location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-dark-light border-dark-lighter">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-dark-light/50 rounded-2xl border border-dark-lighter p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-dark-lighter" />
                  <div className="text-right">
                    <Skeleton className="w-16 h-6 mb-2 bg-dark-lighter" />
                    <Skeleton className="w-20 h-4 bg-dark-lighter" />
                  </div>
                </div>
                <Skeleton className="w-full h-6 mb-2 bg-dark-lighter" />
                <Skeleton className="w-3/4 h-4 mb-6 bg-dark-lighter" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="w-full h-4 bg-dark-lighter" />
                  <Skeleton className="w-full h-4 bg-dark-lighter" />
                  <Skeleton className="w-full h-4 bg-dark-lighter" />
                </div>
                <Skeleton className="w-full h-10 bg-dark-lighter" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="bonuses-grid">
              {data?.bonuses?.map((bonus: BonusRecommendation) => (
                <BonusCard 
                  key={bonus.id} 
                  bonus={bonus}
                  data-testid={`featured-bonus-card-${bonus.id}`}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                variant="outline"
                className="bg-dark-light hover:bg-dark-lighter border-dark-lighter hover:border-gray-400 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                data-testid="button-view-all-bonuses"
              >
                View All Bonuses
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
