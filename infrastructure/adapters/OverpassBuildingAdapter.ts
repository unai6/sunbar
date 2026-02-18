import type { BuildingRepository } from '../../domain/repositories/BuildingRepository';
import type { BoundingBox } from '../../domain/repositories/VenueRepository';
import { Building } from '../../domain/entities/Building';
import { Coordinates } from '../../domain/value-objects/Coordinates';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Overpass Building Adapter
 * Implements BuildingRepository using OpenStreetMap Overpass API
 */
export class OverpassBuildingAdapter implements BuildingRepository {
  private readonly apiUrl: string;

  constructor(apiUrl: string = 'https://overpass-api.de/api/interpreter') {
    this.apiUrl = apiUrl;
  }

  async findByBoundingBox(bbox: BoundingBox): Promise<Building[]> {
    const query = this.buildBuildingQuery(bbox);
    const response = await this.executeQuery(query);
    return this.parseBuildings(response);
  }

  async findNearby(center: Coordinates, radiusMeters: number): Promise<Building[]> {
    const query = this.buildNearbyQuery(center, radiusMeters);
    const response = await this.executeQuery(query);
    return this.parseBuildings(response);
  }

  private buildBuildingQuery(bbox: BoundingBox): string {
    const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

    return `
      [out:json][timeout:30];
      (
        way["building"](${bboxStr});
        relation["building"](${bboxStr});
      );
      out center;
    `;
  }

  private buildNearbyQuery(center: Coordinates, radiusMeters: number): string {
    return `
      [out:json][timeout:30];
      (
        way["building"](around:${radiusMeters},${center.latitude},${center.longitude});
        relation["building"](around:${radiusMeters},${center.latitude},${center.longitude});
      );
      out center;
    `;
  }

  private async executeQuery(query: string): Promise<OverpassResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private parseBuildings(response: OverpassResponse): Building[] {
    return response.elements
      .map(el => this.elementToBuilding(el))
      .filter((b): b is Building => b !== null);
  }

  private elementToBuilding(element: OverpassElement): Building | null {
    const tags = element.tags || {};

    // Get center coordinates
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;

    if (!lat || !lon) return null;

    try {
      // Parse height from tags
      const height = this.parseHeight(tags);
      const levels = this.parseLevels(tags);

      // Parse footprint if available
      const footprint = element.geometry?.map(point =>
        Coordinates.create({ latitude: point.lat, longitude: point.lon })
      );

      return Building.create({
        id: `${element.type}/${element.id}`,
        coordinates: Coordinates.create({ latitude: lat, longitude: lon }),
        height,
        levels,
        footprint
      });
    } catch {
      return null;
    }
  }

  private parseHeight(tags: Record<string, string>): number | undefined {
    const heightStr = tags.height || tags['building:height'];
    if (!heightStr) return undefined;

    // Parse height string (e.g., "10", "10m", "10 m")
    const match = heightStr.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private parseLevels(tags: Record<string, string>): number | undefined {
    const levelsStr = tags['building:levels'] || tags.levels;
    if (!levelsStr) return undefined;

    const levels = parseInt(levelsStr, 10);
    return isNaN(levels) ? undefined : levels;
  }
}
