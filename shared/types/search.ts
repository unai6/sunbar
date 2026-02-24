export type SearchResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  bounds: {
    south: number
    north: number
    west: number
    east: number
  }
  type: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    postcode?: string
    country?: string
    amenity?: string
    tourism?: string
    leisure?: string
  }
}
