# SunBar 🌞🍺

Find sunny bars and restaurants near you! SunBar uses GIS shadow analysis to determine which terraces are currently bathed in sunlight.

## Features

- 🗺️ **Interactive Map**: Browse bars, restaurants, cafés, and pubs on an ArcGIS-powered map
- ☀️ **Sun Analysis**: Real-time calculation of sun position using SunCalc
- 🏢 **Shadow Detection**: Estimates which venues might be shaded by nearby buildings
- 📅 **Time Travel**: Check sun conditions for any date/time
- 🎯 **Geolocation**: Find venues near your current location
- 🪑 **Outdoor Seating Filter**: Focus on venues with outdoor seating
- 🌍 **Internationalization**: Available in Spanish, English, and Catalan

## Architecture

This project follows a **composables-first approach** using Vue 3 Composition API, emphasizing simplicity and maintainability.

```
sunbar/
├── composables/               # Vue composables (business logic)
│   ├── useVenues.ts           # Venue fetching and management
│   ├── useVenue.ts            # Venue utilities
│   ├── useCoordinates.ts      # Geographic coordinate utilities
│   ├── useSunCalculator.ts    # Sun position calculations
│   ├── useSunPosition.ts      # Sun position data
│   ├── useSunlightStatus.ts   # Sunlight status logic
│   ├── useGeolocation.ts      # Browser geolocation
│   └── useMapExplorer.ts      # Map interaction logic
├── stores/                    # Pinia stores (state management)
│   ├── venues.ts              # Venue state and filters
│   ├── sunInfo.ts             # Sun calculation state
│   └── mapExplorer.ts         # Map state
├── shared/                    # Shared types and enums
│   ├── types/                 # TypeScript type definitions
│   └── enums/                 # Enumerations
├── server/                    # Nuxt server API (BFF layer)
│   ├── api/                   # API endpoints
│   └── utils/                 # Server utilities (shadow, sun)
├── components/                # Vue/PrimeVue components (Tailwind CSS)
├── pages/                     # Nuxt pages
├── layouts/                   # Nuxt layouts
├── i18n/                      # Internationalization
│   ├── es.json                # Spanish translations
│   ├── en.json                # English translations
│   └── ca.json                # Catalan translations
└── tests/                     # Vitest tests
```

### Design Principles

- **Composables-First**: All business logic lives in reusable Vue composables
- **Pure State**: Pinia stores contain only state (refs and computed), no actions
- **Semantic Naming**: Descriptive variable names throughout (no single letters or symbols)
- **Type Safety**: Full TypeScript coverage with shared type definitions
- **Separation of Concerns**: Clear boundaries between UI, logic, and data fetching

### Key Technologies

- **Nuxt 3**: Vue.js framework with SSR support
- **TypeScript**: Full type safety
- **PrimeVue**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **ArcGIS JS SDK**: Interactive 2D maps
- **SunCalc**: Sun position calculations
- **Overpass API**: OpenStreetMap data queries (with BFF pattern)
- **@nuxtjs/i18n**: Internationalization (Spanish/English/Catalan)
- **Pinia**: State management
- **Vitest**: Unit testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Usage

1. **Allow Location Access**: When prompted, allow the app to access your location
2. **Search Area**: Click "Search This Area" to find venues in the current map view
3. **Adjust Time**: Use the date/time picker to check sun conditions at different times
4. **Filter Results**: Use filters to show only sunny venues or those with outdoor seating
5. **Explore Venues**: Click on markers or list items to see venue details

## How Sun Analysis Works

1. **Sun Position**: Using SunCalc library, we calculate the exact sun position (azimuth and altitude) for the given location and time
2. **Building Data**: We fetch nearby buildings from OpenStreetMap with height information
3. **Shadow Calculation**: Based on sun altitude and building heights, we estimate shadow lengths and directions
4. **Sunlight Status**: Each venue receives a status: Sunny, Partially Sunny, Shaded, or Night

### Limitations

- Building height data is not always available in OSM; we use estimates when missing
- Shadow analysis is simplified and doesn't account for complex building shapes
- Real-world factors like trees, awnings, and umbrellas are not considered

## API Reference

### Core Types

```typescript
// Venue type (union type for simple string literals)
type VenueType = "bar" | "restaurant" | "cafe" | "pub" | "biergarten";

// Venue interface
interface Venue {
  id: string;
  name: string;
  type: VenueType;
  coordinates: Coordinates;
  sunlightStatus?: SunlightStatusInfo;
  outdoor_seating?: boolean;
}

// Coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Sunlight status enum
enum SunlightStatus {
  SUNNY = "SUNNY",
  PARTIALLY_SUNNY = "PARTIALLY_SUNNY",
  SHADED = "SHADED",
  NIGHT = "NIGHT",
  UNKNOWN = "UNKNOWN",
}

// Sunlight status information
interface SunlightStatusInfo {
  status: SunlightStatus;
  confidence: number;
  reason?: string;
}
```

### Composables Usage

```typescript
// Fetch venues for a bounding box
const { fetchVenues } = useVenues();
const error = await fetchVenues({
  south: 40.4,
  west: -3.8,
  north: 40.5,
  east: -3.6,
});

// Calculate sun position
const { calculateSunPosition } = useSunCalculator();
const sunPosition = calculateSunPosition(
  { latitude: 40.4168, longitude: -3.7038 },
  new Date(),
);

// Work with coordinates
const { create, calculateDistance } = useCoordinates();
const madrid = create(40.4168, -3.7038);
const barcelona = create(41.3851, 2.1734);
const distanceMeters = calculateDistance(madrid, barcelona);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
