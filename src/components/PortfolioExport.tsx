import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";

export const PortfolioExport = () => {
  const [includeBio, setIncludeBio] = useState(true);
  const [includeWorks, setIncludeWorks] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);

  const handleExportPDF = () => {
    toast.info("PDF export coming soon!");
  };

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/portfolio/${crypto.randomUUID()}`;
    navigator.clipboard.writeText(link);
    toast.success("Shareable link copied to clipboard!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Include in export:</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio & Skills</Label>
              <Switch id="bio" checked={includeBio} onCheckedChange={setIncludeBio} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="works">Portfolio Works</Label>
              <Switch id="works" checked={includeWorks} onCheckedChange={setIncludeWorks} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="contact">Contact Information</Label>
              <Switch id="contact" checked={includeContact} onCheckedChange={setIncludeContact} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleExportPDF} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
            <Button onClick={handleGenerateLink} variant="outline" className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              Generate Shareable Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
