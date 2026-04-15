import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Upload, SlidersHorizontal, Globe,
  MapPin, ChevronDown, X, FileText, Save,
  Plus, Flame, Clock, Heart, Star, Box, Edit, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import WorkDetailDialog from "@/components/WorkDetailDialog";
import { ReportWorkDialog } from "@/components/ReportWorkDialog";
import FBXViewer from "@/components/FBXViewer";
import { HashtagInput } from "@/components/HashtagInput";
import { WorkDrafts } from "@/components/WorkDrafts";
import { WorkEditor } from "@/components/WorkEditor";
import { Model3DScreenshotGenerator } from "@/components/Model3DScreenshotGenerator";
import { WorkCard, WorkCardData } from "@/components/beemade/WorkCard";
import { WorkCardSkeleton } from "@/components/beemade/WorkCardSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAutosave, loadAutosave, clearAutosave } from "@/hooks/useAutosave";
import { applyWatermark } from "@/utils/watermark";
import { calculateDistance } from "@/utils/distance";
import { Database } from "@/integrations/supabase/types";

type WorkRow = Database["public"]["Tables"]["works"]["Row"];
type Work = WorkRow & {
  profiles: { full_name: string | null; avatar_url: string | null; latitude: number | null; longitude: number | null; location_enabled: boolean | null; } | null;
  like_count?: number;
  comment_count?: number;
  distance?: number | null;
};

const CATEGORIES = [
  { id: "all",              label: "All" },
  { id: "3d",               label: "3D" },
  { id: "2d",               label: "2D Art" },
  { id: "photography",      label: "Photography" },
  { id: "illustration",     label: "Illustration" },
  { id: "concept_art",      label: "Concept Art" },
  { id: "animation",        label: "Animation" },
  { id: "digital_painting", label: "Digital Painting" },
  { id: "graphic_design",   label: "Graphic Design" },
];

const SORT_OPTIONS = [
  { id: "latest",   label: "Latest",     icon: Clock },
  { id: "trending", label: "Trending",   icon: Flame },
  { id: "likes",    label: "Most Liked", icon: Heart },
  { id: "featured", label: "Featured",   icon: Star },
];

function getFileType(file: File): WorkRow["file_type"] {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["fbx","obj","glb","gltf"].includes(ext)) return "model_3d";
  if (["mp4","webm","mov"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "image";
}

export default function Works() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [category, setCategory]         = useState("all");
  const [sort, setSort]                 = useState("latest");
  const [search, setSearch]             = useState("");
  const [locationMode, setLocationMode] = useState<"global"|"local">("global");
  const [showAI, setShowAI]             = useState(true);
  const [showNSFW, setShowNSFW]         = useState(false);
  const [showDownloadable, setShowDownloadable] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [revealedNSFW, setRevealedNSFW] = useState<Set<string>>(new Set());
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [reportWorkId, setReportWorkId] = useState<string | null>(null);
  const [reportWorkOwnerId, setReportWorkOwnerId] = useState<string | null>(null);
  const [userAge, setUserAge]           = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude:number;longitude:number}|null>(null);

  const [uploadOpen, setUploadOpen]     = useState(false);
  const [showDrafts, setShowDrafts]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [file, setFile]                 = useState<File | null>(null);
  const [editedFile, setEditedFile]     = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [showEditor, setShowEditor]     = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [newWork, setNewWork] = useState({
    title:"", description:"", hashtags:"", work_type:"", work_style:"",
    made_with_ai:false, nsfw:false, is_downloadable:true,
  });

  useAutosave({ key: "works_draft", data: newWork });
  useEffect(() => {
    const saved = loadAutosave<typeof newWork>("works_draft");
    if (saved) setNewWork(saved);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_date,latitude,longitude").eq("id", user.id).single().then(({ data }) => {
      if (data?.birth_date) {
        setUserAge(Math.floor((Date.now() - new Date(data.birth_date).getTime()) / (365.25*24*60*60*1000)));
      }
      if (data?.latitude && data?.longitude) setUserLocation({ latitude: data.latitude, longitude: data.longitude });
    });
  }, [user]);

  const fetchWorks = async (nsfw: boolean) => {
    let q = supabase.from("works").select(`*, profiles!works_user_id_fkey(full_name,avatar_url,latitude,longitude,location_enabled), like_count:work_likes(count), comment_count:work_comments(count)`).eq("nsfw", nsfw);
    if (category !== "all") q = q.eq("work_type", category);
    if (sort === "latest" || sort === "trending") q = q.order("created_at", { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((w: any) => ({ ...w, like_count: w.like_count?.[0]?.count ?? 0, comment_count: w.comment_count?.[0]?.count ?? 0 })) as Work[];
  };

  const { data: safeWorks = [], isLoading } = useQuery({ queryKey: ["works-safe", category, sort], queryFn: () => fetchWorks(false), staleTime: 60000 });
  const { data: nsfwWorks = [] } = useQuery({ queryKey: ["works-nsfw", category, sort], queryFn: () => fetchWorks(true), staleTime: 60000, enabled: showNSFW && !!userAge && userAge >= 18 });

  const { data: trendingHashtags = [] } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24*60*60*1000).toISOString();
      const { data } = await supabase.from("works").select("hashtags").gte("created_at", since);
      const counts: Record<string,number> = {};
      data?.forEach((w:any) => w.hashtags?.forEach((t:string) => { counts[t] = (counts[t]||0)+1; }));
      return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([tag,count])=>({tag,count}));
    },
    staleTime: 300000,
  });

  useEffect(() => {
    const ch = supabase.channel("works-rt").on("postgres_changes",{event:"*",schema:"public",table:"works"},()=>{
      queryClient.invalidateQueries({queryKey:["works-safe"]});
      queryClient.invalidateQueries({queryKey:["works-nsfw"]});
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [queryClient]);

  const filteredWorks = useMemo(() => {
    const seen = new Set<string>();
    let list = [...safeWorks, ...(showNSFW ? nsfwWorks : [])].filter(w => { if(seen.has(w.id)) return false; seen.add(w.id); return true; });
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(w => w.title.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q) || w.hashtags?.some(h=>h.toLowerCase().includes(q))); }
    if (!showAI) list = list.filter(w => !w.made_with_ai);
    if (showDownloadable) list = list.filter(w => w.is_downloadable);
    if (selectedHashtags.length > 0) list = list.filter(w => selectedHashtags.every(h => w.hashtags?.includes(h)));
    if (sort === "likes") list = [...list].sort((a,b)=>(b.like_count??0)-(a.like_count??0));
    if (sort === "featured") list = [...list].sort(()=>Math.random()-0.5);
    if (userLocation) {
      list = list.map(w => ({ ...w, distance: w.profiles?.latitude && w.profiles?.longitude && w.profiles?.location_enabled ? calculateDistance(userLocation.latitude,userLocation.longitude,w.profiles.latitude,w.profiles.longitude) : null }));
      if (locationMode === "local") list = list.filter(w=>w.distance!=null&&w.distance<=100).sort((a,b)=>(a.distance??Infinity)-(b.distance??Infinity));
    }
    return list;
  }, [safeWorks, nsfwWorks, search, showAI, showDownloadable, selectedHashtags, sort, locationMode, userLocation, showNSFW]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    setFile(f); setEditedFile(null); setThumbnailFile(null);
  };

  const handleSaveDraft = async () => {
    if (!user || !newWork.title) return;
    await supabase.from("work_drafts").insert({ user_id:user.id, ...newWork, hashtags:newWork.hashtags });
    toast({ title:"Draft saved" });
  };

  const handleLoadDraft = (draft: any) => {
    setNewWork({ title:draft.title||"", description:draft.description||"", hashtags:draft.hashtags||"", work_type:draft.work_type||"", work_style:draft.work_style||"", made_with_ai:draft.made_with_ai||false, nsfw:draft.nsfw||false, is_downloadable:draft.is_downloadable??true });
    setCurrentDraftId(draft.id); setShowDrafts(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    const fileToProcess = editedFile || file;
    if (!newWork.title.trim()) return toast({ title:"Missing title", variant:"destructive" });
    if (!newWork.work_type) return toast({ title:"Missing type", variant:"destructive" });
    if (!newWork.work_style) return toast({ title:"Missing style", variant:"destructive" });
    const fileType = getFileType(fileToProcess);
    if (fileType === "model_3d" && !thumbnailFile) return toast({ title:"Preview not ready", description:"Wait for thumbnail generation.", variant:"destructive" });
    if (newWork.nsfw && (!userAge || userAge < 18)) return toast({ title:"Age restriction", variant:"destructive" });
    setUploading(true);
    try {
      const ext = fileToProcess.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      let fileToUpload = fileToProcess;
      let screenshotUrl: string | null = null;
      if (fileType === "model_3d" && thumbnailFile) {
        const sName = `${user.id}/${Date.now()}_screenshot.jpg`;
        const { error: sErr } = await supabase.storage.from("works").upload(sName, thumbnailFile);
        if (!sErr) screenshotUrl = supabase.storage.from("works").getPublicUrl(sName).data.publicUrl;
      }
      if (fileType === "image") {
        const { data: profile } = await supabase.from("profiles").select("watermark_text,watermark_url,watermark_enabled,watermark_sections,username").eq("id",user.id).single();
        if (profile?.watermark_enabled && profile?.watermark_sections?.includes("works")) {
          const blob = await applyWatermark(file, profile.username||profile.watermark_text||"", profile.watermark_url||undefined);
          fileToUpload = new File([blob], file.name, { type:file.type });
        }
      }
      const { error: uploadErr } = await supabase.storage.from("works").upload(fileName, fileToUpload);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("works").getPublicUrl(fileName);
      const { data: prof } = await supabase.from("profiles").select("watermark_url").eq("id",user.id).single();
      const hashtags = newWork.hashtags.split(",").map(t=>t.trim()).filter(Boolean);
      const { error: insertErr } = await supabase.from("works").insert({ user_id:user.id, title:newWork.title, description:newWork.description, file_url:publicUrl, file_type:fileType, watermark_url:prof?.watermark_url, hashtags, work_type:newWork.work_type, work_style:newWork.work_style, made_with_ai:newWork.made_with_ai, nsfw:newWork.nsfw, screenshot_url:screenshotUrl, is_downloadable:newWork.is_downloadable });
      if (insertErr) throw insertErr;
      clearAutosave("works_draft");
      toast({ title:"Work published!" });
      setNewWork({ title:"", description:"", hashtags:"", work_type:"", work_style:"", made_with_ai:false, nsfw:false, is_downloadable:true });
      setFile(null); setEditedFile(null); setThumbnailFile(null); setUploadOpen(false);
      queryClient.invalidateQueries({ queryKey:["works-safe"] });
    } catch(err) {
      console.error(err); toast({ title:"Upload failed", variant:"destructive" });
    } finally { setUploading(false); }
  };

  const Memoized3DViewer = useMemo(() => ({ file }: { file:File }) => {
    const url = useMemo(() => URL.createObjectURL(file), [file]);
    return <FBXViewer url={url} enableLOD autoRotate={false} />;
  }, []);

  const SortIcon = SORT_OPTIONS.find(s=>s.id===sort)?.icon ?? Clock;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-16">

        {/* ── Sticky top bar ────────────────────────────────────────────── */}
        <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-14 z-30">
          <div className="container mx-auto px-4">

            {/* Search row */}
            <div className="flex items-center gap-2 py-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search works, artists, tags…"
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  className="pl-9 bg-muted/40 border-transparent focus:border-primary/40 focus:bg-background"
                />
                {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
              </div>

              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {(!showAI||showDownloadable||locationMode==="local"||showNSFW) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <label className="flex items-center gap-2 py-1 px-1 text-sm cursor-pointer rounded hover:bg-muted/50">
                    <Checkbox checked={showAI} onCheckedChange={v=>setShowAI(!!v)} /> Show AI works
                  </label>
                  <label className="flex items-center gap-2 py-1 px-1 text-sm cursor-pointer rounded hover:bg-muted/50">
                    <Checkbox checked={showDownloadable} onCheckedChange={v=>setShowDownloadable(!!v)} /> Free downloads only
                  </label>
                  {userAge != null && userAge >= 18 && (
                    <label className="flex items-center gap-2 py-1 px-1 text-sm cursor-pointer rounded hover:bg-muted/50">
                      <Checkbox checked={showNSFW} onCheckedChange={v=>setShowNSFW(!!v)} /> Show NSFW (18+)
                    </label>
                  )}
                  <DropdownMenuSeparator />
                  <Button variant={locationMode==="local"?"default":"outline"} size="sm" className="w-full gap-2 mt-1" onClick={()=>setLocationMode(l=>l==="global"?"local":"global")}>
                    {locationMode==="local"?<MapPin className="w-3.5 h-3.5"/>:<Globe className="w-3.5 h-3.5"/>}
                    {locationMode==="local"?"Near me":"Global"}
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 shrink-0 hidden sm:flex">
                    <SortIcon className="w-4 h-4" />
                    {SORT_OPTIONS.find(s=>s.id===sort)?.label}
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {SORT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return <DropdownMenuItem key={opt.id} onClick={()=>setSort(opt.id)} className={`gap-2 ${sort===opt.id?"text-primary font-medium":""}`}><Icon className="w-4 h-4"/>{opt.label}</DropdownMenuItem>;
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Upload CTA */}
              {user && (
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 bg-gradient-primary text-white hover:opacity-90 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        Upload New Work
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>setShowDrafts(true)}><FileText className="w-4 h-4 mr-1"/>Drafts</Button>
                          <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={!newWork.title}><Save className="w-4 h-4 mr-1"/>Save draft</Button>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 mt-2">
                      <div>
                        <Label>File <span className="text-xs text-muted-foreground">(JPG, PNG, PDF, FBX, MP4)</span></Label>
                        <Input type="file" accept=".jpg,.jpeg,.png,.pdf,.fbx,.mp4,.webm" onChange={handleFileChange} className="mt-1" required />
                        {file && (
                          <div className="mt-3 space-y-2">
                            <div className="rounded-lg overflow-hidden bg-muted aspect-video relative">
                              {getFileType(file)==="image" && <img src={URL.createObjectURL(editedFile||file)} alt="preview" className="w-full h-full object-contain" />}
                              {getFileType(file)==="video" && <video src={URL.createObjectURL(editedFile||file)} className="w-full h-full object-contain" controls />}
                              {getFileType(file)==="model_3d" && <><div className="w-full h-full"><Memoized3DViewer file={file} /></div><Model3DScreenshotGenerator file={file} onScreenshot={setThumbnailFile} /></>}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground truncate max-w-[200px]">{file.name}</span>
                              <Button type="button" variant="outline" size="sm" onClick={()=>setShowEditor(true)}><Edit className="w-3.5 h-3.5 mr-1"/>Edit</Button>
                            </div>
                            {getFileType(file)==="model_3d" && thumbnailFile && <p className="text-xs text-primary">✓ Preview ready</p>}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label>Title *</Label>
                          <Input placeholder="Give your work a name" value={newWork.title} onChange={e=>setNewWork({...newWork,title:e.target.value})} className="mt-1" required />
                        </div>
                        <div>
                          <Label>Type *</Label>
                          <Select value={newWork.work_type} onValueChange={v=>setNewWork({...newWork,work_type:v})}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {["3d","2d","photography","digital_painting","illustration","concept_art","animation","graphic_design","other"].map(v=><SelectItem key={v} value={v}>{v.replace(/_/g," ")}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Style *</Label>
                          <Select value={newWork.work_style} onValueChange={v=>setNewWork({...newWork,work_style:v})}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {["stylized","realism","semi_realistic","cartoonish","vectorial","abstract","minimalist","pixel_art","other"].map(v=><SelectItem key={v} value={v}>{v.replace(/_/g," ")}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea placeholder="Tell the story behind your work…" value={newWork.description} onChange={e=>setNewWork({...newWork,description:e.target.value})} className="mt-1 resize-none" rows={3} />
                      </div>
                      <div>
                        <Label>Hashtags <span className="text-xs text-muted-foreground">(max 5)</span></Label>
                        <HashtagInput value={newWork.hashtags} onChange={v=>setNewWork({...newWork,hashtags:v})} maxTags={5} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {([["made_with_ai","AI-assisted"],["nsfw","NSFW (18+)"],["is_downloadable","Free download"]] as [keyof typeof newWork, string][]).map(([id,label])=>(
                          <label key={id} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 text-sm">
                            <Checkbox checked={!!newWork[id]} onCheckedChange={v=>setNewWork({...newWork,[id]:!!v})} />{label}
                          </label>
                        ))}
                      </div>
                      <Button type="submit" className="w-full bg-gradient-primary text-white"
                        disabled={uploading||!file||!newWork.title.trim()||!newWork.work_type||!newWork.work_style||(file&&getFileType(editedFile||file)==="model_3d"&&!thumbnailFile)}>
                        {uploading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"/>Uploading…</> : <><Upload className="w-4 h-4 mr-2"/>Publish Work</>}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-0 overflow-x-auto scrollbar-hide -mx-px">
              {CATEGORIES.map(cat=>(
                <button key={cat.id} onClick={()=>setCategory(cat.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${category===cat.id?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">

          {/* Trending hashtags */}
          {trendingHashtags.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">Trending now</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map(({tag,count})=>(
                  <button key={tag} onClick={()=>setSelectedHashtags(p=>p.includes(tag)?p.filter(t=>t!==tag):[...p,tag])}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${selectedHashtags.includes(tag)?"bg-primary text-primary-foreground":"bg-primary/10 text-primary hover:bg-primary/20"}`}>
                    #{tag}<span className="ml-1 text-xs opacity-60">{count}</span>
                  </button>
                ))}
                {selectedHashtags.length>0&&<button onClick={()=>setSelectedHashtags([])} className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1"><X className="w-3 h-3"/>Clear</button>}
              </div>
            </section>
          )}

          {/* Works count + mobile sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${filteredWorks.length} work${filteredWorks.length!==1?"s":""}${selectedHashtags.length>0?` · ${selectedHashtags.map(t=>"#"+t).join(", ")}`:""}${locationMode==="local"?" · Near you":""}`}
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-36 sm:hidden h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{SORT_OPTIONS.map(o=><SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({length:12}).map((_,i)=><WorkCardSkeleton key={i}/>)}
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <div><p className="font-semibold mb-1">No works found</p><p className="text-sm text-muted-foreground">Try different filters or be the first to post!</p></div>
              {user && <Button onClick={()=>setUploadOpen(true)} className="gap-2 bg-gradient-primary text-white"><Plus className="w-4 h-4"/>Upload Work</Button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWorks.map(work=>(
                <ErrorBoundary key={work.id}>
                  <div className="relative">
                    <WorkCard
                      work={work as WorkCardData}
                      onClick={()=>setSelectedWork(work)}
                      isNSFWRevealed={revealedNSFW.has(work.id)}
                      onRevealNSFW={()=>setRevealedNSFW(s=>new Set([...s,work.id]))}
                      userAge={userAge}
                    />
                    {user && work.user_id!==user.id && !work.nsfw && (
                      <button
                        className="absolute top-2 right-2 z-20 opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded bg-black/50 text-white transition-opacity"
                        onClick={e=>{e.stopPropagation();setReportWorkId(work.id);setReportWorkOwnerId(work.user_id);}}
                        aria-label="Report"
                      ><Flag className="w-3 h-3"/></button>
                    )}
                  </div>
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedWork && (
        <WorkDetailDialog work={selectedWork} open={!!selectedWork} onOpenChange={o=>!o&&setSelectedWork(null)} currentUserId={user?.id} />
      )}
      {file && (
        <WorkEditor open={showEditor} onOpenChange={setShowEditor} file={file} fileType={getFileType(file) as "image"|"video"|"model_3d"} onSave={f=>{setEditedFile(f);setShowEditor(false);}} />
      )}
      {reportWorkId && reportWorkOwnerId && (
        <ReportWorkDialog open={!!reportWorkId} onOpenChange={o=>{if(!o){setReportWorkId(null);setReportWorkOwnerId(null);}}} workId={reportWorkId} workOwnerId={reportWorkOwnerId} />
      )}
      <Dialog open={showDrafts} onOpenChange={setShowDrafts}>
        <DialogContent><DialogHeader><DialogTitle>Your Drafts</DialogTitle></DialogHeader>
          <WorkDrafts onLoadDraft={handleLoadDraft} onClose={()=>setShowDrafts(false)} />
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
  );
}
