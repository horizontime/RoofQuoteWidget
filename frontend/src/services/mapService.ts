import { Loader } from '@googlemaps/js-api-loader';

let mapsLoaded = false;
let mapsLoadPromise: Promise<void> | null = null;

export const loadGoogleMaps = async (): Promise<void> => {
  if (mapsLoaded) return;
  
  if (mapsLoadPromise) {
    await mapsLoadPromise;
    return;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
  }

  const loader = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places', 'drawing', 'geometry']
  });

  mapsLoadPromise = loader.load().then(() => {
    mapsLoaded = true;
  });

  await mapsLoadPromise;
};

export const createMap = async (
  container: HTMLElement,
  options: google.maps.MapOptions
): Promise<google.maps.Map> => {
  await loadGoogleMaps();
  return new google.maps.Map(container, options);
};

export const createPolygon = (
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[],
  options?: google.maps.PolygonOptions
): google.maps.Polygon => {
  return new google.maps.Polygon({
    paths,
    strokeColor: options?.strokeColor || '#10b981',
    strokeOpacity: options?.strokeOpacity || 0.8,
    strokeWeight: options?.strokeWeight || 2,
    fillColor: options?.fillColor || '#10b981',
    fillOpacity: options?.fillOpacity || 0.35,
    map,
    ...options,
  });
};

export const calculatePolygonArea = (polygon: google.maps.Polygon): number => {
  // Returns area in square meters
  return google.maps.geometry.spherical.computeArea(polygon.getPath());
};

export const metersToSquareFeet = (squareMeters: number): number => {
  return squareMeters * 10.764;
};

export const geocodeAddress = async (address: string): Promise<google.maps.GeocoderResult> => {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0]);
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

export const convertPolygonPointsToGoogleMaps = (
  points: Array<{ lat: number; lng: number }>
): google.maps.LatLngLiteral[] => {
  return points.map(point => ({
    lat: point.lat,
    lng: point.lng
  }));
};