
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, Palette, UserCircle2, AlertTriangle } from 'lucide-react';
import type { User, NotificationSettings as AppNotificationSettings } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const { user, loading: authLoading, signup: updateUserProfile } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [notificationSettings, setNotificationSettings] = useState<AppNotificationSettings>({
    muteAll: false,
    mutedChats: [],
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/settings'); // Redirect to login if not authenticated
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
    const storedSettings = localStorage.getItem('rippleChatNotificationSettings');
    if (storedSettings && storedSettings !== 'undefined') {
      try {
        setNotificationSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error("Failed to parse notification settings:", error);
      }
    }
  }, [user, authLoading, router]);

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      // This is a mock update. In a real app, use a dedicated update function.
      // For now, re-using signup updates the user in context.
      const updatedUser = { ...user, name, avatarUrl }; 
      localStorage.setItem('rippleChatUser', JSON.stringify(updatedUser)); // Mock update
      // Call a function to update user context if signup doesn't do it well enough
      // For mock, this might be enough, or use a toast to indicate manual refresh if needed
    } catch (error) {
      console.error("Failed to save profile", error);
    }
    setIsSavingProfile(false);
  };

  const handleNotificationChange = (key: keyof AppNotificationSettings, value: any) => {
    setIsSavingNotifications(true);
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem('rippleChatNotificationSettings', JSON.stringify(newSettings));
    setTimeout(() => setIsSavingNotifications(false), 500);
  };

  if (authLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  if (!user) {
    // This state should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in to access settings. Redirecting to login...</AlertDescription>
        </Alert>
      </div>
    );
  }

  const fallbackName = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <UserCircle2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={avatarUrl} alt={name} data-ai-hint="user avatar" />
              <AvatarFallback>{fallbackName}</AvatarFallback>
            </Avatar>
            <Input 
              id="avatarUrl" 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Avatar URL (e.g., https://placehold.co/200x200.png)"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled /> {/* Email typically not changed here easily */}
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p>Theme</p>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div>
              <Label htmlFor="muteAll" className="font-medium">Mute All Notifications</Label>
              <p className="text-xs text-muted-foreground">Silence all notifications from the app.</p>
            </div>
            <Switch
              id="muteAll"
              checked={notificationSettings.muteAll}
              onCheckedChange={(checked) => handleNotificationChange('muteAll', checked)}
              disabled={isSavingNotifications}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Individual chat notification settings will be available here in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
