import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

export const useRealtimeMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new matches
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `or(user1_id.eq.${user.id},user2_id.eq.${user.id})`
        },
        async (payload) => {
          console.log('New match received:', payload);
          
          const newMatch = payload.new;
          const otherUserId = newMatch.user1_id === user.id ? newMatch.user2_id : newMatch.user1_id;

          // Get the other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          if (profile) {
            // Show toast notification
            toast({
              title: "🎉 It's a Match!",
              description: `You matched with ${profile.full_name || 'someone'}!`,
              duration: 5000,
            });

            // Create persistent notification
            await createNotification(
              user.id,
              'match',
              "🎉 New Match!",
              `You matched with ${profile.full_name || 'someone'}! Start chatting now.`,
              otherUserId
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, createNotification]);
};
