import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, Navigation } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function LocationSettings() {
  const { user } = useAuth();
  const { location, enableLocation, disableLocation, updateMaxDistance } = useLocation(user?.id);
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    if (user) {
      fetchMaxDistance();
    }
  }, [user]);

  const fetchMaxDistance = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('max_distance_km')
      .eq('id', user!.id)
      .single();

    if (data?.max_distance_km) {
      setMaxDistance(data.max_distance_km);
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
                  <span className="font-medium">Current Location</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
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
