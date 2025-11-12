"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Image, Video, TrendingUp, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GenerationStats {
  totalProjects: number;
  totalThumbnails: number;
  thisMonth: {
    projects: number;
    thumbnails: number;
  };
}

export const GenerationStats = () => {
  const { authFetch } = useAuthFetch();

  // Fetch projects count
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await authFetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  // Fetch thumbnails count
  const { data: thumbnailsData, isLoading: thumbnailsLoading } = useQuery({
    queryKey: ["thumbnails-stats"],
    queryFn: async () => {
      const response = await authFetch("/api/thumbnails?limit=1000");
      if (!response.ok) throw new Error("Failed to fetch thumbnails");
      const data = await response.json();
      return data.data || [];
    },
  });

  const thumbnails = useMemo(() => thumbnailsData || [], [thumbnailsData]);

  const isLoading = projectsLoading || thumbnailsLoading;

  // Calculate stats with memoization for performance
  const stats: GenerationStats = useMemo(() => {
    const calculateThisMonth = (items: any[]) => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return items.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= firstDayOfMonth;
      }).length;
    };

    return {
      totalProjects: projects.length || 0,
      totalThumbnails: thumbnails.length || 0,
      thisMonth: {
        projects: calculateThisMonth(projects),
        thumbnails: calculateThisMonth(thumbnails),
      },
    };
  }, [projects, thumbnails]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: Video,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      description: "All time",
    },
    {
      title: "Total Thumbnails",
      value: stats.totalThumbnails,
      icon: Image,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      description: "All time",
    },
    {
      title: "Projects This Month",
      value: stats.thisMonth.projects,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      description: "Current month",
    },
    {
      title: "Thumbnails This Month",
      value: stats.thisMonth.thumbnails,
      icon: Zap,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      description: "Current month",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Statistics</CardTitle>
        <CardDescription>
          Track your project and thumbnail creation activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

