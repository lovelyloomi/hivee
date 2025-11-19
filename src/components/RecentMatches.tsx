import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { HexagonAvatar } from "@/components/HexagonAvatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number | null;
  matched_at: string | null;
  conversation_id: string | null;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const RecentMatches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentMatches();
    }
  }, [user]);

  const fetchRecentMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq("status", "active")
        .order("matched_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      if (matchesData) {
        const matchesWithProfiles = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", otherUserId)
              .single();

            return {
              ...match,
              profile: profile || { id: otherUserId, full_name: null, avatar_url: null },
            };
          })
        );

        setMatches(matchesWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching recent matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (match: Match) => {
    if (match.conversation_id) {
      navigate(`/chat/${match.conversation_id}`);
    } else {
      // Create conversation if it doesn't exist
      const { data: conversation } = await supabase
        .from("conversations")
        .insert({
          user1_id: match.user1_id,
          user2_id: match.user2_id,
        })
        .select()
        .single();

      if (conversation) {
        await supabase
          .from("matches")
          .update({ conversation_id: conversation.id })
          .eq("id", match.id);

        navigate(`/chat/${conversation.id}`);
      }
    }
  };

  if (!user || loading || matches.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recent Matches</h3>
        </div>
        
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <HexagonAvatar
                src={match.profile.avatar_url || ""}
                alt={match.profile.full_name || "User"}
                size="md"
              />
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {match.profile.full_name || "Anonymous"}
                </p>
                {match.match_score && (
                  <Badge variant="secondary" className="text-xs">
                    {match.match_score}% Match
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleMessage(match)}
                className="shrink-0"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-3"
          onClick={() => navigate("/matches")}
        >
          View All Matches
        </Button>
      </CardContent>
    </Card>
  );
};
