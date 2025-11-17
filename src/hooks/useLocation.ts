import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fuzzCoordinates, LocationPrecision } from '@/utils/distance';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export const useLocation = (userId: string | undefined) => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    enabled: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (userId) {
      fetchLocationSettings();
    }
  }, [userId]);

  const fetchLocationSettings = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('profiles')
      .select('latitude, longitude, location_enabled, location_precision')
      .eq('id', userId)
      .single();

    if (data) {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        enabled: data.location_enabled || false,
        loading: false,
        error: null,
      });
    }
  };

  const enableLocation = async () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by your browser';
      setLocation((prev) => ({ ...prev, loading: false, error }));
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Get user's location precision preference
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_precision')
          .eq('id', userId!)
          .single();

        const precision: LocationPrecision = (profile?.location_precision as LocationPrecision) || 'balanced';
        
        // Fuzz coordinates based on privacy preference
        const fuzzed = fuzzCoordinates(latitude, longitude, precision);

        const { error } = await supabase
          .from('profiles')
          .update({
            latitude: fuzzed.latitude,
            longitude: fuzzed.longitude,
            location_enabled: true,
          })
          .eq('id', userId!);

        if (error) {
          setLocation((prev) => ({ ...prev, loading: false, error: error.message }));
          toast({
            title: 'Error',
            description: 'Failed to save location',
            variant: 'destructive',
          });
        } else {
          setLocation({
            latitude: fuzzed.latitude,
            longitude: fuzzed.longitude,
            enabled: true,
            loading: false,
            error: null,
          });
          toast({
            title: 'Location enabled',
            description: 'Your approximate location has been saved',
          });
        }
      },
      (error) => {
        setLocation((prev) => ({ ...prev, loading: false, error: error.message }));
        toast({
          title: 'Error',
          description: 'Failed to get your location. Please enable location permissions.',
          variant: 'destructive',
        });
      }
    );
  };

  const disableLocation = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        latitude: null,
        longitude: null,
        location_enabled: false,
      })
      .eq('id', userId!);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable location',
        variant: 'destructive',
      });
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        enabled: false,
        loading: false,
        error: null,
      });
      toast({
        title: 'Location disabled',
        description: 'Your location has been removed',
      });
    }
  };

  const updateMaxDistance = async (distanceKm: number) => {
    const { error } = await supabase
      .from('profiles')
      .update({ max_distance_km: distanceKm })
      .eq('id', userId!);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update distance',
        variant: 'destructive',
      });
    }
  };

  return {
    location,
    enableLocation,
    disableLocation,
    updateMaxDistance,
  };
};
