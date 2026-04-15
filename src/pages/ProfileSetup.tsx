import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Upload, Link as LinkIcon, X, Loader2, Globe, Instagram, Linkedin, Twitter, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProfilePreview } from "@/components/ProfilePreview";
import { z } from "zod";

// Validation schema for URLs
const urlSchema = z.string().url().optional().or(z.literal(""));

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  // Basic profile info
  const [username, setUsername] = useState("");
  const [displayNamePreference, setDisplayNamePreference] = useState<"real_name" | "username">("real_name");
  const [portfolioType, setPortfolioType] = useState<"link" | "pdf">("link");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Social media links
  const [instagramUrl, setInstagramUrl] = useState("");
  const [behanceUrl, setBehanceUrl] = useState("");
  const [artstationUrl, setArtstationUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Professional information
  const [artistSpecialization, setArtistSpecialization] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("open_to_opportunities");
  const [preferredWorkTypes, setPreferredWorkTypes] = useState<string[]>([]);
  const [workTypeInput, setWorkTypeInput] = useState("");

  // Profile data for preview
  const [profile, setProfile] = useState<any>({
    full_name: '',
    bio: '',
    location: '',
    skills: [],
    programs: []
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, location, skills, programs')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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

  const addLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addWorkType = () => {
    if (workTypeInput.trim() && !preferredWorkTypes.includes(workTypeInput.trim())) {
      setPreferredWorkTypes([...preferredWorkTypes, workTypeInput.trim()]);
      setWorkTypeInput("");
    }
  };

  const removeWorkType = (index: number) => {
    setPreferredWorkTypes(preferredWorkTypes.filter((_, i) => i !== index));
  };

  const validateUrls = () => {
    const urls = {
      instagram: instagramUrl,
      behance: behanceUrl,
      artstation: artstationUrl,
      linkedin: linkedinUrl,
      twitter: twitterUrl,
      website: websiteUrl
    };

    for (const [platform, url] of Object.entries(urls)) {
      if (url) {
        try {
          urlSchema.parse(url);
        } catch {
          toast({
            title: "URL non valido",
            description: `L'URL di ${platform} non è valido`,
            variant: "destructive"
          });
          return false;
        }
      }
    }
    return true;
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

    if (!validateUrls()) {
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
          // Social media
          instagram_url: instagramUrl || null,
          behance_url: behanceUrl || null,
          artstation_url: artstationUrl || null,
          linkedin_url: linkedinUrl || null,
          twitter_url: twitterUrl || null,
          website_url: websiteUrl || null,
          // Professional info
          artist_specialization: artistSpecialization || null,
          education_level: educationLevel || null,
          languages: languages.length > 0 ? languages : null,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          availability_status: availabilityStatus,
          preferred_work_types: preferredWorkTypes.length > 0 ? preferredWorkTypes : null,
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
    <div className="min-h-screen bg-background pt-16">
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

            {/* Professional Information Section */}
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-foreground">Informazioni Professionali</h2>
              
              {/* Artist Specialization */}
              <div className="space-y-2">
                <Label htmlFor="specialization">Specializzazione Artistica</Label>
                <Input
                  id="specialization"
                  type="text"
                  placeholder="es. Character Design, 3D Modeling, Illustration"
                  value={artistSpecialization}
                  onChange={(e) => setArtistSpecialization(e.target.value)}
                  className="bg-background border-border text-foreground"
                  maxLength={100}
                />
              </div>

              {/* Education Level */}
              <div className="space-y-2">
                <Label htmlFor="education">Livello di Istruzione</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Seleziona il tuo livello di istruzione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_taught">Autodidatta</SelectItem>
                    <SelectItem value="high_school">Scuola Superiore</SelectItem>
                    <SelectItem value="bootcamp">Bootcamp</SelectItem>
                    <SelectItem value="online_courses">Corsi Online</SelectItem>
                    <SelectItem value="associate">Laurea Triennale</SelectItem>
                    <SelectItem value="bachelor">Laurea</SelectItem>
                    <SelectItem value="master">Magistrale</SelectItem>
                    <SelectItem value="doctorate">Dottorato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Anni di Esperienza</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Availability Status */}
              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilità</Label>
                <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open_to_opportunities">Aperto a Opportunità</SelectItem>
                    <SelectItem value="available_for_freelance">Disponibile per Freelance</SelectItem>
                    <SelectItem value="full_time_only">Solo Full-Time</SelectItem>
                    <SelectItem value="not_available">Non Disponibile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Lingue</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="es. Italiano, Inglese"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="bg-background border-border text-foreground"
                  />
                  <Button type="button" onClick={addLanguage} variant="secondary">
                    Aggiungi
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {languages.map((lang, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {lang}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLanguage(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferred Work Types */}
              <div className="space-y-2">
                <Label>Tipi di Lavoro Preferiti</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="es. Commissioni, Progetti a Lungo Termine"
                    value={workTypeInput}
                    onChange={(e) => setWorkTypeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWorkType())}
                    className="bg-background border-border text-foreground"
                  />
                  <Button type="button" onClick={addWorkType} variant="secondary">
                    Aggiungi
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferredWorkTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeWorkType(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-foreground">Social Media & Portfolio</h2>
              <p className="text-sm text-muted-foreground">
                Connetti i tuoi account social e portfolio per far vedere il tuo lavoro
              </p>

              <div className="grid gap-4">
                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/tuousername"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Behance */}
                <div className="space-y-2">
                  <Label htmlFor="behance" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Behance
                  </Label>
                  <Input
                    id="behance"
                    type="url"
                    placeholder="https://behance.net/tuousername"
                    value={behanceUrl}
                    onChange={(e) => setBehanceUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* ArtStation */}
                <div className="space-y-2">
                  <Label htmlFor="artstation" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    ArtStation
                  </Label>
                  <Input
                    id="artstation"
                    type="url"
                    placeholder="https://artstation.com/tuousername"
                    value={artstationUrl}
                    onChange={(e) => setArtstationUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/tuousername"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Twitter/X */}
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    type="url"
                    placeholder="https://twitter.com/tuousername"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Personal Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Sito Web Personale
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://tuosito.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Preview Button and Submit */}
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Anteprima Profilo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                  <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <DialogHeader>
                    <DialogTitle>Anteprima del Tuo Profilo</DialogTitle>
                  </DialogHeader>
                  <ProfilePreview
                    username={username}
                    fullName={profile.full_name}
                    bio={profile.bio}
                    location={profile.location}
                    workImages={workImages}
                    portfolioUrl={portfolioType === 'link' ? portfolioUrl : undefined}
                    instagramUrl={instagramUrl}
                    behanceUrl={behanceUrl}
                    artstationUrl={artstationUrl}
                    linkedinUrl={linkedinUrl}
                    twitterUrl={twitterUrl}
                    websiteUrl={websiteUrl}
                    artistSpecialization={artistSpecialization}
                    educationLevel={educationLevel}
                    languages={languages}
                    yearsOfExperience={yearsOfExperience ? parseInt(yearsOfExperience) : undefined}
                    availabilityStatus={availabilityStatus}
                    preferredWorkTypes={preferredWorkTypes}
                    skills={profile.skills}
                    programs={profile.programs}
                  />
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                type="submit"
                className="flex-1"
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
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
