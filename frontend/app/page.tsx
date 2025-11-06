"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { PhotoCard } from '@/components/photo-card';
import { PhotoDialog } from '@/components/photo-dialog';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { photosAPI } from '@/lib/api';
import { debounce, getSessionId } from '@/lib/utils-app';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  likes: number;
  views: number;
  location?: string;
  category?: string;
  mood?: string;
  dateTaken?: string;
  tags?: string[];
  camera?: {
    type?: string;
    model?: string;
    brand?: string;
  };
  resolution?: {
    width: number;
    height: number;
  };
}

export default function Home() {
  const { settings } = useSettings();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [mood, setMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [columns, setColumns] = useState<number>(3);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);

  // Adjust columns based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1); // mobile
      } else if (width < 768) {
        setColumns(Math.min(columns, 2)); // small tablet
      } else if (width < 1024) {
        setColumns(Math.min(columns, 3)); // tablet
      } else if (width < 1280) {
        setColumns(Math.min(columns, 4)); // desktop
      }
      // 5 columns allowed on xl screens and above
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columns]);

  useEffect(() => {
    loadPhotos(true);
  }, [category, mood, sortBy]);

  useEffect(() => {
    if (photos.length > 0) {
      const sessionId = getSessionId();
      checkLikedPhotos(sessionId);
    }
  }, [photos]);

  const loadPhotos = async (isNewSearch = false) => {
    if (!hasMore && !isNewSearch) return;
    
    setLoading(true);
    try {
      const params: {
        page?: number;
        limit?: number;
        sort?: string;
        category?: string;
        mood?: string;
        search?: string;
      } = {
        page: isNewSearch ? 1 : page,
        limit: 12,
        sort: sortBy
      };

      if (category !== 'all') params.category = category;
      if (mood !== 'all') params.mood = mood;
      if (searchQuery) params.search = searchQuery;

      const response = await photosAPI.getAll(params);
      
      if (isNewSearch) {
        setPhotos(response.data.photos);
        setPage(2);
      } else {
        setPhotos((prev) => [...prev, ...response.data.photos]);
        setPage((p) => p + 1);
      }
      
      setHasMore(response.data.pagination.hasMore);
    } catch (error) {
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const checkLikedPhotos = async (sessionId: string) => {
    const liked = new Set<string>();
    for (const photo of photos) {
      try {
        const response = await photosAPI.getLikeStatus(photo._id, sessionId);
        if (response.data.isLiked) {
          liked.add(photo._id);
        }
      } catch (error) {
        // Ignore errors
      }
    }
    setLikedPhotos(liked);
  };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    setPage(1);
    loadPhotos(true);
  }, 500);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {settings.navbarTitleEnabled && (
                <h1 
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${settings.navbarColor}, ${settings.navbarColorEnd})`
                  }}
                >
                  {settings.navbarTitle}
                </h1>
              )}
            </motion.div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Toggle Button */}
            <div className="lg:hidden flex justify-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
                className="gap-2"
              >
                Filters
                <motion.div
                  animate={{ rotate: isToolbarExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>

            {/* Desktop View - Always Visible */}
            <div className="hidden lg:block">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search photos..."
                    className="pl-9"
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="wildlife">Wildlife</SelectItem>
                    <SelectItem value="street">Street</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mood Filter */}
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moods</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="serene">Serene</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                    <SelectItem value="moody">Moody</SelectItem>
                    <SelectItem value="dreamy">Dreamy</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Columns Slider */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Label htmlFor="columns" className="text-sm whitespace-nowrap">
                    Columns: {columns}
                  </Label>
                  <Slider
                    id="columns"
                    min={1}
                    max={5}
                    step={1}
                    value={[columns]}
                    onValueChange={(value) => setColumns(value[0])}
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Mobile View - Collapsible */}
            <AnimatePresence>
              {isToolbarExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="lg:hidden overflow-hidden"
                >
                  <div className="flex flex-col gap-4 pt-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search photos..."
                        className="pl-9"
                        onChange={(e) => debouncedSearch(e.target.value)}
                      />
                    </div>

                    {/* Bottom row with pickers and slider */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Category Filter */}
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="wildlife">Wildlife</SelectItem>
                          <SelectItem value="street">Street</SelectItem>
                          <SelectItem value="architecture">Architecture</SelectItem>
                          <SelectItem value="nature">Nature</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Mood Filter */}
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Moods</SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="serene">Serene</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="moody">Moody</SelectItem>
                          <SelectItem value="dreamy">Dreamy</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sort */}
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="likes">Most Liked</SelectItem>
                          <SelectItem value="views">Most Viewed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Columns Slider */}
                    <div className="flex items-center gap-3">
                      <Label htmlFor="columns-mobile" className="text-sm whitespace-nowrap">
                        Columns: {columns}
                      </Label>
                      <Slider
                        id="columns-mobile"
                        min={1}
                        max={5}
                        step={1}
                        value={[columns]}
                        onValueChange={(value) => setColumns(value[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Photo Grid */}
        <main className="container mx-auto px-4 py-8">
          {loading && photos.length === 0 ? (
            <div 
              className="gap-4 space-y-4"
              style={{ 
                columnCount: columns,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <Skeleton className="aspect-3/4 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-2xl font-semibold text-muted-foreground mb-2">
                No photos found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div 
                className="gap-4"
                style={{ 
                  columnCount: columns,
                }}
              >
                {photos.map((photo) => (
                  <div key={photo._id} className="break-inside-avoid mb-4">
                    <PhotoCard
                      photo={photo}
                      onClick={() => setSelectedPhoto(photo)}
                      isLiked={likedPhotos.has(photo._id)}
                    />
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={() => loadPhotos()}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    {loading ? 'Loading...' : 'Load More Photos'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Photo Detail Dialog */}
        <PhotoDialog
          photo={selectedPhoto}
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />

        {/* Footer */}
        <footer className="border-t py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2024 Photo Gallery. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

