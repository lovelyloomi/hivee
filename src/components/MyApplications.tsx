import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
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

interface Application {
  id: string;
  motivation: string;
  status: string;
  created_at: string;
  opportunities: {
    artist_type: string;
    description: string;
    payment: string;
  };
}

export const MyApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities (
            artist_type,
            description,
            payment
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelDialog.id) return;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', cancelDialog.id);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== cancelDialog.id));
      toast({
        title: "Successo",
        description: "Candidatura annullata con successo"
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCancelDialog({ open: false, id: null });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna candidatura</h3>
            <p className="text-muted-foreground">Non hai ancora inviato candidature</p>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{app.opportunities.artist_type}</Badge>
                    <Badge variant={
                      app.status === 'pending' ? 'outline' :
                      app.status === 'accepted' ? 'default' : 'destructive'
                    }>
                      {app.status === 'pending' ? 'In attesa' :
                       app.status === 'accepted' ? 'Accettato' : 'Rifiutato'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {app.opportunities.description}
                  </p>
                  <p className="text-sm mb-3">
                    <strong>La tua motivazione:</strong> {app.motivation}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>💰 {app.opportunities.payment}</span>
                    <span>📅 {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                {app.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCancelDialog({ open: true, id: app.id })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annullare la candidatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione annullerà la tua candidatura per questa opportunità. Non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Chiudi</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Annulla candidatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
