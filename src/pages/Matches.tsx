import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMatch, setPreviewMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Fetch matches from the matches table
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('matched_at', { ascending: false });

      if (error) throw error;

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Get the other user's ID for each match
      const matchesWithProfiles = await Promise.all(
        matchesData.map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          if (!profile) return null;

          // Get last message from conversation
          let lastMessage = null;
          let lastMessageTime = null;
          let lastMessageFromMe = false;

          if (match.conversation_id) {
            const { data: messages } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', match.conversation_id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (messages && messages.length > 0) {
              lastMessage = messages[0].content;
              lastMessageTime = messages[0].created_at;
              lastMessageFromMe = messages[0].sender_id === user.id;
            }
          }

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            bio: profile.bio || '',
            location: profile.location || '',
            work_images: profile.work_images || [],
            avatar_url: profile.avatar_url,
            conversationId: match.conversation_id || undefined,
            lastMessage,
            lastMessageTime,
            lastMessageFromMe,
            matchScore: match.match_score || 0,
            matchedAt: match.matched_at
          };
        })
      );

      const validMatches = matchesWithProfiles.filter(m => m !== null) as Match[];
      setMatches(validMatches);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      setMatches([]);
      toast({
        title: "Error loading matches",
        description: "Could not load your matches. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (match: Match, e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const handleViewProfile = (match: Match) => {
    // Navigate to full profile page
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
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] pt-24">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Accedi per Continuare</h2>
            <p className="text-muted-foreground">Devi effettuare l'accesso per visualizzare i match</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/auth')} size="lg">Accedi</Button>
              <Button onClick={() => navigate('/auth')} variant="outline" size="lg">Registrati</Button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-16">
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
    <div className="min-h-screen bg-background pt-24 pb-20">
      <Header />
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Bees U Matched With
          </h1>
        </div>

        {matches.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">No matches yet</h2>
            <p className="text-muted-foreground mb-6">
              Start swiping to find artists you'd love to work with!
            </p>
            <Button onClick={() => navigate('/find')} className="bg-gradient-primary text-white hover:opacity-90">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {match.full_name}
                          </h3>
                          {match.matchScore !== undefined && match.matchScore > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {match.matchScore}% match
                            </Badge>
                          )}
                        </div>
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

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewMatch?.full_name}</DialogTitle>
          </DialogHeader>
          {previewMatch && (
            <div className="space-y-4">
              {previewMatch.bio && (
                <p className="text-sm text-muted-foreground">{previewMatch.bio}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {previewMatch.work_images?.map((img, idx) => (
                  <img key={idx} src={img} alt={`Work ${idx + 1}`} className="w-full h-40 object-cover rounded" />
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={(e) => previewMatch && handleChatClick(previewMatch, e as any)}>
                  Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Matches;
