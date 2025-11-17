import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const PrivacySettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    disable_view_tracking: false,
    anonymous_browsing: false,
    who_can_see_profile: 'everyone',
    who_can_message: 'everyone'
  });

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
    } catch (error) {
      console.error('Exception fetching privacy settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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
