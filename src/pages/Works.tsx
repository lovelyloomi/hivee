import { useState, useMemo } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Heart, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface Work {
  id: number;
  image: string;
  bio: string;
  hashtags: string[];
  likes: number;
  liked: boolean;
}

const mockWorks: Work[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', bio: 'Abstract digital art piece', hashtags: ['digital', 'abstract', 'art'], likes: 234, liked: false },
  { id: 2, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262', bio: 'Modern architecture photography', hashtags: ['photography', 'architecture', 'minimal'], likes: 412, liked: false },
  { id: 3, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', bio: 'UI/UX design concept', hashtags: ['uiux', 'design', 'app'], likes: 189, liked: false },
  { id: 4, image: 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139', bio: '3D character modeling', hashtags: ['3d', 'modeling', 'character'], likes: 567, liked: false },
  { id: 5, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113', bio: 'Illustration artwork', hashtags: ['illustration', 'drawing', 'creative'], likes: 321, liked: false },
  { id: 6, image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9', bio: 'Motion graphics frame', hashtags: ['motion', 'animation', 'graphics'], likes: 445, liked: false },
];

const Works = () => {
  const { t } = useLanguage();
  const [works, setWorks] = useState<Work[]>(mockWorks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWork, setNewWork] = useState({ bio: '', hashtags: '', image: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  // Get all unique hashtags from all works
  const allHashtags = useMemo(() => {
    const tags = new Set<string>();
    works.forEach(work => work.hashtags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [works]);

  // Filter works based on search and selected hashtags
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const matchesSearch = searchQuery === '' || 
        work.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesHashtags = selectedHashtags.length === 0 ||
        selectedHashtags.every(selectedTag => work.hashtags.includes(selectedTag));
      
      return matchesSearch && matchesHashtags;
    });
  }, [works, searchQuery, selectedHashtags]);

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(tag => tag !== hashtag)
        : [...prev, hashtag]
    );
  };

  const handleLike = (id: number) => {
    setWorks(works.map(work => 
      work.id === id 
        ? { ...work, liked: !work.liked, likes: work.liked ? work.likes - 1 : work.likes + 1 }
        : work
    ));
  };

  const handleSubmit = () => {
    if (!newWork.bio || !newWork.image) return;
    
    const work: Work = {
      id: works.length + 1,
      image: newWork.image,
      bio: newWork.bio,
      hashtags: newWork.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      liked: false,
    };
    
    setWorks([work, ...works]);
    setNewWork({ bio: '', hashtags: '', image: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('works.title')}
          </h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full w-12 h-12 p-0">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('works.add')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('works.uploadImage')}</label>
                  <Input
                    placeholder="Image URL"
                    value={newWork.image}
                    onChange={(e) => setNewWork({ ...newWork, image: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('works.bio')}</label>
                  <Textarea
                    placeholder={t('works.bio')}
                    value={newWork.bio}
                    onChange={(e) => setNewWork({ ...newWork, bio: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('works.hashtags')}</label>
                  <Input
                    placeholder="art, design, creative"
                    value={newWork.hashtags}
                    onChange={(e) => setNewWork({ ...newWork, hashtags: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} className="flex-1">
                    {t('works.submit')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    {t('works.cancel')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Hashtag Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {allHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => toggleHashtag(hashtag)}
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
          {selectedHashtags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedHashtags([])}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Works Grid */}
        {filteredWorks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No works found matching your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWorks.map((work) => (
            <div key={work.id} className="group relative aspect-square rounded-xl overflow-hidden bg-card">
              <img 
                src={work.image} 
                alt={work.bio}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-sm mb-2">{work.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {work.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleLike(work.id)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Heart className={`h-4 w-4 ${work.liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span>{work.likes}</span>
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Works;
