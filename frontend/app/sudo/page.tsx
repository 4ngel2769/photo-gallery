'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhotoUpload } from '@/components/admin/photo-upload';
import { PhotoManagement } from '@/components/admin/photo-management';
import { CommentModeration } from '@/components/admin/comment-moderation';
import { ThemeCustomizer } from '@/components/admin/theme-customizer';
import { UserManagement } from '@/components/admin/user-management';
import { AdminStats } from '@/components/admin/admin-stats';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { DragDropZone } from '@/components/admin/drag-drop-zone';
import { Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleFilesDropped = (files: FileList) => {
    // Trigger the file input in PhotoUpload component
    // We'll need to pass this to PhotoUpload via a ref or callback
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      Array.from(files).forEach(file => dt.items.add(file));
      fileInputRef.current.files = dt.files;
      
      // Trigger change event
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
      
      // Switch to upload tab
      const uploadTab = document.querySelector('[value="upload"]') as HTMLButtonElement;
      if (uploadTab) uploadTab.click();
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (user?.role !== 'admin') {
        setError('You do not have admin privileges');
        return;
      }

      // Check if password change is required
      if (result.mustChangePassword) {
        setMustChangePassword(true);
        setShowPasswordChange(true);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login form if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Panel</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.displayName || user.username}</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/')}>
                View Gallery
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <AdminStats />

          <Tabs defaultValue="upload" className="mt-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <PhotoUpload fileInputRef={fileInputRef} />
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <PhotoManagement />
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <CommentModeration />
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              <ThemeCustomizer />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Full-screen drag and drop zone */}
        <DragDropZone onFilesDropped={handleFilesDropped} />
      </div>

      {/* Forced Password Change Dialog */}
      <ChangePasswordDialog
        open={showPasswordChange}
        onOpenChange={(open) => {
          if (!mustChangePassword) {
            setShowPasswordChange(open);
          }
        }}
        forced={mustChangePassword}
      />
    </>
  );
}
