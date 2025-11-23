import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, MessageSquare, Eye, Upload, Filter, Search, X, Globe, MapPin, Plus, Flag, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorkDetailDialog from "@/components/WorkDetailDialog";
import { ReportWorkDialog } from "@/components/ReportWorkDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { applyWatermark, preventImageSave } from "@/utils/watermark";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { HexagonImage } from "@/components/HexagonImage";
import { useQueryClient } from "@tanstack/react-query";
import { WorkEditor } from "@/components/WorkEditor";
import FBXViewer from "@/components/FBXViewer";
import { LoadingProgress } from "@/components/LoadingProgress";
import { useAutosave, loadAutosave, clearAutosave } from "@/hooks/useAutosave";
import { capture3DScreenshot, blobToFile } from "@/utils/screenshot";
import { useRef } from "react";
type Work = Database['public']['Tables']['works']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    latitude: number | null;
    longitude: number | null;
    location_enabled: boolean | null;
  } | null;
  distance?: number | null;
};
export default function Works() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [works, setWorks] = useState<Work[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locationFilter, setLocationFilter] = useState<'global' | 'local'>('global');
  const [file, setFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStyle, setFilterStyle] = useState<string>("all");
  const [showAIWorks, setShowAIWorks] = useState<boolean>(true);
  const [newWork, setNewWork] = useState({
    title: "",
    description: "",
    hashtags: "",
    work_type: "",
    work_style: "",
    made_with_ai: false,
    nsfw: false,
    is_downloadable: true
  });
  const [showNSFW, setShowNSFW] = useState(false);
  const [selectedNSFWWork, setSelectedNSFWWork] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<{
    tag: string;
    count: number;
  }[]>([]);
  const [reportWorkId, setReportWorkId] = useState<string | null>(null);
  const [reportWorkOwnerId, setReportWorkOwnerId] = useState<string | null>(null);
  const [showDownloadable, setShowDownloadable] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load autosaved draft
  useEffect(() => {
    const saved = loadAutosave<{
      title: string;
      description: string;
      hashtags: string;
      work_type: string;
      work_style: string;
      made_with_ai: boolean;
      nsfw: boolean;
      is_downloadable: boolean;
    }>('works_draft');
    if (saved) {
      setNewWork(saved);
    }
  }, []);

  // Autosave draft
  useAutosave({ key: 'works_draft', data: newWork });

  // Memoized 3D viewer to prevent re-renders when form state changes
  const Memoized3DViewer = useMemo(() => {
    return ({ file }: { file: File }) => {
      const url = useMemo(() => URL.createObjectURL(file), [file]);
      return <FBXViewer url={url} enableLOD={true} autoRotate={false} />;
    };
  }, []);

  useEffect(() => {
    fetchWorks();
    fetchTrendingHashtags();
    setupRealtimeSubscription();
    if (user) {
      fetchUserLocation();
      fetchUserAge();
    }
  }, [user]);
  const fetchUserAge = async () => {
    if (!user) return;
    const {
      data: profile
    } = await supabase.from("profiles").select("birth_date").eq("id", user.id).single();
    if (profile?.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      setUserAge(age);
    }
  };
  const fetchUserLocation = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('profiles').select('latitude, longitude').eq('id', user.id).single();
    if (data?.latitude && data?.longitude) {
      setUserLocation({
        latitude: data.latitude,
        longitude: data.longitude
      });
    }
  };
  const setupRealtimeSubscription = () => {
    const channel = supabase.channel('works-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'works'
    }, () => {
      fetchWorks();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  };
  const fetchWorks = async () => {
    const {
      data
    } = await supabase.from('works').select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          latitude,
          longitude,
          location_enabled
        )
      `).order('created_at', {
      ascending: false
    });
    if (data) setWorks(data as Work[]);
  };
  const fetchTrendingHashtags = async () => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const {
      data
    } = await supabase.from('works').select('hashtags').gte('created_at', twentyFourHoursAgo.toISOString());
    if (data) {
      const hashtagCount: {
        [key: string]: number;
      } = {};
      data.forEach(work => {
        (work.hashtags || []).forEach(tag => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        });
      });
      const sorted = Object.entries(hashtagCount).map(([tag, count]) => ({
        tag,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10);
      setTrendingHashtags(sorted);
    }
  };
  const allHashtags = Array.from(new Set(works.flatMap(work => work.hashtags || [])));
  
  // Filter, calculate distances, and sort works
  const filteredWorks = works
    .filter(work => {
      const matchesSearch = work.title?.toLowerCase().includes(searchQuery.toLowerCase()) || work.description?.toLowerCase().includes(searchQuery.toLowerCase()) || (work.hashtags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesHashtags = selectedHashtags.length === 0 || selectedHashtags.every(selectedTag => (work.hashtags || []).includes(selectedTag));
      const matchesType = filterType === "all" || work.work_type === filterType;
      const matchesStyle = filterStyle === "all" || work.work_style === filterStyle;
      const matchesAI = showAIWorks || !work.made_with_ai;
      const matchesNSFW = showNSFW || !work.nsfw;
      return matchesSearch && matchesHashtags && matchesType && matchesStyle && matchesAI && matchesNSFW;
    })
    .map(work => {
      // Calculate distance if in local mode and both locations are available
      let distance: number | null = null;
      if (locationFilter === 'local' && userLocation && work.profiles?.latitude && work.profiles?.longitude && work.profiles?.location_enabled) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          work.profiles.latitude,
          work.profiles.longitude
        );
      }
      return { ...work, distance };
    })
    .sort((a, b) => {
      // Sort by distance when in local mode
      if (locationFilter === 'local') {
        // Works without location go to the end
        if (a.distance === null && b.distance === null) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      }
      // Default sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
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
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      setEditedFile(null);
      setThumbnailFile(null);
    }
  };

  const handleEditSave = (edited: File, thumbnail?: File) => {
    setEditedFile(edited);
    setThumbnailFile(thumbnail || null);
    setShowEditor(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileToProcess = editedFile || file;
    if (!user || !fileToProcess || !newWork.title || !newWork.work_type || !newWork.work_style) {
      toast({
        title: 'Please fill all required fields (title, type, style)',
        variant: 'destructive'
      });
      return;
    }
    if (newWork.nsfw && (!userAge || userAge < 18)) {
      toast({
        title: "Age Restriction",
        description: "You must be 18+ to upload NSFW content",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      const fileType = getFileType(fileToProcess);
      const fileExt = fileToProcess.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      let fileToUpload = fileToProcess;
      let screenshotUrl: string | null = null;

      // Capture screenshot for 3D models
      if (fileType === 'model_3d' && thumbnailFile) {
        const screenshotExt = 'jpg';
        const screenshotFileName = `${user.id}/${Date.now()}_screenshot.${screenshotExt}`;
        
        const { error: screenshotError } = await supabase.storage
          .from('works')
          .upload(screenshotFileName, thumbnailFile);

        if (!screenshotError) {
          const { data: { publicUrl: screenshotPublicUrl } } = supabase.storage
            .from('works')
            .getPublicUrl(screenshotFileName);
          screenshotUrl = screenshotPublicUrl;
        }
      }

      // Apply watermark to images
      if (fileType === 'image') {
        const {
          data: profile
        } = await supabase.from('profiles').select('watermark_text, watermark_url, watermark_enabled, watermark_style, watermark_sections, username')
          .eq('id', user.id)
          .single();
        
        if (profile?.watermark_enabled && profile?.watermark_sections?.includes('works')) {
          const watermarkText = profile.username || profile.watermark_text || '';
          const watermarkedBlob = await applyWatermark(file, watermarkText, profile.watermark_url || undefined);
          fileToUpload = new File([watermarkedBlob], file.name, {
            type: file.type
          });
        } else if (profile?.watermark_text || profile?.watermark_url) {
          // Legacy watermark support
          const watermarkedBlob = await applyWatermark(file, profile.watermark_text || '', profile.watermark_url || undefined);
          fileToUpload = new File([watermarkedBlob], file.name, {
            type: file.type
          });
        }
      }
      const {
        data: uploadData,
        error: uploadError
      } = await supabase.storage.from('works').upload(fileName, fileToUpload);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('works').getPublicUrl(fileName);
      const hashtags = newWork.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const {
        data: profile
      } = await supabase.from('profiles').select('watermark_url').eq('id', user.id).single();
      const {
        error: insertError
      } = await supabase.from('works').insert({
        user_id: user.id,
        title: newWork.title,
        description: newWork.description,
        file_url: publicUrl,
        file_type: fileType,
        watermark_url: profile?.watermark_url,
        hashtags,
        work_type: newWork.work_type,
        work_style: newWork.work_style,
        made_with_ai: newWork.made_with_ai,
        nsfw: newWork.nsfw,
        screenshot_url: screenshotUrl,
        is_downloadable: newWork.is_downloadable
      });
      if (insertError) throw insertError;
      
      // Clear autosaved draft
      clearAutosave('works_draft');
      
      toast({
        title: 'Work uploaded successfully!'
      });
      setNewWork({
        title: "",
        description: "",
        hashtags: "",
        work_type: "",
        work_style: "",
        made_with_ai: false,
        nsfw: false,
        is_downloadable: true
      });
      setFile(null);
      setEditedFile(null);
      setThumbnailFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  return <div className="min-h-screen bg-background pt-24 pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Bees Art Gallery</h1>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search works..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg shrink-0">
                  <Plus className="w-5 h-5 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh]">
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <DialogHeader>
                  <DialogTitle>Upload New Work</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="file">File (JPG, PNG, PDF, FBX, Video)</Label>
                    <Input id="file" type="file" accept=".jpg,.jpeg,.png,.pdf,.fbx,.mp4,.webm" onChange={handleFileChange} required />
                    {file && (
                      <div className="mt-4 space-y-3">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          {getFileType(file) === 'image' && (
                            <img src={editedFile ? URL.createObjectURL(editedFile) : URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain" />
                          )}
                          {getFileType(file) === 'video' && (
                            <video src={editedFile ? URL.createObjectURL(editedFile) : URL.createObjectURL(file)} className="w-full h-full object-contain" controls />
                          )}
                          {getFileType(file) === 'model_3d' && (
                            <Memoized3DViewer file={file} />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Selected: {file.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditor(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica
                          </Button>
                        </div>
                        {editedFile && (
                          <p className="text-xs text-primary">✓ File modificato</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Work title" value={newWork.title} onChange={e => setNewWork({
                    ...newWork,
                    title: e.target.value
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="work_type">Type *</Label>
                    <Select value={newWork.work_type} onValueChange={value => setNewWork({
                    ...newWork,
                    work_type: value
                  })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3d">3D</SelectItem>
                        <SelectItem value="2d">2D</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="digital_painting">Digital Painting</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="concept_art">Concept Art</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                        <SelectItem value="graphic_design">Graphic Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="work_style">Style *</Label>
                    <Select value={newWork.work_style} onValueChange={value => setNewWork({
                    ...newWork,
                    work_style: value
                  })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stylized">Stylized</SelectItem>
                        <SelectItem value="realism">Realism</SelectItem>
                        <SelectItem value="semi_realistic">Semi-Realistic</SelectItem>
                        <SelectItem value="cartoonish">Cartoonish</SelectItem>
                        <SelectItem value="vectorial">Vectorial</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="pixel_art">Pixel Art</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/20">
                      <Checkbox id="made_with_ai" checked={newWork.made_with_ai} onCheckedChange={checked => setNewWork({
                      ...newWork,
                      made_with_ai: checked as boolean
                    })} />
                      <Label htmlFor="made_with_ai" className="cursor-pointer font-medium">
                        Made with AI *
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/20">
                      <Checkbox id="nsfw" checked={newWork.nsfw} onCheckedChange={checked => setNewWork({
                      ...newWork,
                      nsfw: checked as boolean
                    })} />
                      <Label htmlFor="nsfw" className="cursor-pointer font-medium">
                        NSFW (18+ content) *
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/20">
                      <Checkbox id="is_downloadable" checked={newWork.is_downloadable} onCheckedChange={checked => setNewWork({
                      ...newWork,
                      is_downloadable: checked as boolean
                    })} />
                      <Label htmlFor="is_downloadable" className="cursor-pointer font-medium">
                        Downloadable
                      </Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your work..." value={newWork.description} onChange={e => setNewWork({
                    ...newWork,
                    description: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label htmlFor="hashtags">Hashtags (max 5)</Label>
                    <Input id="hashtags" placeholder="digitalart, 3d, animation (comma separated)" value={newWork.hashtags} onChange={e => setNewWork({
                    ...newWork,
                    hashtags: e.target.value
                  })} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate with commas, max 5 hashtags
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </> : <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>}
                  </Button>
                </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Trending Hashtags Section */}
          {trendingHashtags.length > 0 && <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 text-foreground">🔥 Trending in Last 24h</h3>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map(({
              tag,
              count
            }) => <Badge key={tag} variant={selectedHashtags.includes(tag) ? "default" : "secondary"} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => toggleHashtag(tag)}>
                    #{tag} <span className="ml-1 text-xs opacity-70">({count})</span>
                  </Badge>)}
              </div>
            </div>}

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="3d">3D</SelectItem>
                <SelectItem value="2d">2D</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="digital_painting">Digital Painting</SelectItem>
                <SelectItem value="illustration">Illustration</SelectItem>
                <SelectItem value="concept_art">Concept Art</SelectItem>
                <SelectItem value="animation">Animation</SelectItem>
                <SelectItem value="graphic_design">Graphic Design</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStyle} onValueChange={setFilterStyle}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Styles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value="stylized">Stylized</SelectItem>
                <SelectItem value="realism">Realism</SelectItem>
                <SelectItem value="semi_realistic">Semi-Realistic</SelectItem>
                <SelectItem value="cartoonish">Cartoonish</SelectItem>
                <SelectItem value="vectorial">Vectorial</SelectItem>
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="pixel_art">Pixel Art</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setLocationFilter(locationFilter === 'global' ? 'local' : 'global')}
              className="gap-2"
            >
              {locationFilter === 'global' ? (
                <>
                  <Globe className="h-4 w-4" />
                  Global
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Local
                </>
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox id="show_downloadable" checked={showDownloadable} onCheckedChange={checked => setShowDownloadable(checked as boolean)} />
              <Label htmlFor="show_downloadable" className="cursor-pointer text-sm">
                Show Downloadable
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="show_ai" checked={showAIWorks} onCheckedChange={checked => setShowAIWorks(checked as boolean)} />
              <Label htmlFor="show_ai" className="cursor-pointer text-sm">
                Show AI Works
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="show_nsfw" checked={showNSFW} onCheckedChange={checked => setShowNSFW(checked as boolean)} disabled={!userAge || userAge < 18} />
              <Label htmlFor="show_nsfw" className="cursor-pointer text-sm">
                Show NSFW {(!userAge || userAge < 18) && "(18+ only)"}
              </Label>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map(work => {
          const isNSFWBlurred = work.nsfw && selectedNSFWWork !== work.id;
          return <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            if (work.nsfw && (!userAge || userAge < 18)) {
              toast({
                title: "Age Restriction",
                description: "You must be 18+ to view NSFW content",
                variant: "destructive"
              });
              return;
            }
            if (isNSFWBlurred) {
              setSelectedNSFWWork(work.id);
              return;
            }
            setSelectedWork(work);
          }}>
              <div className="relative aspect-square overflow-hidden bg-muted rounded-lg">
                {work.file_type === 'image' ? (
                  <img 
                    src={work.file_url} 
                    alt={work.title}
                    className={`w-full h-full object-cover ${isNSFWBlurred ? "blur-2xl" : ""}`}
                  />
                ) : work.file_type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video src={work.file_url} className="w-full h-full object-cover" muted />
                  </div>
                ) : work.file_type === 'pdf' ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-4xl">📄</span>
                  </div>
                ) : work.file_type === 'model_3d' ? (
                  <div className="w-full h-full">
                    {work.screenshot_url ? (
                      <img 
                        src={work.screenshot_url} 
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-4xl">🎨</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
                {isNSFWBlurred && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white font-bold text-lg">18+ NSFW</span>
                  </div>
                )}
                {work.watermark_url && !isNSFWBlurred && (
                  <img src={work.watermark_url} alt="Watermark" className="absolute bottom-2 right-2 w-16 h-auto opacity-50" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold flex-1">{work.title}</h3>
                  {!work.nsfw && work.user_id !== user?.id && <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-destructive" onClick={e => {
                  e.stopPropagation();
                  setReportWorkId(work.id);
                  setReportWorkOwnerId(work.user_id);
                }}>
                      <Flag className="h-4 w-4" />
                    </Button>}
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {work.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2 flex-wrap">
                  <span>by {work.profiles?.full_name || 'Unknown Artist'}</span>
                  {locationFilter === 'local' && work.distance !== null ? (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(work.distance)} away
                      </span>
                    </>
                  ) : userLocation && work.profiles?.latitude && work.profiles?.longitude && work.profiles?.location_enabled && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-primary font-medium">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(calculateDistance(userLocation.latitude, userLocation.longitude, work.profiles.latitude, work.profiles.longitude))} away
                      </span>
                    </>
                  )}
                </p>
                {work.hashtags && work.hashtags.length > 0 && <div className="flex flex-wrap gap-1">
                    {work.hashtags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>)}
                    {work.hashtags.length > 3 && <Badge variant="secondary" className="text-xs">
                        +{work.hashtags.length - 3}
                      </Badge>}
                  </div>}
              </div>
            </Card>;
        })}
        </div>

        {filteredWorks.length === 0 && <div className="text-center py-12 text-muted-foreground">
            No works found. Try adjusting your search or filters.
          </div>}
      </main>

      {selectedWork && <WorkDetailDialog work={selectedWork} open={!!selectedWork} onOpenChange={open => !open && setSelectedWork(null)} currentUserId={user?.id} />}

      {file && (
        <WorkEditor
          open={showEditor}
          onOpenChange={setShowEditor}
          file={file}
          fileType={getFileType(file) as 'image' | 'video' | 'model_3d'}
          onSave={handleEditSave}
        />
      )}

      {reportWorkId && reportWorkOwnerId && <ReportWorkDialog open={!!reportWorkId} onOpenChange={open => {
      if (!open) {
        setReportWorkId(null);
        setReportWorkOwnerId(null);
      }
    }} workId={reportWorkId} workOwnerId={reportWorkOwnerId} />}

      <BottomNav />
    </div>;
}