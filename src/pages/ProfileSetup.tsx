import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  const [username, setUsername] = useState("");
  const [displayNamePreference, setDisplayNamePreference] = useState<"real_name" | "username">("real_name");
  const [portfolioType, setPortfolioType] = useState<"link" | "pdf">("link");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleUsernameCheck = async (value: string) => {
    const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanUsername);

    if (cleanUsername.length >= 3) {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (data) {
        toast({
          title: "Username non disponibile",
          description: "Questo username è già in uso",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length + workImages.length > 10) {
      toast({
        title: "Limite raggiunto",
        description: "Puoi caricare massimo 10 immagini",
        variant: "destructive"
      });
      return;
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('work-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('work-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setWorkImages([...workImages, ...uploadedUrls]);
      toast({
        title: "Immagini caricate",
        description: `${uploadedUrls.length} immagini aggiunte al tuo portfolio`
      });
    } catch (error: any) {
      toast({
        title: "Errore caricamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioFile) return "";

    setUploadingPortfolio(true);
    try {
      const fileExt = portfolioFile.name.split('.').pop();
      const fileName = `${user?.id}/portfolio_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(fileName, portfolioFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Errore caricamento portfolio",
        description: error.message,
        variant: "destructive"
      });
      return "";
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const removeImage = (index: number) => {
    setWorkImages(workImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      toast({
        title: "Username richiesto",
        description: "Inserisci un username di almeno 3 caratteri",
        variant: "destructive"
      });
      return;
    }

    if (workImages.length === 0) {
      toast({
        title: "Immagini richieste",
        description: "Carica almeno 1 immagine per completare il profilo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let finalPortfolioUrl = portfolioUrl;
      
      if (portfolioType === 'pdf' && portfolioFile) {
        finalPortfolioUrl = await handlePortfolioUpload();
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          display_name_preference: displayNamePreference,
          portfolio_url: finalPortfolioUrl || null,
          work_images: workImages,
          profile_completed: true
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profilo salvato!",
        description: "Procedi con i termini e condizioni"
      });

      navigate("/terms-and-conditions");
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-3xl mx-auto px-4 py-8 pt-24">
        <Card className="p-8 space-y-6 bg-card border-border">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Completa il tuo Profilo
            </h1>
            <p className="text-muted-foreground">
              Configura il tuo profilo per iniziare a fare networking
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="es. artista_123"
                  value={username}
                  onChange={(e) => handleUsernameCheck(e.target.value)}
                  pattern="[a-z0-9_]{3,20}"
                  required
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  3-20 caratteri, solo lettere minuscole, numeri e underscore
                </p>
              </div>

              <div className="space-y-3">
                <Label>Come vuoi essere visualizzato?</Label>
                <RadioGroup
                  value={displayNamePreference}
                  onValueChange={(value) => setDisplayNamePreference(value as "real_name" | "username")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="real_name" id="real_name" />
                    <Label htmlFor="real_name" className="cursor-pointer">
                      Nome e Cognome reali
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="username" id="username_display" />
                    <Label htmlFor="username_display" className="cursor-pointer">
                      Username (nickname)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-4">
              <Label>Portfolio</Label>
              <RadioGroup
                value={portfolioType}
                onValueChange={(value) => setPortfolioType(value as "link" | "pdf")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="portfolio_link" />
                  <Label htmlFor="portfolio_link" className="cursor-pointer">
                    Link esterno
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="portfolio_pdf" />
                  <Label htmlFor="portfolio_pdf" className="cursor-pointer">
                    Carica PDF
                  </Label>
                </div>
              </RadioGroup>

              {portfolioType === 'link' ? (
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://portfolio.com/tuolink"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
                    className="bg-background border-border text-foreground"
                  />
                  {portfolioFile && (
                    <p className="text-sm text-muted-foreground">
                      File selezionato: {portfolioFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Work Images Section */}
            <div className="space-y-4">
              <div>
                <Label>Galleria Lavori * (max 10 immagini)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Carica le tue migliori opere per mostrarti agli altri utenti
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Work ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {workImages.length < 10 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      disabled={uploadingImages}
                    />
                    {uploadingImages ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Carica immagini
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {workImages.length}/10 immagini caricate
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || uploadingImages || uploadingPortfolio}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completamento...
                </>
              ) : (
                "Completa Profilo"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
