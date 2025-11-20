import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Application {
  id: string;
  motivation: string;
  portfolio_url: string | null;
  cv_url: string | null;
  status: string;
  conversation_id: string | null;
  applicant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  opportunity: {
    id: string;
    description: string;
    artist_type: string;
  };
}

interface ApplicationsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const ApplicationsList = ({ open, onOpenChange, userId }: ApplicationsListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open]);

  const fetchApplications = async () => {
    try {
      // First get opportunity IDs
      const { data: opps } = await supabase
        .from('opportunities')
        .select('id')
        .eq('creator_id', userId);

      const oppIds = opps?.map(o => o.id) || [];

      if (oppIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicant:profiles!applications_applicant_id_fkey(id, full_name, avatar_url),
          opportunity:opportunities!applications_opportunity_id_fkey(id, description, artist_type)
        `)
        .in('opportunity_id', oppIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading applications",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: Application) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', application.id);

      if (updateError) throw updateError;

      toast({
        title: "Application approved!",
        description: "You can now chat with the applicant."
      });

      // Navigate to chat
      if (application.conversation_id) {
        navigate(`/chat?conversationId=${application.conversation_id}`);
      }

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error approving application",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application rejected",
        description: "The applicant has been notified."
      });

      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error rejecting application",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openChat = (conversationId: string) => {
    navigate(`/chat?conversationId=${conversationId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Applications to Your Opportunities</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No applications yet
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-4 border-border">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={application.applicant.avatar_url || ''} />
                    <AvatarFallback>
                      {application.applicant.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {application.applicant.full_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Applied for: {application.opportunity.artist_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(application.id)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(application)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {application.status === 'approved' && application.conversation_id && (
                          <Button
                            size="sm"
                            onClick={() => openChat(application.conversation_id!)}
                          >
                            Open Chat
                          </Button>
                        )}
                        {application.status === 'rejected' && (
                          <span className="text-sm text-destructive">Rejected</span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-foreground">
                      {application.motivation}
                    </p>

                    <div className="flex gap-3">
                      {application.portfolio_url && (
                        <a
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Portfolio
                        </a>
                      )}
                      {application.cv_url && (
                        <a
                          href={application.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          CV
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
