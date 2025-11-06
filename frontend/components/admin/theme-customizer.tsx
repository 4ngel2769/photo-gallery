'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const defaultLightTheme = `/* Light Mode Colors */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;
--radius: 0.5rem;`;

const defaultDarkTheme = `/* Dark Mode Colors */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 4.9%;
--card-foreground: 210 40% 98%;
--popover: 222.2 84% 4.9%;
--popover-foreground: 210 40% 98%;
--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 11.2%;
--secondary: 217.2 32.6% 17.5%;
--secondary-foreground: 210 40% 98%;
--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;
--accent: 217.2 32.6% 17.5%;
--accent-foreground: 210 40% 98%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 210 40% 98%;
--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 212.7 26.8% 83.9%;`;

export function ThemeCustomizer() {
  const [lightTheme, setLightTheme] = useState(defaultLightTheme);
  const [darkTheme, setDarkTheme] = useState(defaultDarkTheme);
  const [customCSS, setCustomCSS] = useState('');

  const handleSave = () => {
    // In a real implementation, this would save to the backend
    toast.success('Theme saved successfully!');
    
    // Apply theme changes to the document
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        ${lightTheme}
      }
      
      .dark {
        ${darkTheme}
      }
      
      ${customCSS}
    `;
    document.head.appendChild(style);
  };

  const handleReset = () => {
    setLightTheme(defaultLightTheme);
    setDarkTheme(defaultDarkTheme);
    setCustomCSS('');
    toast.info('Theme reset to defaults');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>Customize your gallery&apos;s appearance with CSS variables</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Theme
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Customize CSS variables to change colors across your entire gallery. Changes are applied in real-time
              when you save. Use HSL color format (e.g., 222.2 47.4% 11.2%).
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="light" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="light">Light Mode</TabsTrigger>
              <TabsTrigger value="dark">Dark Mode</TabsTrigger>
              <TabsTrigger value="custom">Custom CSS</TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="light-theme">Light Mode CSS Variables</Label>
                <Textarea
                  id="light-theme"
                  value={lightTheme}
                  onChange={(e) => setLightTheme(e.target.value)}
                  className="font-mono text-sm h-[400px]"
                  placeholder="Enter light mode CSS variables..."
                />
                <p className="text-xs text-muted-foreground">
                  Define CSS custom properties for light mode. Use HSL format for colors.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="dark" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dark-theme">Dark Mode CSS Variables</Label>
                <Textarea
                  id="dark-theme"
                  value={darkTheme}
                  onChange={(e) => setDarkTheme(e.target.value)}
                  className="font-mono text-sm h-[400px]"
                  placeholder="Enter dark mode CSS variables..."
                />
                <p className="text-xs text-muted-foreground">
                  Define CSS custom properties for dark mode. Use HSL format for colors.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  className="font-mono text-sm h-[400px]"
                  placeholder="/* Add your custom CSS here */&#10;.my-custom-class {&#10;  /* styles */&#10;}"
                />
                <p className="text-xs text-muted-foreground">
                  Add any custom CSS rules to further customize your gallery appearance.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-2">Available CSS Variables:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm font-mono">
              <div>--background</div>
              <div>--foreground</div>
              <div>--card</div>
              <div>--card-foreground</div>
              <div>--popover</div>
              <div>--popover-foreground</div>
              <div>--primary</div>
              <div>--primary-foreground</div>
              <div>--secondary</div>
              <div>--secondary-foreground</div>
              <div>--muted</div>
              <div>--muted-foreground</div>
              <div>--accent</div>
              <div>--accent-foreground</div>
              <div>--destructive</div>
              <div>--destructive-foreground</div>
              <div>--border</div>
              <div>--input</div>
              <div>--ring</div>
              <div>--radius</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>Preview how your theme changes look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Light Mode Preview</h4>
              <div className="space-y-2">
                <div className="h-10 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  Primary
                </div>
                <div className="h-10 rounded bg-secondary text-secondary-foreground flex items-center justify-center text-sm">
                  Secondary
                </div>
                <div className="h-10 rounded bg-muted text-muted-foreground flex items-center justify-center text-sm">
                  Muted
                </div>
                <div className="h-10 rounded bg-accent text-accent-foreground flex items-center justify-center text-sm">
                  Accent
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg dark">
              <h4 className="font-semibold">Dark Mode Preview</h4>
              <div className="space-y-2">
                <div className="h-10 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  Primary
                </div>
                <div className="h-10 rounded bg-secondary text-secondary-foreground flex items-center justify-center text-sm">
                  Secondary
                </div>
                <div className="h-10 rounded bg-muted text-muted-foreground flex items-center justify-center text-sm">
                  Muted
                </div>
                <div className="h-10 rounded bg-accent text-accent-foreground flex items-center justify-center text-sm">
                  Accent
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
