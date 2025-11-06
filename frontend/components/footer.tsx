'use client';

import { useEffect, useState } from 'react';
import { Instagram, Camera, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { settingsAPI } from '@/lib/api';

interface SocialLinks {
  instagram?: string;
  pixabay?: string;
  pexels?: string;
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [siteName, setSiteName] = useState('Photo Gallery');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        if (response.data) {
          setSocialLinks(response.data.socialLinks || {});
          setSiteName(response.data.siteName || 'Photo Gallery');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} {siteName}. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.instagram && (
              <Link
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            )}
            
            {socialLinks.pixabay && (
              <Link
                href={socialLinks.pixabay}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Pixabay"
              >
                <Camera className="h-5 w-5" />
              </Link>
            )}
            
            {socialLinks.pexels && (
              <Link
                href={socialLinks.pexels}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Pexels"
              >
                <ImageIcon className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
