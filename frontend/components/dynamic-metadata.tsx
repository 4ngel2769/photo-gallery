'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function DynamicMetadata() {
  const { settings } = useSettings();

  useEffect(() => {
    // Update document title
    if (settings.seoTitle) {
      document.title = settings.seoTitle;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && settings.seoDescription) {
      metaDescription.setAttribute('content', settings.seoDescription);
    } else if (settings.seoDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = settings.seoDescription;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && settings.seoKeywords) {
      metaKeywords.setAttribute('content', settings.seoKeywords);
    } else if (settings.seoKeywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = settings.seoKeywords;
      document.head.appendChild(meta);
    }

    // Update OG tags
    const updateOrCreateMeta = (property: string, content: string) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta('og:title', settings.seoTitle);
    updateOrCreateMeta('og:description', settings.seoDescription);
    if (settings.ogImage) {
      updateOrCreateMeta('og:image', settings.ogImage);
    }
    updateOrCreateMeta('og:type', 'website');

    // Update Twitter Card tags
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateTwitterMeta('twitter:card', 'summary_large_image');
    updateOrCreateTwitterMeta('twitter:title', settings.seoTitle);
    updateOrCreateTwitterMeta('twitter:description', settings.seoDescription);
    if (settings.ogImage) {
      updateOrCreateTwitterMeta('twitter:image', settings.ogImage);
    }
    if (settings.twitterHandle) {
      updateOrCreateTwitterMeta('twitter:site', settings.twitterHandle);
      updateOrCreateTwitterMeta('twitter:creator', settings.twitterHandle);
    }
  }, [settings]);

  return null;
}
