import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useUserLocation } from "@/hooks/useLocation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters } from "@/components/SearchFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { calculateDistance, formatDistance } from "@/utils/distance";
import { Users, Briefcase, Image as ImageIcon } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  programs: string[] | null;
  latitude: number | null;
  longitude: number | null;
  location_enabled: boolean | null;
}

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { location } = useUserLocation(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user, searchQuery, maxDistance, selectedSkills, selectedPrograms, category]);

  const fetchResults = async () => {
    // Fetch profiles
    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id || '');

    if (searchQuery) {
      profileQuery = profileQuery.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }

    const { data: profileData } = await profileQuery;
    
    // Filter by skills and programs
    let filteredProfiles = profileData || [];
    if (selectedSkills.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.skills?.some(s => selectedSkills.includes(s))
      );
    }
    if (selectedPrograms.length > 0) {
      filteredProfiles = filteredProfiles.filter(p =>
        p.programs?.some(pr => selectedPrograms.includes(pr))
      );
    }

    // Filter by distance if location enabled
    if (location.enabled && location.latitude && location.longitude) {
      filteredProfiles = filteredProfiles.filter(profile => {
        if (!profile.location_enabled || !profile.latitude || !profile.longitude) return false;
        const distance = calculateDistance(
          location.latitude!,
          location.longitude!,
          profile.latitude,
          profile.longitude
        );
        return distance <= maxDistance;
      });
    }

    setProfiles(filteredProfiles);

    // Fetch opportunities
    let oppQuery = supabase.from('opportunities').select('*, profiles(full_name, avatar_url)');
    if (searchQuery) {
      oppQuery = oppQuery.ilike('description', `%${searchQuery}%`);
    }
    if (category) {
      oppQuery = oppQuery.eq('artist_type', category);
    }
    const { data: oppData } = await oppQuery;
    setOpportunities(oppData || []);

    // Fetch works
    let worksQuery = supabase.from('works').select('*, profiles(full_name, avatar_url)');
    if (searchQuery) {
      worksQuery = worksQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    const { data: worksData } = await worksQuery;
    setWorks(worksData || []);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold mb-6">Search</h1>

        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <aside>
            <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              maxDistance={maxDistance}
              setMaxDistance={setMaxDistance}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
              selectedPrograms={selectedPrograms}
              setSelectedPrograms={setSelectedPrograms}
              category={category}
              setCategory={setCategory}
              locationEnabled={location.enabled}
            />
          </aside>

          <div>
            <Tabs defaultValue="users">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">
                  <Users className="mr-2 h-4 w-4" />
                  Users ({profiles.length})
                </TabsTrigger>
                <TabsTrigger value="opportunities">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Jobs ({opportunities.length})
                </TabsTrigger>
                <TabsTrigger value="works">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Works ({works.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                {profiles.map((profile) => {
                  const distance = location.enabled && location.latitude && location.longitude && 
                    profile.location_enabled && profile.latitude && profile.longitude
                    ? calculateDistance(location.latitude, location.longitude, profile.latitude, profile.longitude)
                    : null;

                  return (
                    <Card key={profile.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/swipe?user=${profile.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{profile.full_name}</h3>
                              {distance && (
                                <Badge variant="secondary">{formatDistance(distance)}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                            {profile.skills && profile.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {profile.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="cursor-pointer hover:bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={opp.profiles.avatar_url || undefined} />
                          <AvatarFallback>{opp.profiles.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge>{opp.artist_type}</Badge>
                            <Badge variant="secondary">{opp.payment}</Badge>
                          </div>
                          <p className="text-sm mt-2 line-clamp-3">{opp.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">Posted by {opp.profiles.full_name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="works" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {works.map((work) => (
                  <Card key={work.id} className="cursor-pointer hover:bg-accent/50">
                    <CardContent className="p-0">
                      {work.file_type === 'image' && (
                        <img src={work.file_url} alt={work.title} className="w-full h-48 object-cover rounded-t-lg" />
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm line-clamp-1">{work.title}</h4>
                        <p className="text-xs text-muted-foreground">by {work.profiles.full_name}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
