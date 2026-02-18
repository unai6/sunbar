import type { VenueRepository, BoundingBox } from '../../domain/repositories/VenueRepository';
import { Venue, VenueType } from '../../domain/entities/Venue';
import { Coordinates } from '../../domain/value-objects/Coordinates';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Overpass API Adapter
 * Implements VenueRepository using OpenStreetMap Overpass API
 */
export class OverpassVenueAdapter implements VenueRepository {
  private readonly apiUrl: string;

  constructor(apiUrl: string = 'https://overpass-api.de/api/interpreter') {
    this.apiUrl = apiUrl;
  }

  async findByBoundingBox(bbox: BoundingBox): Promise<Venue[]> {
    const query = this.buildVenueQuery(bbox);
    const response = await this.executeQuery(query);
    return this.parseVenues(response);
  }

  async findNearby(center: Coordinates, radiusMeters: number): Promise<Venue[]> {
    const query = this.buildNearbyQuery(center, radiusMeters);
    const response = await this.executeQuery(query);
    return this.parseVenues(response);
  }

  async findById(id: string): Promise<Venue | null> {
    // Extract OSM type and id from our id format (e.g., "node/123456")
    const [osmType, osmId] = id.split('/');
    if (!osmType || !osmId) return null;

    const query = `
      [out:json][timeout:10];
      ${osmType}(${osmId});
      out center;
    `;

    const response = await this.executeQuery(query);
    const venues = this.parseVenues(response);
    return venues[0] || null;
  }

  private buildVenueQuery(bbox: BoundingBox): string {
    const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

    return `
      [out:json][timeout:30];
      (
        node["amenity"="bar"](${bboxStr});
        node["amenity"="restaurant"](${bboxStr});
        node["amenity"="cafe"](${bboxStr});
        node["amenity"="pub"](${bboxStr});
        node["amenity"="biergarten"](${bboxStr});
        way["amenity"="bar"](${bboxStr});
        way["amenity"="restaurant"](${bboxStr});
        way["amenity"="cafe"](${bboxStr});
        way["amenity"="pub"](${bboxStr});
        way["amenity"="biergarten"](${bboxStr});
      );
      out center;
    `;
  }

  private buildNearbyQuery(center: Coordinates, radiusMeters: number): string {
    return `
      [out:json][timeout:30];
      (
        node["amenity"="bar"](around:${radiusMeters},${center.latitude},${center.longitude});
        node["amenity"="restaurant"](around:${radiusMeters},${center.latitude},${center.longitude});
        node["amenity"="cafe"](around:${radiusMeters},${center.latitude},${center.longitude});
        node["amenity"="pub"](around:${radiusMeters},${center.latitude},${center.longitude});
        node["amenity"="biergarten"](around:${radiusMeters},${center.latitude},${center.longitude});
        way["amenity"="bar"](around:${radiusMeters},${center.latitude},${center.longitude});
        way["amenity"="restaurant"](around:${radiusMeters},${center.latitude},${center.longitude});
        way["amenity"="cafe"](around:${radiusMeters},${center.latitude},${center.longitude});
        way["amenity"="pub"](around:${radiusMeters},${center.latitude},${center.longitude});
        way["amenity"="biergarten"](around:${radiusMeters},${center.latitude},${center.longitude});
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

  private parseVenues(response: OverpassResponse): Venue[] {
    return response.elements
      .filter(el => el.tags?.name) // Only venues with names
      .map(el => this.elementToVenue(el))
      .filter((v): v is Venue => v !== null);
  }

  private elementToVenue(element: OverpassElement): Venue | null {
    const tags = element.tags || {};

    // Get coordinates (nodes have lat/lon, ways have center)
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;

    if (!lat || !lon) return null;

    const venueType = this.mapAmenityToVenueType(tags.amenity);
    if (!venueType) return null;

    try {
      return Venue.create({
        id: `${element.type}/${element.id}`,
        name: tags.name || 'Unknown',
        type: venueType,
        coordinates: Coordinates.create({ latitude: lat, longitude: lon }),
        address: this.buildAddress(tags),
        openingHours: tags.opening_hours,
        outdoor_seating: tags.outdoor_seating === 'yes',
        website: tags.website,
        phone: tags.phone
      });
    } catch {
      return null;
    }
  }

  private mapAmenityToVenueType(amenity?: string): VenueType | null {
    switch (amenity) {
      case 'bar': return VenueType.BAR;
      case 'restaurant': return VenueType.RESTAURANT;
      case 'cafe': return VenueType.CAFE;
      case 'pub': return VenueType.PUB;
      case 'biergarten': return VenueType.BIERGARTEN;
      default: return null;
    }
  }

  private buildAddress(tags: Record<string, string>): string | undefined {
    const parts = [
      tags['addr:street'],
      tags['addr:housenumber'],
      tags['addr:city']
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : undefined;
  }
}
