"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3x3, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import { PhotoCard } from '@/components/photo-card';
import { PhotoDialog } from '@/components/photo-dialog';
import { AuthProvider } from '@/contexts/AuthContext';
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [mood, setMood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [gridSize, setGridSize] = useState<'small' | 'large'>('small');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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
      const params: any = {
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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Photo Gallery
              </h1>
            </motion.div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
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

              {/* Grid Size Toggle */}
              <div className="flex gap-1">
                <Button
                  variant={gridSize === 'small' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setGridSize('small')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridSize === 'large' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setGridSize('large')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <main className="container mx-auto px-4 py-8">
          {loading && photos.length === 0 ? (
            <div className={`grid gap-6 ${
              gridSize === 'small' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
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
              <div className={`grid gap-6 ${
                gridSize === 'small' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo._id}
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                    isLiked={likedPhotos.has(photo._id)}
                  />
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

