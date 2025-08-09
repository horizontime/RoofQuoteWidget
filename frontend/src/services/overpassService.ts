import axios from 'axios';

export interface PolygonPoint {
  lat: number;
  lng: number;
}

export interface BuildingFootprint {
  id: string;
  polygon: PolygonPoint[];
  area_sqm: number;
  area_sqft: number;
}

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export class OverpassService {
  private static buildQuery(lat: number, lon: number, radius: number = 50): string {
    return `
      [out:json][timeout:25];
      (
        way["building"](around:${radius},${lat},${lon});
        relation["building"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `.trim();
  }

  private static parseOSMResponse(data: any): BuildingFootprint[] {
    const buildings: BuildingFootprint[] = [];
    
    // Create a map of node IDs to coordinates
    const nodes: Record<number, [number, number]> = {};
    for (const element of data.elements || []) {
      if (element.type === 'node') {
        nodes[element.id] = [element.lat, element.lon];
      }
    }
    
    // Process ways (most buildings are represented as ways)
    for (const element of data.elements || []) {
      if (element.type === 'way' && element.tags?.building) {
        const points: PolygonPoint[] = [];
        
        for (const nodeId of element.nodes || []) {
          if (nodes[nodeId]) {
            const [lat, lon] = nodes[nodeId];
            points.push({ lat, lng: lon });
          }
        }
        
        if (points.length >= 3) {
          const area_sqm = this.calculatePolygonArea(points);
          buildings.push({
            id: `way/${element.id}`,
            polygon: points,
            area_sqm,
            area_sqft: area_sqm * 10.764
          });
        }
      }
    }
    
    return buildings;
  }

  private static calculatePolygonArea(points: PolygonPoint[]): number {
    if (points.length < 3) return 0;
    
    // Simplified area calculation using shoelace formula
    const lat_avg = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    
    // Convert degrees to meters (approximate)
    const lat_to_m = 111320.0;
    const lon_to_m = 111320.0 * Math.abs(Math.cos(lat_avg * Math.PI / 180));
    
    // Convert points to local coordinates
    const localPoints = points.map(p => ({
      x: p.lng * lon_to_m,
      y: p.lat * lat_to_m
    }));
    
    // Shoelace formula
    let area = 0;
    const n = localPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += localPoints[i].x * localPoints[j].y;
      area -= localPoints[j].x * localPoints[i].y;
    }
    
    return Math.abs(area) / 2;
  }

  static async fetchBuildings(lat: number, lon: number, radius: number = 50): Promise<BuildingFootprint[]> {
    const query = this.buildQuery(lat, lon, radius);
    
    try {
      const response = await axios.post(
        OVERPASS_API_URL,
        query,
        {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 30000
        }
      );
      
      return this.parseOSMResponse(response.data);
    } catch (error) {
      console.error('Error fetching buildings from Overpass API:', error);
      throw new Error('Failed to fetch building data');
    }
  }

  static async getClosestBuilding(lat: number, lon: number, radius: number = 50): Promise<BuildingFootprint | null> {
    const buildings = await this.fetchBuildings(lat, lon, radius);
    
    if (buildings.length === 0) return null;
    
    // Find the building with centroid closest to target coordinates
    let closestBuilding = buildings[0];
    let minDistance = Infinity;
    
    for (const building of buildings) {
      // Calculate centroid
      const centroid = {
        lat: building.polygon.reduce((sum, p) => sum + p.lat, 0) / building.polygon.length,
        lng: building.polygon.reduce((sum, p) => sum + p.lng, 0) / building.polygon.length
      };
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(centroid.lat - lat, 2) + 
        Math.pow(centroid.lng - lon, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestBuilding = building;
      }
    }
    
    return closestBuilding;
  }
}