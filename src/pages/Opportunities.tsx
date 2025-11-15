import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, Star, StarOff, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, formatDistance } from "@/utils/distance";

interface Opportunity {
  id: string;
  artist_type: string;
  description: string;
  payment: string;
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
  const [artistType, setArtistType] = useState("");
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
      console.error("Error fetching favorites:", error);
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
      console.error("Error fetching opportunity favorites:", error);
    }
  };

  const toggleFavorite = async (creatorId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (favorites.has(creatorId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('favorited_user_id', creatorId);

        if (error) throw error;
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(creatorId);
          return newSet;
        });
        toast({
          title: "Removed from favorites"
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            favorited_user_id: creatorId
          });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, creatorId]));
        toast({
          title: "Added to favorites"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating favorites",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleOpportunityFavorite = async (opportunityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });
        toast({
          title: "Removed from favorites"
        });
      } else {
        const { error } = await supabase
          .from('opportunity_favorites')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId
          });

        if (error) throw error;
        setOpportunityFavorites(prev => new Set([...prev, opportunityId]));
        toast({
          title: "Added to favorites"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating favorites",
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

    if (!artistType || !description || !payment) return;

    try {
      if (editingOpportunity) {
        // Update existing opportunity
        const { error } = await supabase
          .from('opportunities')
          .update({
            artist_type: artistType,
            description,
            payment
          })
          .eq('id', editingOpportunity.id);

        if (error) throw error;

        toast({
          title: "Opportunity updated!",
          description: "Your changes have been saved."
        });
      } else {
        // Create new opportunity
        const { error } = await supabase
          .from('opportunities')
          .insert({
            creator_id: user.id,
            artist_type: artistType,
            description,
            payment
          });

        if (error) throw error;

        toast({
          title: "Opportunity posted!",
          description: "Your opportunity is now live."
        });
      }

      setArtistType("");
      setDescription("");
      setPayment("");
      setShowForm(false);
      setEditingOpportunity(null);
      fetchOpportunities();
    } catch (error: any) {
      toast({
        title: editingOpportunity ? "Error updating opportunity" : "Error posting opportunity",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (opp: Opportunity) => {
    setEditingOpportunity(opp);
    setArtistType(opp.artist_type);
    setDescription(opp.description);
    setPayment(opp.payment);
    setShowForm(true);
  };

  const handleDelete = async (oppId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', oppId);

      if (error) throw error;

      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed."
      });
      fetchOpportunities();
    } catch (error: any) {
      toast({
        title: "Error deleting opportunity",
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
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

          {showForm && (
            <Card className="p-6 mb-6 bg-card border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {editingOpportunity ? 'Edit Opportunity' : 'Post a New Opportunity'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Looking for...
                  </label>
                  <Select value={artistType} onValueChange={setArtistType}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select artist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Photographer">Photographer</SelectItem>
                      <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                      <SelectItem value="Illustrator">Illustrator</SelectItem>
                      <SelectItem value="Videographer">Videographer</SelectItem>
                      <SelectItem value="Animator">Animator</SelectItem>
                      <SelectItem value="3D Artist">3D Artist</SelectItem>
                      <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Job Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project, requirements, timeline, etc."
                    className="min-h-[120px] bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Payment
                  </label>
                  <Input
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    placeholder="e.g., $500, €1000, Negotiable"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingOpportunity ? 'Save Changes' : 'Post Opportunity'}
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
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card
                key={opportunity.id}
                className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          Looking for {opportunity.artist_type}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>Posted by {opportunity.profiles.full_name}</span>
                          <span>•</span>
                          <span>{getTimeAgo(opportunity.created_at)}</span>
                          {userLocation && opportunity.profiles.latitude && opportunity.profiles.longitude && opportunity.profiles.location_enabled && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-primary font-medium">
                                <MapPin className="h-3 w-3" />
                                {formatDistance(
                                  calculateDistance(
                                    userLocation.latitude,
                                    userLocation.longitude,
                                    opportunity.profiles.latitude,
                                    opportunity.profiles.longitude
                                  )
                                )} away
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-primary">
                          {opportunity.payment}
                        </p>
                        {user && (
                          <button
                            onClick={(e) => toggleOpportunityFavorite(opportunity.id, e)}
                            className="p-2 hover:bg-accent rounded-full transition-colors"
                            title={opportunityFavorites.has(opportunity.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {opportunityFavorites.has(opportunity.id) ? (
                              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <Star className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground/90 mb-4">{opportunity.description}</p>
                    <div className="flex gap-2">
                      {user && user.id !== opportunity.creator_id && (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleApplyClick(opportunity.id, opportunity.creator_id)}
                        >
                          Apply Now
                        </Button>
                      )}
                      {user && user.id === opportunity.creator_id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(opportunity)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(opportunity.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
    </div>
  );
};

export default Opportunities;
