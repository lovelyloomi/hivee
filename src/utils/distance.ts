export type LocationPrecision = 'high_privacy' | 'balanced' | 'precise';

/**
 * Fuzz coordinates based on privacy level
 * - high_privacy: ±2km (1 decimal place)
 * - balanced: ±1km (2 decimal places)
 * - precise: ±500m (3 decimal places)
 */
export const fuzzCoordinates = (
  latitude: number,
  longitude: number,
  precision: LocationPrecision
): { latitude: number; longitude: number } => {
  const decimalPlaces = {
    high_privacy: 1,  // ~11km precision
    balanced: 2,      // ~1.1km precision
    precise: 3        // ~110m precision
  };

  const places = decimalPlaces[precision];
  
  return {
    latitude: Number(latitude.toFixed(places)),
    longitude: Number(longitude.toFixed(places))
  };
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance as a privacy-friendly range
 */
export const formatDistanceRange = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return "Less than 1 km away";
  } else if (distanceKm < 5) {
    return "1-5 km away";
  } else if (distanceKm < 10) {
    return "5-10 km away";
  } else if (distanceKm < 25) {
    return "10-25 km away";
  } else if (distanceKm < 50) {
    return "25-50 km away";
  } else if (distanceKm < 100) {
    return "50-100 km away";
  } else {
    return "100+ km away";
  }
};

/**
 * Legacy exact distance formatter - use formatDistanceRange instead for privacy
 * @deprecated Use formatDistanceRange for privacy-friendly display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
};
