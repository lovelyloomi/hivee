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
  matchScore?: number;
  matchedAt?: string;
  lastMessageFromMe?: boolean;
}

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Demo data for testing
  const demoMatches: Match[] = [
    {
      id: 'demo-1',
      full_name: 'Sofia Martinez',
      bio: 'Digital illustrator & concept artist. Love creating fantasy worlds and character designs.',
      location: 'Barcelona, Spain',
      work_images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800'],
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      matchScore: 92,
      matchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessage: "Hey! I love your portfolio work!",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastMessageFromMe: false
    },
    {
      id: 'demo-2',
      full_name: 'Marcus Chen',
      bio: '3D artist specializing in architectural visualization and product rendering.',
      location: 'Singapore',
      work_images: ['https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'],
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      matchScore: 85,
      matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessage: "Thanks! Would love to collaborate sometime",
      lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      lastMessageFromMe: true
    },
    {
      id: 'demo-3',
      full_name: 'Emma Thompson',
      bio: 'Motion designer creating stunning animations for brands. Always experimenting!',
      location: 'London, UK',
      work_images: ['https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800'],
      avatar_url: 'https://i.pravatar.cc/150?img=9',
      matchScore: 78,
      matchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessageFromMe: false
    },
    {
      id: 'demo-4',
      full_name: 'Diego Santos',
      bio: 'Game artist & UI designer. Passionate about creating immersive gaming experiences.',
      location: 'São Paulo, Brazil',
      work_images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800', 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800'],
      avatar_url: 'https://i.pravatar.cc/150?img=15',
      matchScore: 88,
      matchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessage: "Your game art is incredible! 🎮",
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      lastMessageFromMe: false
    },
    {
      id: 'demo-5',
      full_name: 'Yuki Tanaka',
      bio: 'Graphic designer & brand identity specialist. Minimalist aesthetics with bold concepts.',
      location: 'Tokyo, Japan',
      work_images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800'],
      avatar_url: 'https://i.pravatar.cc/150?img=47',
      matchScore: 65,
      matchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastMessageFromMe: false
    }
  ];

  useEffect(() => {
    if (user) {
      if (demoMode) {
        setMatches(demoMatches);
        setLoading(false);
      } else {
        fetchMatches();
      }
    }
  }, [user, demoMode]);

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

      // If no real matches, show demo data
      if (matchedUserIds.length === 0) {
        setMatches(demoMatches);
        setLoading(false);
        return;
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
      // Fallback to demo data on error so UI is still testable
      setMatches(demoMatches);
      toast({
        title: "Showing demo matches",
        description: "We couldn't load real matches yet. Displaying demo data for preview.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (match: Match, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    // Handle demo data
    if (match.id?.startsWith('demo-')) {
      toast({
        title: "Demo Match",
        description: "This is demo data. Real matches will have working chat!",
      });
      return;
    }

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

  const handleViewProfile = (match: Match) => {
    // Handle demo data
    if (match.id?.startsWith('demo-')) {
      toast({
        title: "Demo Match",
        description: "This is demo data. Click to see their portfolio preview!",
      });
      // You could open a modal here to show their work_images
      return;
    }
    
    navigate(`/profile/${match.id}`);
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
                onClick={() => handleViewProfile(match)}
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-shrink-0 ml-2"
                        onClick={(e) => handleChatClick(match, e)}
                      >
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </Button>
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
