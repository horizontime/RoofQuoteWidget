import { useEffect, useState, useRef } from 'react';
import { loadGoogleMaps, createMap } from '../services/mapService';

interface UseGoogleMapsOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: string;
}

export const useGoogleMaps = (
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseGoogleMapsOptions
) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();
        setIsLoaded(true);

        if (containerRef.current && !mapRef.current) {
          const newMap = await createMap(containerRef.current, {
            center: options.center,
            zoom: options.zoom,
            mapTypeId: options.mapTypeId || 'satellite',
            streetViewControl: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
              mapTypeIds: ['satellite', 'hybrid', 'roadmap']
            },
            tilt: 0,
            heading: 0,
            tiltControl: false,
            rotateControl: false,
            fullscreenControl: false,
            zoomControl: false, // We'll use custom zoom controls
          });

          mapRef.current = newMap;
          setMap(newMap);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error loading Google Maps:', err);
      }
    };

    initMap();
  }, []);

  const updateMapView = (center: google.maps.LatLngLiteral, zoom?: number) => {
    if (map) {
      map.setCenter(center);
      if (zoom !== undefined) {
        map.setZoom(zoom);
      }
    }
  };

  return {
    map,
    isLoaded,
    error,
    updateMapView
  };
};