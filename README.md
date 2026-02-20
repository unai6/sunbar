# SunBar 🌞🍺

Find sunny bars and restaurants near you! SunBar uses GIS shadow analysis to determine which terraces are currently bathed in sunlight.

## Features

- 🗺️ **Interactive Map**: Browse bars, restaurants, cafés, and pubs on an ArcGIS-powered map
- ☀️ **Sun Analysis**: Real-time calculation of sun position using SunCalc
- 🏢 **Shadow Detection**: Estimates which venues might be shaded by nearby buildings
- 📅 **Time Travel**: Check sun conditions for any date/time
- 🎯 **Geolocation**: Find venues near your current location
- 🪑 **Outdoor Seating Filter**: Focus on venues with outdoor seating
- 🌍 **Internationalization**: Available in Spanish (default) and English

## Architecture

This project follows **Domain-Driven Design (DDD)** principles with a **Hexagonal Architecture** (Ports & Adapters) for the backend-for-frontend layer.

```
sunbar/
├── domain/                    # Core business logic (no dependencies)
│   ├── entities/              # Business entities (Venue, Building)
│   ├── value-objects/         # Immutable value objects (Coordinates, SunPosition)
│   ├── types/                 # Shared type definitions (BoundingBox)
│   └── services/              # Domain service interfaces
├── application/               # Use cases / Application services
│   └── use-cases/             # Business operations
├── infrastructure/            # External adapters
│   └── adapters/              # Implementations (SunCalc, ShadowAnalyzer)
├── server/                    # Nuxt server API (BFF layer)
│   └── api/                   # API endpoints
├── composables/               # Vue composables (UI integration)
├── components/                # Vue/PrimeVue components (Tailwind CSS)
├── pages/                     # Nuxt pages
├── layouts/                   # Nuxt layouts
├── i18n/                      # Internationalization
│   ├── es.json                # Spanish translations
│   └── en.json                # English translations
└── tests/                     # Vitest tests
```

### Hexagonal Architecture

- **Domain Layer**: Pure business logic with no external dependencies
- **Application Layer**: Orchestrates use cases, depends only on domain interfaces
- **Infrastructure Layer**: Adapters implementing domain ports (repositories, services)

### Key Technologies

- **Nuxt 3**: Vue.js framework with SSR support
- **TypeScript**: Full type safety
- **PrimeVue**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **ArcGIS JS SDK**: Interactive 2D maps
- **SunCalc**: Sun position calculations
- **Overpass API**: OpenStreetMap data queries (with BFF pattern)
- **@nuxtjs/i18n**: Internationalization (Spanish/English)
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

### Domain Entities

```typescript
// Venue entity
interface Venue {
  id: string;
  name: string;
  type: VenueType;
  coordinates: Coordinates;
  sunlightStatus?: SunlightStatus;
  outdoor_seating?: boolean;
}

// Sunlight status
enum SunlightStatusType {
  SUNNY = "SUNNY",
  PARTIALLY_SUNNY = "PARTIALLY_SUNNY",
  SHADED = "SHADED",
  NIGHT = "NIGHT",
}
```

### Use Cases

```typescript
// Get sunny venues
const result = await getSunnyVenuesUseCase.execute({
  bbox: { south: 40.4, west: -3.8, north: 40.5, east: -3.6 },
  datetime: new Date(),
  onlySunny: true,
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
