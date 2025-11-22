import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  profiles: {
    full_name: string | null;
    bio: string | null;
  };
}

export default function BlockedUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBlockedUsers();
  }, [user, navigate]);

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          profiles!blocked_users_blocked_user_id_fkey(
            full_name,
            bio
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading blocked users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setBlockedUsers(blockedUsers.filter(b => b.id !== blockId));
      toast({
        title: "User unblocked"
      });
    } catch (error: any) {
      toast({
        title: "Error unblocking user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-16">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Blocked Users</h1>
        </div>

        {blockedUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No blocked users</h3>
            <p className="text-muted-foreground">
              Users you block will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((blocked) => (
              <Card key={blocked.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {blocked.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {blocked.profiles?.full_name || 'Unknown User'}
                      </p>
                      {blocked.profiles?.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {blocked.profiles.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleUnblock(blocked.id)}
                  >
                    Unblock
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
