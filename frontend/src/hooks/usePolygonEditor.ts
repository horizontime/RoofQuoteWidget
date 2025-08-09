import { useState, useEffect, useCallback, useRef } from 'react';
import { createPolygon, calculatePolygonArea, metersToSquareFeet } from '../services/mapService';

interface UsePolygonEditorOptions {
  map: google.maps.Map | null;
  initialPath: google.maps.LatLngLiteral[];
  onAreaChange?: (areaSqFt: number) => void;
}

export const usePolygonEditor = ({
  map,
  initialPath = [],
  onAreaChange
}: UsePolygonEditorOptions) => {
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalPath, setOriginalPath] = useState<google.maps.LatLngLiteral[]>(initialPath);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  const handlePathChange = useCallback((polygon: google.maps.Polygon) => {
    if (onAreaChange) {
      const area = calculatePolygonArea(polygon);
      onAreaChange(metersToSquareFeet(area));
    }
  }, [onAreaChange]);

  // Create polygon when map and path are ready
  useEffect(() => {
    if (!map || initialPath.length === 0) return;

    // Clean up existing polygon if any
    if (polygon) {
      polygon.setMap(null);
    }

    // Create new polygon
    const newPolygon = createPolygon(map, initialPath, {
      editable: false,
      draggable: false
    });

    // Set up event listeners
    const pathListeners = [
      google.maps.event.addListener(newPolygon.getPath(), 'set_at', () => {
        handlePathChange(newPolygon);
      }),
      google.maps.event.addListener(newPolygon.getPath(), 'insert_at', () => {
        handlePathChange(newPolygon);
      }),
      google.maps.event.addListener(newPolygon.getPath(), 'remove_at', () => {
        handlePathChange(newPolygon);
      })
    ];

    listenersRef.current = pathListeners;
    setPolygon(newPolygon);
    setOriginalPath(initialPath);

    // Calculate initial area
    if (onAreaChange) {
      const area = calculatePolygonArea(newPolygon);
      onAreaChange(metersToSquareFeet(area));
    }

    // Cleanup
    return () => {
      listenersRef.current.forEach(listener => google.maps.event.removeListener(listener));
      newPolygon.setMap(null);
    };
  }, [map, JSON.stringify(initialPath)]);

  // Update polygon editability
  useEffect(() => {
    if (!polygon) return;

    polygon.setOptions({
      editable: isEditing,
      draggable: isEditing,
      strokeColor: isEditing ? '#3b82f6' : '#10b981',
      fillColor: isEditing ? '#3b82f6' : '#10b981'
    });
  }, [polygon, isEditing]);

  const startEditing = useCallback(() => {
    if (polygon) {
      // Save current path as original before editing
      const path = polygon.getPath();
      const points: google.maps.LatLngLiteral[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i);
        points.push({ lat: latLng.lat(), lng: latLng.lng() });
      }
      setOriginalPath(points);
      setIsEditing(true);
    }
  }, [polygon]);

  const saveChanges = useCallback(() => {
    if (polygon) {
      // Save current path as the new original
      const path = polygon.getPath();
      const points: google.maps.LatLngLiteral[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i);
        points.push({ lat: latLng.lat(), lng: latLng.lng() });
      }
      setOriginalPath(points);
      setIsEditing(false);
    }
  }, [polygon]);

  const resetChanges = useCallback(() => {
    if (polygon && isEditing) {
      // Reset to original path
      const path = polygon.getPath();
      path.clear();
      originalPath.forEach(point => {
        path.push(new google.maps.LatLng(point.lat, point.lng));
      });
      handlePathChange(polygon);
    }
  }, [polygon, originalPath, isEditing, handlePathChange]);

  const cancelChanges = useCallback(() => {
    if (polygon) {
      // Reset to original path and exit edit mode
      const path = polygon.getPath();
      path.clear();
      originalPath.forEach(point => {
        path.push(new google.maps.LatLng(point.lat, point.lng));
      });
      handlePathChange(polygon);
      setIsEditing(false);
    }
  }, [polygon, originalPath, handlePathChange]);

  return {
    polygon,
    isEditing,
    startEditing,
    saveChanges,
    resetChanges,
    cancelChanges
  };
};