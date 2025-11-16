import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReportWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string;
  workOwnerId: string;
}

export const ReportWorkDialog = ({ open, onOpenChange, workId, workOwnerId }: ReportWorkDialogProps) => {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: workOwnerId,
        reason: 'nsfw_not_flagged',
        description: `NSFW content not flagged - Work ID: ${workId}. ${description}`
      });

    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted successfully. Thank you for helping keep our community safe.");
      onOpenChange(false);
      setDescription("");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report NSFW Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will report the content as NSFW that wasn't properly flagged. Our team will review this report.
          </p>

          <div>
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional information about why this should be flagged as NSFW..."
              className="min-h-24"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
