'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { photosAPI, usersAPI } from '@/lib/api';
import { Image, Users, MessageSquare, Heart } from 'lucide-react';

export function AdminStats() {
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalUsers: 0,
    totalComments: 0,
    totalLikes: 0,
    recentPhotos: 0,
    recentComments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [photosRes, usersRes] = await Promise.all([
          photosAPI.getAll({ page: 1, limit: 100 }),
          usersAPI.getAll(),
        ]);

        const photos = photosRes.data.photos || [];
        const users = usersRes.data || [];

        // Calculate total likes across all photos
        const totalLikes = photos.reduce((acc: number, photo: unknown) => acc + (photo.likes || 0), 0);

        // Calculate stats
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentPhotos = photos.filter((p: any) => new Date(p.createdAt) > sevenDaysAgo).length;

        setStats({
          totalPhotos: photos.length,
          totalUsers: users.length,
          totalComments: 0, // Will be calculated from comments
          totalLikes,
          recentPhotos,
          recentComments: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Photos',
      value: stats.totalPhotos,
      icon: Image,
      description: `${stats.recentPhotos} added this week`,
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered accounts',
      color: 'text-green-600',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: Heart,
      description: 'Across all photos',
      color: 'text-red-600',
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      description: `${stats.recentComments} this week`,
      color: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
