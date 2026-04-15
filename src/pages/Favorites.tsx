import { useState, useEffect } from "react";
import { Search, Bookmark, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorkDetailDialog from "@/components/WorkDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Database } from "@/integrations/supabase/types";

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type FavoriteWork = {
  id: string;
  created_at: string;
  work: Work;
};

type Opportunity = Database['public']['Tables']['opportunities']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type FavoriteOpportunity = {
  id: string;
  created_at: string;
  opportunity: Opportunity;
};

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWork[]>([]);
  const [opportunityFavorites, setOpportunityFavorites] = useState<FavoriteOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchOpportunityFavorites();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const workChannel = supabase
      .channel('work-favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_favorites',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    const opportunityChannel = supabase
      .channel('opportunity-favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunity_favorites',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchOpportunityFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workChannel);
      supabase.removeChannel(opportunityChannel);
    };
  };

  const fetchFavorites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('work_favorites')
      .select(`
        id,
        created_at,
        work:work_id (
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const validFavorites = data
        .filter(fav => fav.work)
        .map(fav => ({
          id: fav.id,
          created_at: fav.created_at,
          work: fav.work as Work
        }));
      setFavorites(validFavorites);
    }
  };

  const fetchOpportunityFavorites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('opportunity_favorites')
      .select(`
        id,
        created_at,
        opportunity:opportunity_id (
          *,
          profiles:creator_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const validOpportunities = data
        .filter(fav => fav.opportunity)
        .map(fav => ({
          id: fav.id,
          created_at: fav.created_at,
          opportunity: fav.opportunity as Opportunity
        }));
      setOpportunityFavorites(validOpportunities);
    }
  };

  const removeOpportunityFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from('opportunity_favorites')
      .delete()
      .eq('id', favoriteId);

    if (!error) {
      fetchOpportunityFavorites();
    }
  };

  const allHashtags = Array.from(
    new Set(favorites.flatMap(fav => fav.work.hashtags || []))
  );

  const filteredFavorites = favorites.filter(fav => {
    const work = fav.work;
    const matchesSearch = 
      work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (work.hashtags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesHashtags = selectedHashtags.length === 0 ||
      selectedHashtags.every(selectedTag => (work.hashtags || []).includes(selectedTag));
    
    return matchesSearch && matchesHashtags;
  });

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        </div>

        <Tabs defaultValue="works" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="works">Works</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="works">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {allHashtags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {allHashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedHashtags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleHashtag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((favorite) => {
                const work = favorite.work;
                const thumbnailUrl = work.file_type === 'image' 
                  ? work.file_url 
                  : work.file_type === 'video'
                  ? work.file_url
                  : '/placeholder.svg';

                return (
                  <Card 
                    key={work.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    onClick={() => setSelectedWork(work)}
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {work.file_type === 'image' ? (
                        <img 
                          src={thumbnailUrl} 
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      ) : work.file_type === 'video' ? (
                        <video 
                          src={thumbnailUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-muted-foreground text-sm">
                            {work.file_type}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
                        {work.title}
                      </h3>
                      {work.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {work.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {work.profiles?.avatar_url ? (
                            <img 
                              src={work.profiles.avatar_url} 
                              alt={work.profiles.full_name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-primary font-medium">
                              {work.profiles?.full_name?.[0] || "U"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {work.profiles?.full_name || "Anonymous"}
                        </span>
                      </div>
                      {work.hashtags && work.hashtags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {work.hashtags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredFavorites.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchQuery || selectedHashtags.length > 0 
                    ? "No favorites match your search"
                    : "No favorite works yet"
                  }
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities">
            <div className="space-y-4">
              {opportunityFavorites.map((favorite) => {
                const opp = favorite.opportunity;
                return (
                  <Card key={opp.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg text-foreground">
                            {opp.artist_type}
                          </h3>
                        </div>
                        <p className="text-muted-foreground mb-4">{opp.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-primary font-medium">{opp.payment}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {opp.profiles?.avatar_url ? (
                                <img 
                                  src={opp.profiles.avatar_url} 
                                  alt={opp.profiles.full_name || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-primary font-medium">
                                  {opp.profiles?.full_name?.[0] || "U"}
                                </span>
                              )}
                            </div>
                            <span className="text-muted-foreground">
                              {opp.profiles?.full_name || "Anonymous"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeOpportunityFavorite(favorite.id)}
                        className="text-destructive hover:text-destructive/80 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </Card>
                );
              })}
              {opportunityFavorites.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No favorite opportunities yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      {selectedWork && (
        <WorkDetailDialog
          work={selectedWork}
          open={!!selectedWork}
          onOpenChange={(open) => !open && setSelectedWork(null)}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}
