import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Link as LinkIcon, X, Loader2, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { WatermarkSettings } from "./WatermarkSettings";

const urlSchema = z.string().url().optional().or(z.literal(""));

interface ProfileEditorProps {
  onSave?: () => void;
}

export const ProfileEditor = ({ onSave }: ProfileEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  // Basic profile info
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [displayNamePreference, setDisplayNamePreference] = useState<"real_name" | "username">("real_name");
  const [portfolioType, setPortfolioType] = useState<"link" | "pdf">("link");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [programInput, setProgramInput] = useState("");

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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        setUsername(data.username || "");
        setDisplayNamePreference((data.display_name_preference as "real_name" | "username") || "real_name");
        setPortfolioUrl(data.portfolio_url || "");
        setWorkImages(data.work_images || []);
        setSkills(data.skills || []);
        setPrograms(data.programs || []);
        setInstagramUrl(data.instagram_url || "");
        setBehanceUrl(data.behance_url || "");
        setArtstationUrl(data.artstation_url || "");
        setLinkedinUrl(data.linkedin_url || "");
        setTwitterUrl(data.twitter_url || "");
        setWebsiteUrl(data.website_url || "");
        setArtistSpecialization(data.artist_specialization || "");
        setEducationLevel(data.education_level || "");
        setLanguages(data.languages || []);
        setYearsOfExperience(data.years_of_experience?.toString() || "");
        setAvailabilityStatus(data.availability_status || "open_to_opportunities");
        setPreferredWorkTypes(data.preferred_work_types || []);
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
        .not('id', 'eq', user?.id)
        .maybeSingle();

      if (data) {
        toast({
          title: "Username taken",
          description: "Please choose a different username",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    
    setUploadingImages(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 9 - workImages.length); i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('work-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('work-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      setWorkImages([...workImages, ...newImageUrls]);
      toast({
        title: "Success!",
        description: "Images uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setWorkImages(workImages.filter((_, i) => i !== index));
  };

  const handlePortfolioUpload = async (file: File) => {
    if (!user) return;
    
    setUploadingPortfolio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/portfolio.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName);

      setPortfolioUrl(publicUrl);
      toast({
        title: "Success!",
        description: "Portfolio uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && skills.length < 10) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProgram = () => {
    if (programInput.trim() && programs.length < 10) {
      setPrograms([...programs, programInput.trim()]);
      setProgramInput("");
    }
  };

  const removeProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (languageInput.trim() && languages.length < 10) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addWorkType = () => {
    if (workTypeInput.trim() && preferredWorkTypes.length < 10) {
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
      website: websiteUrl,
      portfolio: portfolioType === "link" ? portfolioUrl : ""
    };

    for (const [key, url] of Object.entries(urls)) {
      if (url && url.trim() !== "") {
        try {
          urlSchema.parse(url);
        } catch {
          toast({
            title: "Invalid URL",
            description: `Please enter a valid URL for ${key}`,
            variant: "destructive"
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!user) return;

    if (!validateUrls()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username || null,
          full_name: fullName || null,
          bio: bio || null,
          location: location || null,
          display_name_preference: displayNamePreference,
          portfolio_url: portfolioUrl || null,
          work_images: workImages.length > 0 ? workImages : null,
          skills: skills.length > 0 ? skills : null,
          programs: programs.length > 0 ? programs : null,
          instagram_url: instagramUrl || null,
          behance_url: behanceUrl || null,
          artstation_url: artstationUrl || null,
          linkedin_url: linkedinUrl || null,
          twitter_url: twitterUrl || null,
          website_url: websiteUrl || null,
          artist_specialization: artistSpecialization || null,
          education_level: educationLevel || null,
          languages: languages.length > 0 ? languages : null,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          availability_status: availabilityStatus,
          preferred_work_types: preferredWorkTypes.length > 0 ? preferredWorkTypes : null,
          profile_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo salvato!",
        description: "Le tue modifiche sono state salvate con successo"
      });

      if (onSave) onSave();
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
    <div className="space-y-6 pb-20">
      {/* Watermark Settings - Place this first or in appropriate section */}
      <WatermarkSettings />

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni Base</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Il tuo nome completo"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameCheck(e.target.value)}
              placeholder="username_unico"
            />
          </div>

          <div>
            <Label>Mostra come</Label>
            <RadioGroup value={displayNamePreference} onValueChange={(value: any) => setDisplayNamePreference(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real_name" id="real_name" />
                <Label htmlFor="real_name">Nome Reale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="username" id="username_pref" />
                <Label htmlFor="username_pref">Username</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Raccontaci di te..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="location">Località</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Città, Paese"
            />
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Competenze</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Aggiungi una competenza"
            />
            <Button type="button" onClick={addSkill}>Aggiungi</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
                <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeSkill(index)} />
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Programs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Programmi</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProgram())}
              placeholder="Aggiungi un programma"
            />
            <Button type="button" onClick={addProgram}>Aggiungi</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {programs.map((program, index) => (
              <Badge key={index} variant="secondary">
                {program}
                <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeProgram(index)} />
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Professional Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni Professionali</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="specialization">Specializzazione Artistica</Label>
            <Input
              id="specialization"
              value={artistSpecialization}
              onChange={(e) => setArtistSpecialization(e.target.value)}
              placeholder="es. 3D Artist, Animator, Illustrator"
            />
          </div>

          <div>
            <Label htmlFor="education">Livello di Istruzione</Label>
            <Select value={educationLevel} onValueChange={setEducationLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona livello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">Diploma</SelectItem>
                <SelectItem value="bachelor">Laurea Triennale</SelectItem>
                <SelectItem value="master">Laurea Magistrale</SelectItem>
                <SelectItem value="self_taught">Autodidatta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience">Anni di Esperienza</Label>
            <Input
              id="experience"
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="availability">Stato Disponibilità</Label>
            <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_to_opportunities">Aperto a Opportunità</SelectItem>
                <SelectItem value="busy">Occupato</SelectItem>
                <SelectItem value="not_looking">Non Cerco</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lingue</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                placeholder="Aggiungi una lingua"
              />
              <Button type="button" onClick={addLanguage}>Aggiungi</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
                <Badge key={index} variant="secondary">
                  {language}
                  <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeLanguage(index)} />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Tipi di Lavoro Preferiti</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={workTypeInput}
                onChange={(e) => setWorkTypeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWorkType())}
                placeholder="es. Freelance, Part-time, Full-time"
              />
              <Button type="button" onClick={addWorkType}>Aggiungi</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferredWorkTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                  <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeWorkType(index)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Social Media Links */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Social Media</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="instagram">
              <Instagram className="inline h-4 w-4 mr-2" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <Label htmlFor="behance">
              <Globe className="inline h-4 w-4 mr-2" />
              Behance
            </Label>
            <Input
              id="behance"
              value={behanceUrl}
              onChange={(e) => setBehanceUrl(e.target.value)}
              placeholder="https://behance.net/..."
            />
          </div>

          <div>
            <Label htmlFor="artstation">
              <Globe className="inline h-4 w-4 mr-2" />
              ArtStation
            </Label>
            <Input
              id="artstation"
              value={artstationUrl}
              onChange={(e) => setArtstationUrl(e.target.value)}
              placeholder="https://artstation.com/..."
            />
          </div>

          <div>
            <Label htmlFor="linkedin">
              <Linkedin className="inline h-4 w-4 mr-2" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <Label htmlFor="twitter">
              <Twitter className="inline h-4 w-4 mr-2" />
              Twitter/X
            </Label>
            <Input
              id="twitter"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <Label htmlFor="website">
              <Globe className="inline h-4 w-4 mr-2" />
              Sito Web Personale
            </Label>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </Card>

      {/* Portfolio */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
        <div className="space-y-4">
          <RadioGroup value={portfolioType} onValueChange={(value: any) => setPortfolioType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="link" id="link" />
              <Label htmlFor="link">Link al Portfolio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf">Carica PDF</Label>
            </div>
          </RadioGroup>

          {portfolioType === "link" ? (
            <div>
              <Label htmlFor="portfolio-link">URL Portfolio</Label>
              <Input
                id="portfolio-link"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="portfolio-file">File Portfolio (PDF)</Label>
              <Input
                id="portfolio-file"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPortfolioFile(file);
                    handlePortfolioUpload(file);
                  }
                }}
                disabled={uploadingPortfolio}
              />
              {uploadingPortfolio && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Caricamento...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Work Images */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Immagini Lavori</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="work-images">Carica Immagini (max 9)</Label>
            <Input
              id="work-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploadingImages || workImages.length >= 9}
            />
            {uploadingImages && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Caricamento immagini...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {workImages.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={`Work ${index + 1}`} className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Salva Modifiche
        </Button>
      </div>
    </div>
  );
};
