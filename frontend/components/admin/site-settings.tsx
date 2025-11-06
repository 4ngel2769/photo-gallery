'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { settingsAPI } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader2, Save, Eye, Heart, MessageSquare, ZoomIn, Globe, Palette } from 'lucide-react';

export function SiteSettings() {
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    showLikes: true,
    showViews: true,
    showComments: true,
    enableImageZoom: true,
    navbarTitleEnabled: true,
    navbarTitle: '',
    navbarColor: '#9333ea',
    navbarColorEnd: '#db2777',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImage: '',
    twitterHandle: '',
  });

  useEffect(() => {
    setFormData({
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      showLikes: settings.showLikes,
      showViews: settings.showViews,
      showComments: settings.showComments,
      enableImageZoom: settings.enableImageZoom,
      navbarTitleEnabled: settings.navbarTitleEnabled,
      navbarTitle: settings.navbarTitle || '',
      navbarColor: settings.navbarColor || '#9333ea',
      navbarColorEnd: settings.navbarColorEnd || '#db2777',
      seoTitle: settings.seoTitle || '',
      seoDescription: settings.seoDescription || '',
      seoKeywords: settings.seoKeywords || '',
      ogImage: settings.ogImage || '',
      twitterHandle: settings.twitterHandle || '',
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settingsAPI.update(formData);
      await refreshSettings();
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Configure basic site settings and metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="Photo Gallery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Input
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder="A beautiful photo gallery"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Control what features are visible to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <Label htmlFor="showLikes" className="text-base">Show Likes</Label>
                <p className="text-sm text-muted-foreground">Display like counts on photos</p>
              </div>
            </div>
            <Switch
              id="showLikes"
              checked={formData.showLikes}
              onCheckedChange={(checked) => handleChange('showLikes', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="showViews" className="text-base">Show Views</Label>
                <p className="text-sm text-muted-foreground">Display view counts on photos</p>
              </div>
            </div>
            <Switch
              id="showViews"
              checked={formData.showViews}
              onCheckedChange={(checked) => handleChange('showViews', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="showComments" className="text-base">Show Comments</Label>
                <p className="text-sm text-muted-foreground">Display comment counts on photos</p>
              </div>
            </div>
            <Switch
              id="showComments"
              checked={formData.showComments}
              onCheckedChange={(checked) => handleChange('showComments', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ZoomIn className="h-5 w-5 text-purple-500" />
              <div>
                <Label htmlFor="enableImageZoom" className="text-base">Enable Image Zoom</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to click on images to zoom in (magnifying glass cursor)
                </p>
              </div>
            </div>
            <Switch
              id="enableImageZoom"
              checked={formData.enableImageZoom}
              onCheckedChange={(checked) => handleChange('enableImageZoom', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navbar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Navbar Customization
          </CardTitle>
          <CardDescription>
            Customize the navigation bar appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="navbarTitleEnabled" className="text-base">Show Navbar Title</Label>
              <p className="text-sm text-muted-foreground">Display the title in the navigation bar</p>
            </div>
            <Switch
              id="navbarTitleEnabled"
              checked={formData.navbarTitleEnabled}
              onCheckedChange={(checked) => handleChange('navbarTitleEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="navbarTitle">Navbar Title</Label>
            <Input
              id="navbarTitle"
              value={formData.navbarTitle}
              onChange={(e) => handleChange('navbarTitle', e.target.value)}
              placeholder="Photo Gallery"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="navbarColor">Gradient Start Color</Label>
              <div className="flex gap-2">
                <Input
                  id="navbarColor"
                  type="color"
                  value={formData.navbarColor}
                  onChange={(e) => handleChange('navbarColor', e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={formData.navbarColor}
                  onChange={(e) => handleChange('navbarColor', e.target.value)}
                  placeholder="#9333ea"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="navbarColorEnd">Gradient End Color</Label>
              <div className="flex gap-2">
                <Input
                  id="navbarColorEnd"
                  type="color"
                  value={formData.navbarColorEnd}
                  onChange={(e) => handleChange('navbarColorEnd', e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={formData.navbarColorEnd}
                  onChange={(e) => handleChange('navbarColorEnd', e.target.value)}
                  placeholder="#db2777"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${formData.navbarColor}, ${formData.navbarColorEnd})`
              }}
            >
              {formData.navbarTitle || 'Photo Gallery'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO & Metadata
          </CardTitle>
          <CardDescription>
            Optimize your site for search engines and social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={formData.seoTitle}
              onChange={(e) => handleChange('seoTitle', e.target.value)}
              placeholder="Photo Gallery - Beautiful Photography"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {formData.seoTitle.length}/60 characters (optimal: 50-60)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              placeholder="Discover stunning photography in our beautiful gallery"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {formData.seoDescription.length}/160 characters (optimal: 150-160)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoKeywords">SEO Keywords</Label>
            <Input
              id="seoKeywords"
              value={formData.seoKeywords}
              onChange={(e) => handleChange('seoKeywords', e.target.value)}
              placeholder="photography, gallery, photos, images, art"
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="ogImage">Open Graph Image URL</Label>
            <Input
              id="ogImage"
              value={formData.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Image shown when shared on social media (recommended: 1200x630px)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterHandle">Twitter Handle</Label>
            <Input
              id="twitterHandle"
              value={formData.twitterHandle}
              onChange={(e) => handleChange('twitterHandle', e.target.value)}
              placeholder="@yourusername"
            />
            <p className="text-xs text-muted-foreground">
              Your Twitter username for Twitter Card metadata
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
