import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [emailOnMatch, setEmailOnMatch] = useState(true);
  const [emailOnMessage, setEmailOnMessage] = useState(true);
  const [emailOnOpportunity, setEmailOnOpportunity] = useState(true);
  const [emailOnComment, setEmailOnComment] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setEmailOnMatch(data.email_on_match);
      setEmailOnMessage(data.email_on_message);
      setEmailOnOpportunity(data.email_on_opportunity);
      setEmailOnComment(data.email_on_comment);
    } else if (user) {
      // Create default preferences
      await supabase.from('notification_preferences').insert({
        user_id: user.id
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_on_match: emailOnMatch,
        email_on_message: emailOnMessage,
        email_on_opportunity: emailOnOpportunity,
        email_on_comment: emailOnComment
      });

    if (error) {
      toast.error("Failed to update notification settings");
    } else {
      toast.success("Notification settings updated");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="match">Email on new match</Label>
        <Switch
          id="match"
          checked={emailOnMatch}
          onCheckedChange={setEmailOnMatch}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="message">Email on new message</Label>
        <Switch
          id="message"
          checked={emailOnMessage}
          onCheckedChange={setEmailOnMessage}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="opportunity">Email on new opportunity</Label>
        <Switch
          id="opportunity"
          checked={emailOnOpportunity}
          onCheckedChange={setEmailOnOpportunity}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="comment">Email on new comment</Label>
        <Switch
          id="comment"
          checked={emailOnComment}
          onCheckedChange={setEmailOnComment}
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        Save Notification Settings
      </Button>
    </div>
  );
};
