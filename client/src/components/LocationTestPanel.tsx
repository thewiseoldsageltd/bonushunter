import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, MapPin } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface LocationTestPanelProps {
  onClose: () => void;
  onLocationChange: (region: string, state?: string) => void;
}

export default function LocationTestPanel({ onClose, onLocationChange }: LocationTestPanelProps) {
  const [testRegion, setTestRegion] = useState<string>("");
  const [testState, setTestState] = useState<string>("");

  const testLocations = [
    { label: "🇺🇸 New York, US", region: "US", state: "NY" },
    { label: "🇺🇸 New Jersey, US", region: "US", state: "NJ" },
    { label: "🇺🇸 Pennsylvania, US", region: "US", state: "PA" },
    { label: "🇺🇸 Michigan, US", region: "US", state: "MI" },
    { label: "🇺🇸 Illinois, US", region: "US", state: "IL" },
    { label: "🇺🇸 California, US", region: "US", state: "CA" },
    { label: "🇬🇧 United Kingdom", region: "UK", state: undefined },
    { label: "🇨🇦 Ontario, Canada", region: "CA", state: "ON" },
    { label: "🇨🇦 Alberta, Canada", region: "CA", state: "AB" },
    { label: "🇨🇦 British Columbia, Canada", region: "CA", state: "BC" },
  ];

  const handleApply = () => {
    if (testRegion) {
      const location = testLocations.find(loc => 
        loc.region === testRegion && loc.state === testState
      );
      if (location) {
        // Store in sessionStorage for persistence
        sessionStorage.setItem('test_location', JSON.stringify({
          region: location.region,
          state: location.state
        }));
        
        // Invalidate React Query caches to refetch with new test location
        queryClient.invalidateQueries({ queryKey: ['/api/region-config'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
        
        onLocationChange(location.region, location.state);
      }
    }
  };

  const handleClear = () => {
    sessionStorage.removeItem('test_location');
    setTestRegion("");
    setTestState("");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-500 rounded-2xl shadow-2xl p-6 w-80 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="text-purple-300" size={20} />
          <h3 className="font-semibold text-white">Location Test Mode</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-purple-300 hover:text-white hover:bg-purple-800"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-purple-200 mb-2 block">Simulate Location:</label>
          <Select 
            value={testRegion && testState ? `${testRegion}-${testState}` : testRegion}
            onValueChange={(value) => {
              const location = testLocations.find(loc => {
                const key = loc.state ? `${loc.region}-${loc.state}` : loc.region;
                return key === value;
              });
              if (location) {
                setTestRegion(location.region);
                setTestState(location.state || "");
              }
            }}
          >
            <SelectTrigger className="bg-purple-950 border-purple-700 text-white">
              <SelectValue placeholder="Choose test location..." />
            </SelectTrigger>
            <SelectContent className="bg-purple-950 border-purple-700 text-white">
              {testLocations.map((loc) => {
                const key = loc.state ? `${loc.region}-${loc.state}` : loc.region;
                return (
                  <SelectItem key={key} value={key}>
                    {loc.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleApply}
            disabled={!testRegion}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Apply
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="flex-1 border-purple-500 text-purple-200 hover:bg-purple-800 hover:text-white"
          >
            Clear
          </Button>
        </div>

        <p className="text-xs text-purple-300 text-center">
          Press <kbd className="px-1 py-0.5 bg-purple-800 rounded">Ctrl+Shift+L</kbd> to toggle
        </p>
      </div>
    </div>
  );
}
