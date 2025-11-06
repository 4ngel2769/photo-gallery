'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsAPI } from '@/lib/api';

interface SocialLinks {
  instagram?: string;
  pixabay?: string;
  pexels?: string;
}

interface Settings {
  siteName: string;
  siteDescription: string;
  showLikes: boolean;
  showViews: boolean;
  showComments: boolean;
  enableImageZoom: boolean;
  navbarTitleEnabled: boolean;
  navbarTitle: string;
  navbarColor: string;
  navbarColorEnd: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage?: string;
  twitterHandle?: string;
  socialLinks: SocialLinks;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  siteName: 'Photo Gallery',
  siteDescription: 'A beautiful photo gallery',
  showLikes: true,
  showViews: true,
  showComments: true,
  enableImageZoom: true,
  navbarTitleEnabled: true,
  navbarTitle: 'Photo Gallery',
  navbarColor: '#000000',
  navbarColorEnd: '#1a1a1a',
  seoTitle: 'Photo Gallery',
  seoDescription: 'A beautiful photo gallery to showcase your photography',
  seoKeywords: 'photography, gallery, photos',
  socialLinks: {},
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
