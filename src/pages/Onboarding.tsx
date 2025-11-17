import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WatermarkCreator } from "@/components/WatermarkCreator";
import { WorkPortfolioUploader } from "@/components/WorkPortfolioUploader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const commonPrograms = [
  // 3D Software
  "Blender", "Maya", "3ds Max", "Cinema 4D", "Houdini", "ZBrush",
  // Adobe Suite
  "Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects", "Adobe Premiere Pro",
  "Adobe InDesign", "Adobe XD", "Adobe Animate", "Adobe Substance Painter",
  "Adobe Substance Designer", "Adobe Dimension",
  // Painting & Drawing
  "Procreate", "Clip Studio Paint", "Krita", "ArtRage", "Corel Painter",
  // Game Engines
  "Unreal Engine", "Unity", "Godot", "CryEngine",
  // Other Tools
  "Substance Painter", "Marvelous Designer", "SpeedTree", "Mudbox",
  "SketchUp", "Rhino", "KeyShot", "V-Ray", "Arnold", "Redshift",
  "Octane Render", "Affinity Designer", "Affinity Photo"
];

const commonSkills = [
  "3D Modeling", "Animation", "Texturing", "Rigging", "Lighting",
  "Compositing", "VFX", "Character Design", "Environment Design",
  "Concept Art", "Illustration", "Digital Painting", "UI/UX Design",
  "Motion Graphics", "Video Editing", "Game Design", "Sculpting"
];

const Onboarding = () => {
  const { user, checkProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkUrl, setWatermarkUrl] = useState<string>();
  const [workImages, setWorkImages] = useState<File[]>([]);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [programInput, setProgramInput] = useState("");

  const handleWatermarkCreated = useCallback((text: string, url?: string) => {
    setWatermarkText(text);
    setWatermarkUrl(url);
    setStep(2);
  }, []);

  const handleSkipWatermark = useCallback(() => {
    setStep(2);
  }, []);

  const handleImagesReady = useCallback((images: File[]) => {
    setWorkImages(images);
  }, []);

  const addSkill = useCallback(() => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput("");
    }
  }, [skillInput, skills]);

  const addProgram = useCallback(() => {
    if (programInput.trim() && !programs.includes(programInput.trim())) {
      setPrograms(prev => [...prev, programInput.trim()]);
      setProgramInput("");
    }
  }, [programInput, programs]);

  const removeSkill = useCallback((index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeProgram = useCallback((index: number) => {
    setPrograms(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const uploadedImageUrls: string[] = [];

      // Upload watermark if it's an image
      let watermarkStorageUrl: string | undefined;
      if (watermarkUrl && watermarkUrl.startsWith('blob:')) {
        const watermarkBlob = await fetch(watermarkUrl).then(r => r.blob());
        const watermarkFile = new File([watermarkBlob], 'watermark.png', { type: 'image/png' });
        const watermarkPath = `${user.id}/watermark.png`;
        
        const { error: watermarkError } = await supabase.storage
          .from('watermarks')
          .upload(watermarkPath, watermarkFile, { upsert: true });

        if (!watermarkError) {
          const { data } = supabase.storage.from('watermarks').getPublicUrl(watermarkPath);
          watermarkStorageUrl = data.publicUrl;
        }
      }

      // Upload work images
      for (let i = 0; i < workImages.length; i++) {
        const file = workImages[i];
        const filePath = `${user.id}/${Date.now()}-${i}.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('work-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('work-images').getPublicUrl(filePath);
          uploadedImageUrls.push(data.publicUrl);
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          location,
          skills,
          programs,
          watermark_text: watermarkText || null,
          watermark_url: watermarkStorageUrl || null,
          work_images: uploadedImageUrls,
          birth_date: user.user_metadata?.birth_date || null,
          profile_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile completion status
      await checkProfileCompletion();
      
      toast({ title: "Profile completed successfully!" });
      navigate('/');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error completing profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <WatermarkCreator onWatermarkCreated={handleWatermarkCreated} />
            <Button
              variant="outline"
              onClick={handleSkipWatermark}
              className="w-full"
            >
              Skip Watermark (Not Recommended)
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <WorkPortfolioUploader
              watermarkText={watermarkText}
              watermarkUrl={watermarkUrl}
              onImagesReady={handleImagesReady}
            />
            <Button
              onClick={() => setStep(3)}
              disabled={workImages.length === 0}
              className="w-full bg-gradient-primary text-white hover:opacity-90"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-6 space-y-4 bg-card border-border">
              <div>
                <Label htmlFor="bio" className="text-foreground">Bio (max 800 characters)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 800))}
                  placeholder="Tell others about yourself and your work..."
                  rows={5}
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/800 characters</p>
              </div>

              <div>
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="skills" className="text-foreground">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    className="bg-background border-border text-foreground"
                  />
                  <Button onClick={addSkill} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {commonSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (skills.includes(skill)) {
                          setSkills(prev => prev.filter(s => s !== skill));
                        } else {
                          setSkills(prev => [...prev, skill]);
                        }
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.filter(s => !commonSkills.includes(s)).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeSkill(skills.indexOf(skill))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="programs" className="text-foreground">Programs & Software</Label>
                <div className="flex gap-2">
                  <Input
                    id="programs"
                    value={programInput}
                    onChange={(e) => setProgramInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProgram())}
                    placeholder="Add a program"
                    className="bg-background border-border text-foreground"
                  />
                  <Button onClick={addProgram} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {commonPrograms.map((program) => (
                    <Badge
                      key={program}
                      variant={programs.includes(program) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (programs.includes(program)) {
                          setPrograms(prev => prev.filter(p => p !== program));
                        } else {
                          setPrograms(prev => [...prev, program]);
                        }
                      }}
                    >
                      {program}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {programs.filter(p => !commonPrograms.includes(p)).map((program, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {program}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeProgram(programs.indexOf(program))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Button
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-gradient-primary text-white hover:opacity-90"
            >
              {loading ? "Completing..." : "Complete Profile"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
