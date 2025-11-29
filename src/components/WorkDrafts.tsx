import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
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

interface Draft {
  id: string;
  title: string | null;
  description: string | null;
  hashtags: string[] | null;
  work_type: string | null;
  work_style: string | null;
  made_with_ai: boolean;
  nsfw: boolean;
  is_downloadable: boolean;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkDraftsProps {
  onLoadDraft: (draft: Draft) => void;
  onClose: () => void;
}

export const WorkDrafts = ({ onLoadDraft, onClose }: WorkDraftsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const fetchDrafts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('work_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Error loading drafts",
        variant: "destructive",
      });
    } else {
      setDrafts(data || []);
    }
    setLoading(false);
  };

  const handleDeleteDraft = async (id: string) => {
    const { error } = await supabase
      .from('work_drafts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting draft",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Draft deleted",
      });
      fetchDrafts();
    }
    setDeleteId(null);
  };

  const handleLoadDraft = (draft: Draft) => {
    onLoadDraft(draft);
    onClose();
    toast({
      title: "Draft loaded",
      description: "Continue editing your work",
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Loading drafts...</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No drafts found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-96 overflow-y-auto p-4">
        {drafts.map((draft) => (
          <Card
            key={draft.id}
            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => handleLoadDraft(draft)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {draft.title || "Untitled Draft"}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {draft.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {draft.work_type && (
                    <Badge variant="secondary" className="text-xs">
                      {draft.work_type}
                    </Badge>
                  )}
                  {draft.work_style && (
                    <Badge variant="secondary" className="text-xs">
                      {draft.work_style}
                    </Badge>
                  )}
                  {draft.file_name && (
                    <Badge variant="outline" className="text-xs">
                      {draft.file_name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistance(new Date(draft.updated_at), new Date(), { addSuffix: true })}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(draft.id);
                }}
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteDraft(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};