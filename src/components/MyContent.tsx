import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Image, Trash2, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { MyApplications } from "./MyApplications";

interface Opportunity {
  id: string;
  artist_type: string;
  description: string;
  payment: string;
  work_type: string | null;
  created_at: string;
}

interface Work {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  work_type: string | null;
  work_style: string | null;
  made_with_ai: boolean;
  nsfw: boolean;
  created_at: string;
}

export const MyContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'opportunity' | 'work' | null;
    id: string | null;
  }>({ open: false, type: null, id: null });

  useEffect(() => {
    if (user) {
      fetchMyContent();
    }
  }, [user]);

  const fetchMyContent = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch opportunities
      const { data: oppsData, error: oppsError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (oppsError) throw oppsError;
      setOpportunities(oppsData || []);

      // Fetch works
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (worksError) throw worksError;
      setWorks(worksData || []);
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;

    try {
      if (deleteDialog.type === 'opportunity') {
        const { error } = await supabase
          .from('opportunities')
          .delete()
          .eq('id', deleteDialog.id);

        if (error) throw error;
        setOpportunities(opportunities.filter(opp => opp.id !== deleteDialog.id));
        toast({
          title: "Successo",
          description: "Opportunità eliminata con successo"
        });
      } else {
        const { error } = await supabase
          .from('works')
          .delete()
          .eq('id', deleteDialog.id);

        if (error) throw error;
        setWorks(works.filter(work => work.id !== deleteDialog.id));
        toast({
          title: "Successo",
          description: "Lavoro eliminato con successo"
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteDialog({ open: false, type: null, id: null });
    }
  };


  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">
            <Briefcase className="mr-2 h-4 w-4" />
            Opportunità ({opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="works">
            <Image className="mr-2 h-4 w-4" />
            Lavori ({works.length})
          </TabsTrigger>
          <TabsTrigger value="applications">
            <Briefcase className="mr-2 h-4 w-4" />
            Candidature
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna opportunità</h3>
              <p className="text-muted-foreground">Non hai ancora pubblicato opportunità</p>
            </Card>
          ) : (
            opportunities.map((opp) => (
              <Card key={opp.id} className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{opp.artist_type}</Badge>
                      {opp.work_type && <Badge variant="outline">{opp.work_type}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{opp.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>💰 {opp.payment}</span>
                      <span>📅 {formatDistanceToNow(new Date(opp.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, type: 'opportunity', id: opp.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="works" className="space-y-4">
          {works.length === 0 ? (
            <Card className="p-8 text-center">
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun lavoro</h3>
              <p className="text-muted-foreground">Non hai ancora caricato lavori</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {works.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={work.file_url}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                    {work.nsfw && (
                      <Badge className="absolute top-2 left-2" variant="destructive">
                        NSFW
                      </Badge>
                    )}
                    {work.made_with_ai && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{work.title}</h3>
                    {work.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {work.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      {work.work_type && <Badge variant="outline">{work.work_type}</Badge>}
                      {work.work_style && <Badge variant="secondary">{work.work_style}</Badge>}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(work.created_at), { addSuffix: true })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialog({ open: true, type: 'work', id: work.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <MyApplications />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'opportunity' 
                ? "Questa azione eliminerà definitivamente l'opportunità. Non può essere annullata."
                : "Questa azione eliminerà definitivamente il lavoro. Non può essere annullata."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
