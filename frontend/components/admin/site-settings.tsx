'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { settingsAPI } from '@/lib/api';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader2, Save, Eye, Heart, MessageSquare, ZoomIn } from 'lucide-react';

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
  });

  useEffect(() => {
    setFormData({
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      showLikes: settings.showLikes,
      showViews: settings.showViews,
      showComments: settings.showComments,
      enableImageZoom: settings.enableImageZoom,
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
