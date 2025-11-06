'use client';

import { useState, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { photosAPI } from '@/lib/api';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';

interface PhotoUploadProps {
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export const PhotoUpload = forwardRef<HTMLInputElement, PhotoUploadProps>(({ fileInputRef }, ref) => {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    mood: '',
    cameraBrand: '',
    cameraModel: '',
    cameraType: '',
    location: '',
    dateTaken: '',
    width: '',
    height: '',
    tags: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setSuccess(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess(false);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      uploadFormData.append('title', formData.title);
      
      if (formData.description) uploadFormData.append('description', formData.description);
      if (formData.category) uploadFormData.append('category', formData.category);
      if (formData.mood) uploadFormData.append('mood', formData.mood);
      if (formData.cameraBrand) uploadFormData.append('cameraBrand', formData.cameraBrand);
      if (formData.cameraModel) uploadFormData.append('cameraModel', formData.cameraModel);
      if (formData.cameraType) uploadFormData.append('cameraType', formData.cameraType);
      if (formData.location) uploadFormData.append('location', formData.location);
      if (formData.dateTaken) uploadFormData.append('dateTaken', formData.dateTaken);
      if (formData.width) uploadFormData.append('width', formData.width);
      if (formData.height) uploadFormData.append('height', formData.height);
      
      // Convert comma-separated tags to JSON array
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        uploadFormData.append('tags', JSON.stringify(tagsArray));
      }

      await photosAPI.create(uploadFormData);
      
      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        mood: '',
        cameraBrand: '',
        cameraModel: '',
        cameraType: '',
        location: '',
        dateTaken: '',
        width: '',
        height: '',
        tags: '',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Photo</CardTitle>
        <CardDescription>Add a new photo to your gallery with detailed metadata</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Photo uploaded successfully!</AlertDescription>
            </Alert>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                ref={fileInputRef || ref}
                className="flex-1"
              />
            </div>
            {previewUrl && (
              <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Beautiful Sunset"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A stunning view of..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="wildlife">Wildlife</SelectItem>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="macro">Macro</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={formData.mood} onValueChange={(value) => handleInputChange('mood', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="serene">Serene</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="nostalgic">Nostalgic</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Camera Brand */}
            <div className="space-y-2">
              <Label htmlFor="cameraBrand">Camera Brand</Label>
              <Input
                id="cameraBrand"
                placeholder="Canon"
                value={formData.cameraBrand}
                onChange={(e) => handleInputChange('cameraBrand', e.target.value)}
              />
            </div>

            {/* Camera Model */}
            <div className="space-y-2">
              <Label htmlFor="cameraModel">Camera Model</Label>
              <Input
                id="cameraModel"
                placeholder="EOS R5"
                value={formData.cameraModel}
                onChange={(e) => handleInputChange('cameraModel', e.target.value)}
              />
            </div>

            {/* Camera Type */}
            <div className="space-y-2">
              <Label htmlFor="cameraType">Camera Type</Label>
              <Select value={formData.cameraType} onValueChange={(value) => handleInputChange('cameraType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dslr">DSLR</SelectItem>
                  <SelectItem value="mirrorless">Mirrorless</SelectItem>
                  <SelectItem value="film">Film</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="medium-format">Medium Format</SelectItem>
                  <SelectItem value="point-shoot">Point & Shoot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Swiss Alps"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            {/* Date Taken */}
            <div className="space-y-2">
              <Label htmlFor="dateTaken">Date Taken</Label>
              <Input
                id="dateTaken"
                type="date"
                value={formData.dateTaken}
                onChange={(e) => handleInputChange('dateTaken', e.target.value)}
              />
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="3840"
                value={formData.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                placeholder="2160"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="sunset, mountains, nature"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

PhotoUpload.displayName = 'PhotoUpload';

