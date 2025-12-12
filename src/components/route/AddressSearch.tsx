import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { geocodeAddress } from '@/lib/routeOptimization';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddressSearchProps {
  onSelectAddress: (lat: number, lng: number, displayName: string) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onSelectAddress }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ lat: number; lng: number; display_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await geocodeAddress(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (result: { lat: number; lng: number; display_name: string }) => {
    onSelectAddress(result.lat, result.lng, result.display_name);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading} size="icon">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <ScrollArea className="max-h-[200px] border border-border rounded-lg">
          <div className="p-1">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelect(result)}
                className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
