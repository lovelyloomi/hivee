import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Send, MoreVertical, Shield, UserX, User, Paperclip, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { usePresence } from "@/hooks/usePresence";
import { MessageMedia } from "@/components/MessageMedia";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ReportUserDialog } from "@/components/ReportUserDialog";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  media_url?: string | null;
  media_type?: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  work_images: string[];
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { isUserOnline } = usePresence(user?.id);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && matchId) {
      fetchConversation();
      setupRealtimeSubscription();
    }
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    if (!user || !matchId) return;

    try {
      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', matchId)
        .single();

      if (convError) throw convError;

      // Determine the other user
      const otherUserId = conversation.user1_id === user.id 
        ? conversation.user2_id 
        : conversation.user1_id;

      // Fetch other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (profileError) throw profileError;
      setOtherUser(profile);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', matchId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', matchId)
        .neq('sender_id', user.id)
        .eq('read', false);

    } catch (error: any) {
      console.error("Error fetching conversation:", error);
      toast({
        title: "Error loading conversation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!matchId) return;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${matchId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          
          // Mark as read if not from current user
          if (payload.new.sender_id !== user?.id) {
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) return;
    if (!user || !matchId || sending) return;

    setSending(true);
    
    try {
      let mediaUrl: string | null = null;
      let mediaType: string | null = null;

      if (selectedFile) {
        setUploadingMedia(true);
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Validate file type
        const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'fbx', 'mp4', 'mov', 'avi', 'webm'];
        if (fileExt && !allowedTypes.includes(fileExt)) {
          toast({
            title: "Unsupported file type",
            description: "Supported: JPG, PNG, PDF, FBX, MP4, MOV, AVI, WEBM",
            variant: "destructive"
          });
          setUploadingMedia(false);
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from('chat-media')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
        mediaType = selectedFile.type;
        setUploadingMedia(false);
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: matchId,
          sender_id: user.id,
          content: newMessage.trim() || '📎 Attachment',
          media_url: mediaUrl,
          media_type: mediaType
        });

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', matchId);

      if (otherUser) {
        await createNotification(
          otherUser.id,
          'message',
          'New Message 💬',
          newMessage.trim() || 'Sent you a file',
          user.id,
          matchId
        );
      }

      setNewMessage("");
      clearFileSelection();
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBlockUser = async () => {
    if (!user || !otherUser) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: user.id,
          blocked_user_id: otherUser.id
        });

      if (error) throw error;

      toast({ title: "User blocked" });
      setShowBlockDialog(false);
      navigate('/matches');
    } catch (error: any) {
      toast({
        title: "Error blocking user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUnmatch = async () => {
    if (!user || !otherUser) return;

    try {
      // Delete mutual favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('favorited_user_id', otherUser.id);

      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', otherUser.id)
        .eq('favorited_user_id', user.id);

      toast({ title: "Unmatched successfully" });
      setShowUnmatchDialog(false);
      navigate('/matches');
    } catch (error: any) {
      toast({
        title: "Error unmatching",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Accedi per Continuare</h2>
          <p className="text-muted-foreground">Devi effettuare l'accesso per visualizzare le chat</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/auth')} size="lg">Accedi</Button>
            <Button onClick={() => navigate('/auth')} variant="outline" size="lg">Registrati</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/matches")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {otherUser && (
          <>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {otherUser.work_images?.[0] ? (
                <img
                  src={otherUser.work_images[0]}
                  alt={otherUser.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {otherUser.full_name}
              </h2>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isUserOnline(otherUser.id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isUserOnline(otherUser.id) ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Report User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/profile/${otherUser.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowUnmatchDialog(true)} className="text-destructive">
                  <UserX className="mr-2 h-4 w-4" />
                  Unmatch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-background p-8 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">Drop file to upload</p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-primary text-white'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  {message.media_url && message.media_type && (
                    <div className="mb-2">
                      <MessageMedia 
                        mediaUrl={message.media_url} 
                        mediaType={message.media_type} 
                      />
                    </div>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-4 py-3">
        {selectedFile && (
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
            ) : (
              <div className="h-20 w-20 bg-background rounded flex items-center justify-center">
                <Paperclip className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFileSelection}
              disabled={uploadingMedia}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploadingMedia}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border text-foreground"
            disabled={sending || uploadingMedia}
          />
          <Button
            type="submit"
            disabled={sending || uploadingMedia || (!newMessage.trim() && !selectedFile)}
            className="bg-gradient-primary text-white hover:opacity-90"
          >
            {uploadingMedia ? "..." : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {otherUser?.full_name}? They won't be able to message you anymore and you won't see their content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmatch Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unmatch with {otherUser?.full_name}? This will remove them from your matches and delete your conversation history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmatch} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {otherUser && (
        <ReportUserDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedUserId={otherUser.id}
        />
      )}
    </div>
  );
};

export default Chat;
