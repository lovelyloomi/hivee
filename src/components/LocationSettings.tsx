import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Navigation, Shield } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LocationPrecision } from '@/utils/distance';
import { toast } from 'sonner';

export default function LocationSettings() {
  const { user } = useAuth();
  const { location, enableLocation, disableLocation, updateMaxDistance } = useLocation(user?.id);
  const [maxDistance, setMaxDistance] = useState(50);
  const [precision, setPrecision] = useState<LocationPrecision>('balanced');

  useEffect(() => {
    if (user) {
      fetchMaxDistance();
    }
  }, [user]);

  const fetchMaxDistance = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('max_distance_km, location_precision')
      .eq('id', user!.id)
      .single();

    if (data?.max_distance_km) {
      setMaxDistance(data.max_distance_km);
    }
    if (data?.location_precision) {
      setPrecision(data.location_precision as LocationPrecision);
    }
  };

  const handleDistanceChange = (value: number[]) => {
    setMaxDistance(value[0]);
  };

  const handleDistanceCommit = () => {
    updateMaxDistance(maxDistance);
  };

  const handleToggle = () => {
    if (location.enabled) {
      disableLocation();
    } else {
      enableLocation();
    }
  };

  const handlePrecisionChange = async (value: LocationPrecision) => {
    setPrecision(value);
    
    const { error } = await supabase
      .from('profiles')
      .update({ location_precision: value })
      .eq('id', user!.id);

    if (error) {
      toast.error('Failed to update location precision');
    } else {
      toast.success('Location precision updated');
      // Re-enable location to apply new precision
      if (location.enabled) {
        enableLocation();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Location Settings
        </CardTitle>
        <CardDescription>
          Enable location to find local users and opportunities nearby
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="location-toggle">Enable Location</Label>
            <p className="text-sm text-muted-foreground">
              Share your location to discover nearby opportunities
            </p>
          </div>
          <Switch
            id="location-toggle"
            checked={location.enabled}
            onCheckedChange={handleToggle}
            disabled={location.loading}
          />
        </div>

        {location.enabled && (
          <>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  Location Privacy Level
                </Label>
                <RadioGroup value={precision} onValueChange={(v) => handlePrecisionChange(v as LocationPrecision)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="high_privacy" id="high_privacy" />
                      <div className="flex-1">
                        <Label htmlFor="high_privacy" className="font-medium cursor-pointer">
                          High Privacy
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your location is fuzzy within ~2 km. Others see distance ranges like "1-5 km away"
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
                          Your location is fuzzy within ~1 km. Good balance of privacy and accuracy
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
                          Your location is fuzzy within ~500 m. More accurate for local matching
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Search Radius</Label>
                <span className="text-sm font-medium text-primary">
                  {maxDistance < 1 ? `${(maxDistance * 1000).toFixed(0)} m` : `${maxDistance} km`}
                </span>
              </div>
              <Slider
                value={[maxDistance]}
                onValueChange={handleDistanceChange}
                onValueCommit={handleDistanceCommit}
                min={0.001}
                max={100}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the distance to find users and opportunities (0.001 km to 100 km)
              </p>
            </div>

            {location.latitude && location.longitude && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="font-medium">Location Status</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your approximate location is saved. Others will only see distance ranges, never your exact coordinates.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={enableLocation}
                  disabled={location.loading}
                  className="w-full"
                >
                  Update Location
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
