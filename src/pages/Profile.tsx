import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { Upload, Briefcase, Award, Star, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Profile {
  full_name: string;
  email: string;
  bio: string;
  portfolio_url: string;
}

interface Favorite {
  id: string;
  favorited_user_id: string;
  profiles: {
    full_name: string;
    bio: string;
  };
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    bio: '',
    portfolio_url: ''
  });
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchFavorites();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          bio: data.bio || '',
          portfolio_url: data.portfolio_url || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
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
        .select(`
          id,
          favorited_user_id,
          profiles!favorites_favorited_user_id_fkey(full_name, bio)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          portfolio_url: profile.portfolio_url
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved."
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "Removed from favorites"
      });
    } catch (error: any) {
      toast({
        title: "Error removing favorite",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-3xl mx-auto px-4 pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your Profile
          </h1>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-foreground">Profile Picture</h3>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={4}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Portfolio */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
              <Award className="w-5 h-5" />
              Portfolio
            </h3>
            <div>
              <Label htmlFor="portfolio" className="text-foreground">Portfolio URL</Label>
              <Input
                id="portfolio"
                value={profile.portfolio_url}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="bg-background border-border text-foreground"
              />
            </div>
          </Card>

          {/* Favorites */}
          {favorites.length > 0 && (
            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Your Favorites ({favorites.length})
              </h3>
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{favorite.profiles.full_name}</p>
                      {favorite.profiles.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {favorite.profiles.bio}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-primary text-white hover:opacity-90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
