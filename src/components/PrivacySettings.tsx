import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const PrivacySettings = () => {
  const { user } = useAuth();
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showLocation, setShowLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('profile_visibility, show_location')
      .eq('id', user?.id)
      .single();

    if (data) {
      setProfileVisibility(data.profile_visibility || 'public');
      setShowLocation(data.show_location ?? true);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        profile_visibility: profileVisibility,
        show_location: showLocation
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to update privacy settings");
    } else {
      toast.success("Privacy settings updated");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="visibility">Profile Visibility</Label>
        <Select value={profileVisibility} onValueChange={setProfileVisibility}>
          <SelectTrigger id="visibility" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public - Everyone can see</SelectItem>
            <SelectItem value="connections">Connections Only</SelectItem>
            <SelectItem value="private">Private - Hidden from search</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="location">Show Location</Label>
        <Switch
          id="location"
          checked={showLocation}
          onCheckedChange={setShowLocation}
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        Save Privacy Settings
      </Button>
    </div>
  );
};
