import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmailVerified } from '@/hooks/useEmailVerified';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Instagram, Linkedin, Twitter, Globe, GraduationCap, Languages, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VerificationBadge from '@/components/VerificationBadge';
import AccountTypeBadge from '@/components/AccountTypeBadge';
import { HexagonAvatar } from '@/components/HexagonAvatar';
import { HexagonImage } from '@/components/HexagonImage';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isVerified } = useEmailVerified();
  
  const [profile, setProfile] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Demo data for testing
  const demoProfile = {
    id: userId,
    full_name: userId === 'demo-1' ? 'Sofia Martinez' : 
               userId === 'demo-2' ? 'Marcus Chen' :
               userId === 'demo-3' ? 'Emma Thompson' :
               userId === 'demo-4' ? 'Diego Santos' : 'Yuki Tanaka',
    bio: 'Digital illustrator & concept artist. Love creating fantasy worlds and character designs. Available for commissions!',
    location: 'Barcelona, Spain',
    skills: ['Digital Painting', 'Character Design', 'Concept Art', 'Illustration'],
    programs: ['Photoshop', 'Procreate', 'Blender', 'Clip Studio Paint'],
    work_images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800',
      'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800'
    ],
    avatar_url: 'https://i.pravatar.cc/150?img=5',
  };

  const demoWorks = [
    {
      id: '1',
      title: 'Fantasy Character Concept',
      description: 'Character design for upcoming game project',
      file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      file_type: 'image',
      hashtags: ['characterdesign', 'fantasy', 'conceptart'],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Environment Study',
      description: 'Practice piece exploring lighting and atmosphere',
      file_url: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800',
      file_type: 'image',
      hashtags: ['environment', 'digitalart', 'landscape'],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Creature Design',
      description: 'Original creature concept for portfolio',
      file_url: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800',
      file_type: 'image',
      hashtags: ['creaturedesign', 'fantasy', 'illustration'],
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Portrait Study',
      description: 'Digital portrait practice',
      file_url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800',
      file_type: 'image',
      hashtags: ['portrait', 'digitalpainting', 'art'],
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    fetchProfile();
    fetchWorks();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    // Check if demo profile
    if (userId.startsWith('demo-')) {
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorks = async () => {
    if (!userId) return;

    // Use demo works for demo profiles
    if (userId.startsWith('demo-')) {
      setWorks(demoWorks);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error: any) {
      console.error('Error fetching works:', error);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start a conversation",
      });
      navigate('/auth');
      return;
    }

    if (!profile) return;

    if (userId?.startsWith('demo-')) {
      toast({
        title: "Demo Profile",
        description: "This is a demo profile. Real profiles will have working chat!",
      });
      return;
    }

    try {
      // Check for existing conversation
      const { data: existingConvo, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConvo) {
        navigate(`/chat/${existingConvo.id}`);
        return;
      }

      // Create new conversation
      const user1Id = user.id < (userId || '') ? user.id : (userId || '');
      const user2Id = user.id < (userId || '') ? (userId || '') : user.id;

      const { data, error } = await supabase
        .from('conversations')
        .insert({ user1_id: user1Id, user2_id: user2Id })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        navigate(`/chat/${data.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not start chat",
        variant: "destructive"
      });
    }
  };

  const handleWorkClick = (work: any, index: number) => {
    setSelectedWork(work);
    setSelectedImageIndex(index);
  };

  const handleNextImage = () => {
    if (selectedImageIndex < works.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setSelectedWork(works[selectedImageIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setSelectedWork(works[selectedImageIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-24 flex items-center justify-center">
          <p>{t('common.loading')}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-24 flex flex-col items-center justify-center gap-4">
          <p className="text-xl">Profile not found</p>
          <Button onClick={() => navigate(-1)}>{t('common.back')}</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-20 pb-24 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <HexagonAvatar 
                  src={profile.avatar_url || profile.work_images?.[0]}
                  fallback={profile.full_name?.[0] || 'U'}
                  size="xl"
                />
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge isVerified={isVerified} size="md" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{profile.full_name}</h2>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <AccountTypeBadge accountType={profile.account_type} />
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleStartChat}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('matches.message')}
                  </Button>
                  <Button variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">{t('profile.about')}</TabsTrigger>
            <TabsTrigger value="portfolio">{t('profile.portfolio')}</TabsTrigger>
            <TabsTrigger value="activity">{t('profile.activity')}</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Professional Info */}
                {(profile.artist_specialization || profile.education_level || profile.years_of_experience || profile.availability_status) && (
                  <div className="space-y-3 pb-4 border-b border-border">
                    <h3 className="font-semibold text-lg">Informazioni Professionali</h3>
                    
                    {profile.artist_specialization && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm"><strong>Specializzazione:</strong> {profile.artist_specialization}</span>
                      </div>
                    )}
                    
                    {profile.education_level && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">
                          {profile.education_level.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    
                    {profile.years_of_experience && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm"><strong>Esperienza:</strong> {profile.years_of_experience} anni</span>
                      </div>
                    )}
                    
                    {profile.availability_status && (
                      <Badge variant={profile.availability_status === 'open_to_opportunities' ? 'default' : 'outline'}>
                        {profile.availability_status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="pb-4 border-b border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Lingue</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang: string) => (
                        <Badge key={lang} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Work Types */}
                {profile.preferred_work_types && profile.preferred_work_types.length > 0 && (
                  <div className="pb-4 border-b border-border">
                    <h3 className="font-semibold mb-2">Tipi di Lavoro Preferiti</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_work_types.map((type: string) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="pb-4 border-b border-border">
                    <h3 className="font-semibold mb-2">{t('profile.skills')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Programs */}
                {profile.programs && profile.programs.length > 0 && (
                  <div className="pb-4 border-b border-border">
                    <h3 className="font-semibold mb-2">{t('profile.programs')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.programs.map((program: string) => (
                        <Badge key={program} variant="outline">{program}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {(profile.instagram_url || profile.behance_url || profile.artstation_url || profile.linkedin_url || profile.twitter_url || profile.website_url) && (
                  <div>
                    <h3 className="font-semibold mb-3">Collegamenti Social & Portfolio</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.instagram_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.instagram_url, '_blank')}
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Button>
                      )}
                      {profile.behance_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.behance_url, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Behance
                        </Button>
                      )}
                      {profile.artstation_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.artstation_url, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          ArtStation
                        </Button>
                      )}
                      {profile.linkedin_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.linkedin_url, '_blank')}
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                      {profile.twitter_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.twitter_url, '_blank')}
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter/X
                        </Button>
                      )}
                      {profile.website_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start"
                          onClick={() => window.open(profile.website_url, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            {works.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">{t('profile.noWorks')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {works.map((work, index) => (
                  <Card 
                    key={work.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleWorkClick(work, index)}
                  >
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={work.file_url}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {work.description}
                        </p>
                      )}
                      {work.hashtags && work.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {work.hashtags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Activity feed coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      {/* Work Detail Modal */}
      <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {selectedWork && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedWork.file_url}
                  alt={selectedWork.title}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
                {works.length > 1 && (
                  <>
                    {selectedImageIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                    )}
                    {selectedImageIndex < works.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedWork.title}</h3>
                {selectedWork.description && (
                  <p className="text-muted-foreground mb-4">{selectedWork.description}</p>
                )}
                {selectedWork.hashtags && selectedWork.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedWork.hashtags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
