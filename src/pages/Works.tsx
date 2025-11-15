import { useState, useEffect } from "react";
import { Plus, Search, Upload, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorkDetailDialog from "@/components/WorkDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { applyWatermark } from "@/utils/watermark";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { calculateDistance, formatDistance } from "@/utils/distance";

type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    latitude: number | null;
    longitude: number | null;
    location_enabled: boolean | null;
  } | null;
};

export default function Works() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [works, setWorks] = useState<Work[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newWork, setNewWork] = useState({
    title: "",
    description: "",
    hashtags: "",
  });

  useEffect(() => {
    fetchWorks();
    setupRealtimeSubscription();
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  const fetchUserLocation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single();

    if (data?.latitude && data?.longitude) {
      setUserLocation({ latitude: data.latitude, longitude: data.longitude });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('works-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'works',
        },
        () => {
          fetchWorks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchWorks = async () => {
    const { data } = await supabase
      .from('works')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          latitude,
          longitude,
          location_enabled
        )
      `)
      .order('created_at', { ascending: false });

    if (data) setWorks(data as Work[]);
  };

  const allHashtags = Array.from(
    new Set(works.flatMap(work => work.hashtags || []))
  );

  const filteredWorks = works.filter(work => {
    const matchesSearch = 
      work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (work.hashtags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesHashtags = selectedHashtags.length === 0 ||
      selectedHashtags.every(selectedTag => (work.hashtags || []).includes(selectedTag));
    
    return matchesSearch && matchesHashtags;
  });

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getFileType = (file: File): Database['public']['Enums']['work_file_type'] => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(ext || '')) return 'video';
    if (ext === 'fbx') return 'model_3d';
    return 'image';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Video max 60s check would require video loading, skip for now
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        toast({ title: 'File too large', description: 'Maximum file size is 50MB', variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !file || !newWork.title) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      const fileType = getFileType(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      let fileToUpload = file;

      // Apply watermark to images
      if (fileType === 'image') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('watermark_text, watermark_url')
          .eq('id', user.id)
          .single();

        if (profile?.watermark_text || profile?.watermark_url) {
          const watermarkedBlob = await applyWatermark(
            file,
            profile.watermark_text || '',
            profile.watermark_url || undefined
          );
          fileToUpload = new File([watermarkedBlob], file.name, { type: file.type });
        }
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('works')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('works')
        .getPublicUrl(fileName);

      const hashtags = newWork.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const { data: profile } = await supabase
        .from('profiles')
        .select('watermark_url')
        .eq('id', user.id)
        .single();

      const { error: insertError } = await supabase
        .from('works')
        .insert({
          user_id: user.id,
          title: newWork.title,
          description: newWork.description,
          file_url: publicUrl,
          file_type: fileType,
          watermark_url: profile?.watermark_url,
          hashtags,
        });

      if (insertError) throw insertError;

      toast({ title: 'Work uploaded successfully!' });
      setNewWork({ title: "", description: "", hashtags: "" });
      setFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-foreground mb-6">Works</h1>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shrink-0">
                <Plus className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Work</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file">File (JPG, PNG, PDF, FBX, Video)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.fbx,.mp4,.webm"
                    onChange={handleFileChange}
                    required
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Work title"
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your work..."
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hashtags">Hashtags (max 5)</Label>
                  <Input
                    id="hashtags"
                    placeholder="digitalart, 3d, animation (comma separated)"
                    value={newWork.hashtags}
                    onChange={(e) => setNewWork({ ...newWork, hashtags: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate with commas, max 5 hashtags
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {allHashtags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {allHashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedHashtags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleHashtag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <Card
              key={work.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedWork(work)}
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {work.file_type === 'image' ? (
                  <div className="relative w-full h-full">
                    <img
                      src={work.file_url}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                    {work.watermark_url && (
                      <img
                        src={work.watermark_url}
                        alt="Watermark"
                        className="absolute bottom-2 right-2 w-16 h-auto opacity-50"
                      />
                    )}
                  </div>
                ) : work.file_type === 'video' ? (
                  <video
                    src={work.file_url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : work.file_type === 'pdf' ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-4xl">📄</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{work.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {work.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2 flex-wrap">
                  <span>by {work.profiles?.full_name || 'Unknown Artist'}</span>
                  {userLocation && work.profiles?.latitude && work.profiles?.longitude && work.profiles?.location_enabled && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(
                          calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            work.profiles.latitude,
                            work.profiles.longitude
                          )
                        )} away
                      </span>
                    </>
                  )}
                </p>
                {work.hashtags && work.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {work.hashtags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {work.hashtags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{work.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredWorks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No works found. Try adjusting your search or filters.
          </div>
        )}
      </main>

      {selectedWork && (
        <WorkDetailDialog
          work={selectedWork}
          open={!!selectedWork}
          onOpenChange={(open) => !open && setSelectedWork(null)}
          currentUserId={user?.id}
        />
      )}

      <BottomNav />
    </div>
  );
}
