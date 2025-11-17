import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Star, StarOff, MapPin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { ApplicationsList } from "@/components/ApplicationsList";
import { OpportunityFilters } from "@/components/OpportunityFilters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, formatDistanceRange } from "@/utils/distance";

interface Opportunity {
  id: string;
  artist_type: string;
  description: string;
  payment: string;
  work_type: string | null;
  creator_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    latitude: number | null;
    longitude: number | null;
    location_enabled: boolean | null;
  };
}

const Opportunities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [artistType, setArtistType] = useState("");
  const [workType, setWorkType] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [opportunityFavorites, setOpportunityFavorites] = useState<Set<string>>(new Set());
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Filters
  const [filterArtistType, setFilterArtistType] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("all");
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    fetchOpportunities();
    if (user) {
      fetchUserLocation();
      fetchFavorites();
      fetchOpportunityFavorites();
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

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_creator_id_fkey(full_name, latitude, longitude, location_enabled)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading opportunities",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('favorited_user_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.favorited_user_id) || []));
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchOpportunityFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('opportunity_favorites')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setOpportunityFavorites(new Set(data?.map(f => f.opportunity_id) || []));
    } catch (error: any) {
      console.error('Error fetching opportunity favorites:', error);
    }
  };

  const toggleFavorite = async (favoriteUserId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (favorites.has(favoriteUserId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorited_user_id', favoriteUserId);

        if (error) throw error;
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(favoriteUserId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, favorited_user_id: favoriteUserId });

        if (error) throw error;
        setFavorites(prev => new Set(prev).add(favoriteUserId));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleOpportunityFavorite = async (opportunityId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (opportunityFavorites.has(opportunityId)) {
        const { error } = await supabase
          .from('opportunity_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);

        if (error) throw error;
        setOpportunityFavorites(prev => {
          const next = new Set(prev);
          next.delete(opportunityId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('opportunity_favorites')
          .insert({ user_id: user.id, opportunity_id: opportunityId });

        if (error) throw error;
        setOpportunityFavorites(prev => new Set(prev).add(opportunityId));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (editingOpportunity) {
        const { error } = await supabase
          .from('opportunities')
          .update({
            artist_type: artistType,
            work_type: workType,
            description,
            payment,
          })
          .eq('id', editingOpportunity.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Opportunity updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert({
            creator_id: user.id,
            artist_type: artistType,
            work_type: workType,
            description,
            payment,
          });

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Opportunity posted successfully"
        });
      }

      setShowForm(false);
      setArtistType("");
      setWorkType("");
      setDescription("");
      setPayment("");
      setEditingOpportunity(null);
      fetchOpportunities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setArtistType(opportunity.artist_type);
    setWorkType(opportunity.work_type || "");
    setDescription(opportunity.description);
    setPayment(opportunity.payment);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Opportunity deleted successfully"
      });

      fetchOpportunities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleApplyClick = (opportunityId: string, creatorId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedOpportunity(opportunityId);
    setSelectedCreatorId(creatorId);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opportunity => {
    if (filterArtistType && opportunity.artist_type !== filterArtistType) {
      return false;
    }

    if (filterWorkType && filterWorkType !== "all" && opportunity.work_type !== filterWorkType) {
      return false;
    }

    if (userLocation && opportunity.profiles?.latitude && opportunity.profiles?.longitude && opportunity.profiles.location_enabled) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        opportunity.profiles.latitude,
        opportunity.profiles.longitude
      );
      if (distance > maxDistance) {
        return false;
      }
    }

    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <div className="container mx-auto px-4 pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
            <div className="flex gap-2">
              {user && (
                <Button
                  onClick={() => setShowApplications(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Applications
                </Button>
              )}
              <Button
                onClick={() => {
                  if (!user) {
                    navigate('/auth');
                    return;
                  }
                  setShowForm(!showForm);
                }}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Post Opportunity
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="p-6 mb-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {editingOpportunity ? 'Edit Opportunity' : 'Post a New Opportunity'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Looking for... *
                  </label>
                  <Select value={artistType} onValueChange={setArtistType} required>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select artist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                      <SelectItem value="Illustrator">Illustrator</SelectItem>
                      <SelectItem value="3D Artist">3D Artist</SelectItem>
                      <SelectItem value="Animator">Animator</SelectItem>
                      <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                      <SelectItem value="Character Designer">Character Designer</SelectItem>
                      <SelectItem value="Environment Artist">Environment Artist</SelectItem>
                      <SelectItem value="Concept Artist">Concept Artist</SelectItem>
                      <SelectItem value="VFX Artist">VFX Artist</SelectItem>
                      <SelectItem value="Motion Designer">Motion Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Work Type *
                  </label>
                  <Select value={workType} onValueChange={setWorkType} required>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="part_time">Part-Time</SelectItem>
                      <SelectItem value="full_time">Full-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Job Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the opportunity, requirements, and what you're looking for..."
                    className="min-h-[120px] bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Payment/Budget *
                  </label>
                  <Input
                    type="text"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    placeholder="e.g., $500-$1000, Negotiable, etc."
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="submit">
                    {editingOpportunity ? 'Update' : 'Post'} Opportunity
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingOpportunity(null);
                      setArtistType("");
                      setDescription("");
                      setPayment("");
                      setWorkType("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <OpportunityFilters
                artistType={filterArtistType}
                setArtistType={setFilterArtistType}
                workType={filterWorkType}
                setWorkType={setFilterWorkType}
                maxDistance={maxDistance}
                setMaxDistance={setMaxDistance}
                locationEnabled={!!userLocation}
              />
            </div>

            <div className="lg:col-span-3 space-y-4">
              {filteredOpportunities.length === 0 ? (
                <Card className="p-8 text-center bg-card border-border">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No opportunities found</p>
                </Card>
              ) : (
                filteredOpportunities.map((opportunity) => {
                  const distance = userLocation && opportunity.profiles?.latitude && opportunity.profiles?.longitude
                    ? calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        opportunity.profiles.latitude,
                        opportunity.profiles.longitude
                      )
                    : null;

                  return (
                    <Card key={opportunity.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{opportunity.artist_type}</h3>
                            {opportunity.work_type && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {opportunity.work_type === 'commission' ? 'Commission' : 
                                 opportunity.work_type === 'part_time' ? 'Part-Time' : 'Full-Time'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Posted by {opportunity.profiles?.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{getTimeAgo(opportunity.created_at)}</span>
                            {distance !== null && opportunity.profiles?.location_enabled && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{formatDistanceRange(distance)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(opportunity.creator_id)}
                          >
                            {favorites.has(opportunity.creator_id) ? (
                              <Star className="h-5 w-5 fill-current" />
                            ) : (
                              <StarOff className="h-5 w-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleOpportunityFavorite(opportunity.id)}
                          >
                            {opportunityFavorites.has(opportunity.id) ? (
                              <Briefcase className="h-5 w-5 fill-current" />
                            ) : (
                              <Briefcase className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <p className="text-foreground mb-4 whitespace-pre-line">{opportunity.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{opportunity.payment}</span>
                        {user?.id === opportunity.creator_id ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(opportunity)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(opportunity.id)}>
                              Delete
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handleApplyClick(opportunity.id, opportunity.creator_id)}>
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {selectedOpportunity && selectedCreatorId && user && (
        <ApplicationDialog
          open={!!selectedOpportunity}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOpportunity(null);
              setSelectedCreatorId(null);
            }
          }}
          opportunityId={selectedOpportunity}
          userId={user.id}
          creatorId={selectedCreatorId}
        />
      )}

      {user && (
        <ApplicationsList
          open={showApplications}
          onOpenChange={setShowApplications}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Opportunities;
