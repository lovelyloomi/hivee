import { useState, useEffect } from "react";
import { Search, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorkDetailDialog from "@/components/WorkDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWork[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('favorites-changes')
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

    return () => {
      supabase.removeChannel(channel);
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
      // Filter out any null works
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
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {allHashtags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
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
          </div>
        )}

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              {searchQuery || selectedHashtags.length > 0 ? 'No favorites found' : 'No favorites yet'}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery || selectedHashtags.length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start favoriting works to see them here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setSelectedWork(favorite.work)}
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {favorite.work.file_type === 'image' ? (
                    <img
                      src={favorite.work.file_url}
                      alt={favorite.work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : favorite.work.file_type === 'video' ? (
                    <video
                      src={favorite.work.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : favorite.work.file_type === 'pdf' ? (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-muted-foreground">PDF</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm text-muted-foreground">3D Model</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">{favorite.work.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {favorite.work.profiles?.full_name || 'Unknown'}
                  </p>
                  {favorite.work.hashtags && favorite.work.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {favorite.work.hashtags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {favorite.work.hashtags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{favorite.work.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
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
