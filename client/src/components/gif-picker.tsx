import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GifResult {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trending, setTrending] = useState<GifResult[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const endpoint = searchQuery.trim()
        ? `/api/gifs/search?q=${encodeURIComponent(searchQuery.trim())}&limit=20`
        : `/api/gifs/trending?limit=20`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const gifs: GifResult[] = (data.results || []).map((g: any) => ({
          id: g.id,
          url: g.url,
          preview: g.preview,
          width: g.width || 200,
          height: g.height || 200,
        }));
        if (searchQuery.trim()) {
          setResults(gifs);
        } else {
          setTrending(gifs);
        }
      }
    } catch (err) {
      console.error("GIF fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGifs("");
  }, [fetchGifs]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    if (query.trim()) {
      searchTimeout.current = setTimeout(() => {
        fetchGifs(query);
      }, 400);
    } else {
      setResults([]);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, fetchGifs]);

  const displayGifs = query.trim() ? results : trending;

  return (
    <div className="border border-border rounded-lg bg-background shadow-lg overflow-hidden" data-testid="gif-picker">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <span className="text-sm font-normal text-foreground pl-1">GIFs</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} data-testid="button-close-gif">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="pl-8 h-8 text-sm bg-muted"
            autoFocus
            data-testid="input-gif-search"
          />
        </div>
      </div>
      <ScrollArea className="h-[250px]">
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : displayGifs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {query.trim() ? "No GIFs found" : "Loading trending GIFs..."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {displayGifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => onSelect(gif.url)}
                  className="relative rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                  data-testid={`gif-item-${gif.id}`}
                >
                  <img
                    src={gif.preview || gif.url}
                    alt="GIF"
                    className="w-full h-[100px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="px-2 py-1.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">Powered by Tenor</p>
      </div>
    </div>
  );
}
