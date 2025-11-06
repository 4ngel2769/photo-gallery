"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils-app';

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
}

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  isLiked?: boolean;
}

export function PhotoCard({ photo, onClick, isLiked = false }: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_URL.replace('/api', '')}${photo.imageUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          
          <motion.img
            src={imageUrl}
            alt={photo.title}
            className={cn(
              "h-full w-full object-cover transition-all duration-500",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
              "group-hover:scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Mood badge */}
          {photo.mood && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 left-3"
            >
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                {photo.mood}
              </Badge>
            </motion.div>
          )}

          {/* Category badge */}
          {photo.category && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 right-3"
            >
              <Badge className="backdrop-blur-sm">
                {photo.category}
              </Badge>
            </motion.div>
          )}

          {/* Stats overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg line-clamp-1">
                {photo.title}
              </h3>
              
              {photo.description && (
                <p className="text-sm text-white/80 line-clamp-2">
                  {photo.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                  <span>{photo.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{photo.views}</span>
                </div>
              </div>

              {(photo.location || photo.dateTaken) && (
                <div className="flex flex-col gap-1 text-xs text-white/70">
                  {photo.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                  {photo.dateTaken && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(photo.dateTaken)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
