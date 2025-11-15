import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Heart, User } from "lucide-react";

interface Analytics {
  profileViews7Days: number;
  profileViews30Days: number;
  totalWorkViews: number;
  totalWorkLikes: number;
  recentViewers: Array<{
    viewer_id: string;
    viewed_at: string;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
}

export const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics>({
    profileViews7Days: 0,
    profileViews30Days: 0,
    totalWorkViews: 0,
    totalWorkLikes: 0,
    recentViewers: []
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Profile views last 7 days
    const { count: views7d } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_profile_id', user.id)
      .gte('viewed_at', sevenDaysAgo.toISOString());

    // Profile views last 30 days
    const { count: views30d } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_profile_id', user.id)
      .gte('viewed_at', thirtyDaysAgo.toISOString());

    // Recent viewers - specify the foreign key relationship
    const { data: viewers } = await supabase
      .from('profile_views')
      .select('viewer_id, viewed_at, profiles!profile_views_viewer_id_fkey(full_name, avatar_url)')
      .eq('viewed_profile_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(5);

    // Work views
    const { data: works } = await supabase
      .from('works')
      .select('id')
      .eq('user_id', user.id);

    let totalViews = 0;
    if (works) {
      for (const work of works) {
        const { count } = await supabase
          .from('work_views')
          .select('*', { count: 'exact', head: true })
          .eq('work_id', work.id);
        totalViews += count || 0;
      }
    }

    // Work likes
    const { count: likes } = await supabase
      .from('work_likes')
      .select('*', { count: 'exact', head: true })
      .in('work_id', works?.map(w => w.id) || []);

    setAnalytics({
      profileViews7Days: views7d || 0,
      profileViews30Days: views30d || 0,
      totalWorkViews: totalViews,
      totalWorkLikes: likes || 0,
      recentViewers: viewers || []
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.profileViews7Days}</div>
            <p className="text-xs text-muted-foreground">Profile views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.profileViews30Days}</div>
            <p className="text-xs text-muted-foreground">Profile views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Work Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalWorkViews}</div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Work Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalWorkLikes}</div>
            <p className="text-xs text-muted-foreground">Total likes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Recent Viewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentViewers.map((viewer, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={viewer.profiles.avatar_url || undefined} />
                  <AvatarFallback>{viewer.profiles.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{viewer.profiles.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(viewer.viewed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {analytics.recentViewers.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent views yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
