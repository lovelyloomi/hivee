import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  userId: string;
}

export const ApplicationDialog = ({ open, onOpenChange, opportunityId, userId }: ApplicationDialogProps) => {
  const { toast } = useToast();
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [motivation, setMotivation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "CV must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motivation.trim()) {
      toast({
        title: "Motivation required",
        description: "Please write a motivational text",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let cvUrl = null;

      // Upload CV if provided
      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('applications')
          .upload(fileName, cvFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('applications')
          .getPublicUrl(fileName);
        
        cvUrl = publicUrl;
      }

      // Create application
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          applicant_id: userId,
          portfolio_url: portfolioUrl || null,
          cv_url: cvUrl,
          motivation: motivation
        });

      if (insertError) throw insertError;

      toast({
        title: "Application submitted!",
        description: "The opportunity creator will review your application."
      });

      onOpenChange(false);
      setPortfolioUrl("");
      setMotivation("");
      setCvFile(null);
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Submit Your Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Portfolio URL (optional)
            </label>
            <Input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Upload CV (optional, max 5MB)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
                className="bg-background border-border text-foreground"
              />
              {cvFile && (
                <span className="text-sm text-muted-foreground">{cvFile.name}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Motivational Letter *
            </label>
            <Textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Tell them why you're perfect for this opportunity..."
              className="min-h-[150px] bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={uploading}>
              {uploading ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
