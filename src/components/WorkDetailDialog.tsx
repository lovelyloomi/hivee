import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Bookmark, Send, Trash2, Edit2, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import MediaViewer from './MediaViewer';
import { WorkComments } from './WorkComments';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(work.description || '');
  const [editedHashtags, setEditedHashtags] = useState(work.hashtags?.join(', ') || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && work.id) {
      setEditedDescription(work.description || '');
      setEditedHashtags(work.hashtags?.join(', ') || '');
      setIsEditing(false);
      fetchComments();
      fetchLikeStatus();
      fetchFavoriteStatus();
      fetchLikeCount();
      setupRealtimeSubscription();
    }
  }, [open, work.id, work.description, work.hashtags]);

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

  const handleSaveEdit = async () => {
    const hashtagArray = editedHashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    if (hashtagArray.length > 5) {
      toast({ title: 'Maximum 5 hashtags allowed', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('works')
      .update({
        description: editedDescription,
        hashtags: hashtagArray,
      })
      .eq('id', work.id)
      .eq('user_id', currentUserId!);

    if (error) {
      toast({ title: 'Failed to update work', variant: 'destructive' });
    } else {
      setIsEditing(false);
      toast({ title: 'Work updated successfully' });
      onOpenChange(false); // Close and reopen to refresh
      setTimeout(() => onOpenChange(true), 100);
    }
  };

  const handleDeleteWork = async () => {
    if (!currentUserId || currentUserId !== work.user_id) return;

    try {
      // Delete the file from storage
      const fileName = work.file_url.split('/').pop();
      if (fileName) {
        const filePath = `${work.user_id}/${fileName}`;
        await supabase.storage.from('works').remove([filePath]);
      }

      // Delete the work record
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', work.id)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({ title: 'Work deleted successfully' });
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Failed to delete work', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] overflow-hidden flex flex-col p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Media Section - Full height on desktop, scrollable on mobile */}
          <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative">
            <div className="w-full h-full flex items-center justify-center p-4">
              <MediaViewer
                fileUrl={work.file_url}
                fileType={work.file_type}
                watermarkUrl={work.watermark_url}
                title={work.title}
              />
            </div>
          </div>

          {/* Info Section - Scrollable sidebar */}
          <div className="w-full md:w-1/3 bg-background flex flex-col overflow-hidden border-l">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={work.profiles?.avatar_url || ''} />
                <AvatarFallback>{work.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{work.title}</div>
                <div className="text-sm text-muted-foreground">{work.profiles?.full_name}</div>
              </div>
            </div>
            {currentUserId === work.user_id && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            </DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hashtags">Hashtags (max 5)</Label>
                  <Input
                    id="edit-hashtags"
                    value={editedHashtags}
                    onChange={(e) => setEditedHashtags(e.target.value)}
                    placeholder="art, 3d, animation (comma separated)"
                  />
                </div>
                <Button onClick={handleSaveEdit} className="w-full">
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <>
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
              </>
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
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWork} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
