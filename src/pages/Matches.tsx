import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Heart } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  work_images: string[];
  avatar_url: string | null;
  conversationId?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Get mutual favorites (matches)
      const { data: mutualFavorites, error } = await supabase
        .from('favorites')
        .select(`
          favorited_user_id,
          profiles:favorited_user_id(
            id,
            full_name,
            bio,
            location,
            work_images,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter for mutual matches
      const matchedUserIds = [];
      for (const fav of mutualFavorites || []) {
        const { data: reverseMatch } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', fav.favorited_user_id)
          .eq('favorited_user_id', user.id)
          .single();

        if (reverseMatch) {
          matchedUserIds.push(fav.favorited_user_id);
        }
      }

      // Get full profile data for matches
      const { data: matchProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', matchedUserIds);

      // Get conversations for these matches
      const matchesWithConversations = await Promise.all(
        (matchProfiles || []).map(async (profile) => {
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              id,
              messages(content, created_at)
            `)
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${user.id})`)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          const lastMessage = conversation?.messages?.[0];

          return {
            ...profile,
            conversationId: conversation?.id,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at
          };
        })
      );

      setMatches(matchesWithConversations);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error loading matches",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (match: Match) => {
    if (!user) return;

    try {
      let conversationId = match.conversationId;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const user1Id = user.id < match.id ? user.id : match.id;
        const user2Id = user.id < match.id ? match.id : user.id;

        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user1Id,
            user2_id: user2Id
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = data.id;
      }

      navigate(`/chat/${conversationId}`);
    } catch (error: any) {
      toast({
        title: "Error opening chat",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d ago";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view matches</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <div className="container max-w-2xl mx-auto px-4 py-8 pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading matches...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <div className="container max-w-2xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your Matches
          </h1>
        </div>

        {matches.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">No matches yet</h2>
            <p className="text-muted-foreground mb-6">
              Start swiping to find artists you'd love to work with!
            </p>
            <Button onClick={() => navigate('/swipe')} className="bg-gradient-primary text-white hover:opacity-90">
              Start Swiping
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-6 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleChatClick(match)}
              >
                <div className="flex items-start gap-4">
                  {/* Profile/Work Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {match.work_images && match.work_images.length > 0 ? (
                      <img
                        src={match.work_images[0]}
                        alt={match.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : match.avatar_url ? (
                      <img
                        src={match.avatar_url}
                        alt={match.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {match.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {match.location}
                        </p>
                      </div>
                      <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    </div>

                    {match.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {match.bio}
                      </p>
                    )}

                    {match.lastMessage && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-foreground/70 line-clamp-1">
                          {match.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTimeAgo(match.lastMessageTime)}
                        </p>
                      </div>
                    )}

                    {!match.lastMessage && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-primary font-medium">
                          Send a message to start chatting!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Samples Preview */}
                {match.work_images && match.work_images.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {match.work_images.slice(1, 4).map((image, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted"
                      >
                        <img
                          src={image}
                          alt={`${match.full_name}'s work ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {match.work_images.length > 4 && (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{match.work_images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Matches;
