"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, MapPin, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils-app';
import { useSettings } from '@/contexts/SettingsContext';

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
  const { settings } = useSettings();

  const API_URL = process.env.NEXT_PUBLIC_APP_URL_BACKEND ? `${process.env.NEXT_PUBLIC_APP_URL_BACKEND}/api` : 'http://localhost:5000/api';
  const imageUrl = photo.imageUrl.startsWith('http') 
    ? photo.imageUrl 
    : `${API_URL.replace('/api', '')}${photo.imageUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer w-full"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 p-0">
        <div className="relative w-full bg-muted">
          {!imageLoaded && (
            <div className="w-full aspect-4/3 animate-pulse bg-muted" />
          )}
          
          <motion.img
            src={imageUrl}
            alt={photo.title}
            className={cn(
              "w-full h-auto block transition-all duration-500",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
              "group-hover:scale-105"
            )}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay - now covers entire image */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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
                {settings.showLikes && (
                  <div className="flex items-center gap-1.5">
                    <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                    <span>{photo.likes}</span>
                  </div>
                )}
                {settings.showViews && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{photo.views}</span>
                  </div>
                )}
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
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
