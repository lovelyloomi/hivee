import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LocationPrecision } from '@/utils/distance';
import { Shield } from 'lucide-react';

export const PrivacySettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    disable_view_tracking: false,
    anonymous_browsing: false,
    who_can_see_profile: 'everyone',
    who_can_message: 'everyone'
  });
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('balanced');

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching privacy settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const { error: insertError } = await supabase
          .from('privacy_settings')
          .insert({ user_id: user.id });

        if (insertError) {
          console.error('Error creating privacy settings:', insertError);
        }
      }

      // Fetch location precision from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('location_precision')
        .eq('id', user.id)
        .single();

      if (profileData?.location_precision) {
        setLocationPrecision(profileData.location_precision as LocationPrecision);
      }
    } catch (error) {
      console.error('Exception fetching privacy settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update privacy settings
      const { error: privacyError } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (privacyError) throw privacyError;

      // Update location precision in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ location_precision: locationPrecision })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control who can see your profile and interact with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="view-tracking">Disable View Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent others from seeing that you viewed their profile
                </p>
              </div>
              <Switch
                id="view-tracking"
                checked={settings.disable_view_tracking}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, disable_view_tracking: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Anonymous Browsing</Label>
                <p className="text-sm text-muted-foreground">
                  Browse profiles without leaving a trace
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={settings.anonymous_browsing}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, anonymous_browsing: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Who can see your profile</Label>
              <Select
                value={settings.who_can_see_profile}
                onValueChange={(value) => 
                  setSettings({ ...settings, who_can_see_profile: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="matches_only">Matches Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  Location Privacy Level
                </Label>
                <RadioGroup value={locationPrecision} onValueChange={(v) => setLocationPrecision(v as LocationPrecision)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="high_privacy" id="high_privacy" />
                      <div className="flex-1">
                        <Label htmlFor="high_privacy" className="font-medium cursor-pointer">
                          High Privacy
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Location fuzzy within ~2 km. Others see distance ranges only
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <div className="flex-1">
                        <Label htmlFor="balanced" className="font-medium cursor-pointer">
                          Balanced (Recommended)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Location fuzzy within ~1 km. Good balance of privacy and accuracy
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="precise" id="precise" />
                      <div className="flex-1">
                        <Label htmlFor="precise" className="font-medium cursor-pointer">
                          Precise
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Location fuzzy within ~500 m. More accurate for local matching
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Who can message you</Label>
              <Select
                value={settings.who_can_message}
                onValueChange={(value) => 
                  setSettings({ ...settings, who_can_message: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="matches_only">Matches Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
