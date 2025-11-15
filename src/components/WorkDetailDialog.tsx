import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Bookmark, Send, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import MediaViewer from './MediaViewer';
import { Database } from '@/integrations/supabase/types';

type Work = Database['public']['Tables']['works']['Row'];
type WorkComment = Database['public']['Tables']['work_comments']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface WorkDetailDialogProps {
  work: Work & {
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export default function WorkDetailDialog({ work, open, onOpenChange, currentUserId }: WorkDetailDialogProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && work.id) {
      fetchComments();
      fetchLikeStatus();
      fetchFavoriteStatus();
      fetchLikeCount();
      setupRealtimeSubscription();
    }
  }, [open, work.id]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`work-${work.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_comments',
          filter: `work_id=eq.${work.id}`,
        },
        () => {
          fetchComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_likes',
          filter: `work_id=eq.${work.id}`,
        },
        () => {
          fetchLikeCount();
          fetchLikeStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('work_comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('work_id', work.id)
      .order('created_at', { ascending: true });

    if (data) setComments(data as WorkComment[]);
  };

  const fetchLikeStatus = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('work_likes')
      .select()
      .eq('work_id', work.id)
      .eq('user_id', currentUserId)
      .maybeSingle();

    setIsLiked(!!data);
  };

  const fetchFavoriteStatus = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('work_favorites')
      .select()
      .eq('work_id', work.id)
      .eq('user_id', currentUserId)
      .maybeSingle();

    setIsFavorited(!!data);
  };

  const fetchLikeCount = async () => {
    const { count } = await supabase
      .from('work_likes')
      .select('*', { count: 'exact', head: true })
      .eq('work_id', work.id);

    setLikeCount(count || 0);
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast({ title: 'Please login to like works', variant: 'destructive' });
      return;
    }

    if (isLiked) {
      await supabase
        .from('work_likes')
        .delete()
        .eq('work_id', work.id)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('work_likes')
        .insert({ work_id: work.id, user_id: currentUserId });
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) {
      toast({ title: 'Please login to save favorites', variant: 'destructive' });
      return;
    }

    if (isFavorited) {
      await supabase
        .from('work_favorites')
        .delete()
        .eq('work_id', work.id)
        .eq('user_id', currentUserId);
      toast({ title: 'Removed from favorites' });
    } else {
      await supabase
        .from('work_favorites')
        .insert({ work_id: work.id, user_id: currentUserId });
      toast({ title: 'Added to favorites' });
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUserId) {
      toast({ title: 'Please login to comment', variant: 'destructive' });
      return;
    }

    if (!comment.trim()) return;

    const { error } = await supabase
      .from('work_comments')
      .insert({
        work_id: work.id,
        user_id: currentUserId,
        content: comment.trim(),
      });

    if (error) {
      toast({ title: 'Failed to post comment', variant: 'destructive' });
    } else {
      setComment('');
      toast({ title: 'Comment posted' });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('work_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUserId!);

    if (error) {
      toast({ title: 'Failed to delete comment', variant: 'destructive' });
    } else {
      toast({ title: 'Comment deleted' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={work.profiles?.avatar_url || ''} />
              <AvatarFallback>{work.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{work.title}</div>
              <div className="text-sm text-muted-foreground">{work.profiles?.full_name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4">
            <MediaViewer
              fileUrl={work.file_url}
              fileType={work.file_type}
              watermarkUrl={work.watermark_url}
              title={work.title}
            />

            {work.description && (
              <p className="text-sm text-foreground">{work.description}</p>
            )}

            {work.hashtags && work.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {work.hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                size="sm"
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
              <Button
                variant={isFavorited ? 'default' : 'outline'}
                size="sm"
                onClick={handleFavorite}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Comments ({comments.length})</h3>

              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={c.profiles?.avatar_url || ''} />
                      <AvatarFallback>{c.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.profiles?.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                        </span>
                        {c.user_id === currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(c.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <Button onClick={handleSubmitComment} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
