import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HexagonAvatar } from "@/components/HexagonAvatar";
import { HexagonImage } from "@/components/HexagonImage";
import { supabase } from "@/integrations/supabase/client";
import { SearchFilters } from "./SearchFilters";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "@/utils/distance";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  programs: string[] | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export const SearchModal = ({ open, onOpenChange, initialQuery = "" }: SearchModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (open) {
      fetchResults();
    }
  }, [open, searchQuery, maxDistance, selectedSkills, selectedPrograms, category]);

  const fetchResults = async () => {
    setLoading(true);
    
    // Fetch profiles
    let profilesQuery = supabase.from("profiles").select("*");
    if (searchQuery) {
      profilesQuery = profilesQuery.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
    }
    if (selectedSkills.length > 0) {
      profilesQuery = profilesQuery.overlaps("skills", selectedSkills);
    }
    if (selectedPrograms.length > 0) {
      profilesQuery = profilesQuery.overlaps("programs", selectedPrograms);
    }
    const { data: profilesData } = await profilesQuery;
    
    // Filter by distance if location available
    let filteredProfiles = profilesData || [];
    if (userLocation?.latitude && userLocation?.longitude) {
      filteredProfiles = filteredProfiles.filter(profile => {
        if (!profile.latitude || !profile.longitude) return false;
        const dist = calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          profile.latitude,
          profile.longitude
        );
        return dist <= maxDistance;
      });
    }
    setProfiles(filteredProfiles);

    // Fetch opportunities
    let opportunitiesQuery = supabase
      .from("opportunities")
      .select("*, profiles(full_name, avatar_url)");
    if (searchQuery) {
      opportunitiesQuery = opportunitiesQuery.ilike("description", `%${searchQuery}%`);
    }
    if (category) {
      opportunitiesQuery = opportunitiesQuery.eq("artist_type", category);
    }
    const { data: opportunitiesData } = await opportunitiesQuery;
    setOpportunities(opportunitiesData || []);

    // Fetch works
    let worksQuery = supabase
      .from("works")
      .select("*, profiles(full_name, avatar_url)");
    if (searchQuery) {
      worksQuery = worksQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    const { data: worksData } = await worksQuery;
    setWorks(worksData || []);
    
    setLoading(false);
  };

  const handleProfileClick = (id: string) => {
    onOpenChange(false);
    navigate(`/profile/${id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMaxDistance(50);
    setSelectedSkills([]);
    setSelectedPrograms([]);
    setCategory("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 bg-card">
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for users, works, opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 text-lg h-12"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-border overflow-y-auto max-h-[300px]">
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
              locationEnabled={!!userLocation}
              showAllCategories={showAllCategories}
              setShowAllCategories={setShowAllCategories}
              showAllSkills={showAllSkills}
              setShowAllSkills={setShowAllSkills}
              showAllPrograms={showAllPrograms}
              setShowAllPrograms={setShowAllPrograms}
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
                <TabsTrigger value="works">Works ({works.length})</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="all" className="mt-0 space-y-6">
                  {profiles.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Users</h3>
                      <div className="grid gap-4">
                        {profiles.slice(0, 3).map((profile) => (
                          <Card
                            key={profile.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleProfileClick(profile.id)}
                          >
                            <div className="flex items-center gap-4">
                              <HexagonAvatar 
                                src={profile.avatar_url}
                                fallback={profile.full_name?.[0] || "?"}
                                size="md"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{profile.full_name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
                                {profile.skills && profile.skills.length > 0 && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {profile.skills.slice(0, 3).map((skill) => (
                                      <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {works.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Works</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {works.slice(0, 6).map((work) => (
                          <Card
                            key={work.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                            onClick={() => {
                              onOpenChange(false);
                              navigate(`/works`);
                            }}
                          >
                            <HexagonImage
                              src={work.watermark_url || work.file_url}
                              alt={work.title}
                              className="w-full h-40"
                            />
                            <div className="p-3">
                              <h4 className="font-semibold text-sm">{work.title}</h4>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {opportunities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Opportunities</h3>
                      <div className="grid gap-4">
                        {opportunities.slice(0, 3).map((opp) => (
                          <Card
                            key={opp.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                              onOpenChange(false);
                              navigate(`/opportunities`);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge variant="secondary" className="mb-2">{opp.artist_type}</Badge>
                                <p className="text-sm line-clamp-2">{opp.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">{opp.payment}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                  <div className="grid gap-4">
                    {profiles.map((profile) => (
                      <Card
                        key={profile.id}
                        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleProfileClick(profile.id)}
                      >
                        <div className="flex items-center gap-4">
                          <HexagonAvatar 
                            src={profile.avatar_url}
                            fallback={profile.full_name?.[0] || "?"}
                            size="md"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{profile.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{profile.bio}</p>
                            {profile.location && (
                              <p className="text-xs text-muted-foreground mt-1">{profile.location}</p>
                            )}
                            {profile.skills && profile.skills.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {profile.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="works" className="mt-0">
                  <div className="grid grid-cols-3 gap-4">
                    {works.map((work) => (
                      <Card
                        key={work.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/works`);
                        }}
                      >
                        <img
                          src={work.watermark_url || work.file_url}
                          alt={work.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-semibold">{work.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {work.description}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="opportunities" className="mt-0">
                  <div className="grid gap-4">
                    {opportunities.map((opp) => (
                      <Card
                        key={opp.id}
                        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/opportunities`);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{opp.artist_type}</Badge>
                              <Badge variant="outline">{opp.payment}</Badge>
                            </div>
                            <p className="text-sm">{opp.description}</p>
                            {opp.work_type && (
                              <p className="text-xs text-muted-foreground mt-2">Type: {opp.work_type}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
