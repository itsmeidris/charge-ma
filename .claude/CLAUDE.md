# charge.ma — Claude Code Rules

## Project Identity
You are building **charge.ma**, a client-side React prototype for finding EV charging stations along a route in Morocco. No backend. No auth. No deployment required.

## Tech Stack (non-negotiable)
- **Framework**: React 18 + Vite
- **Map**: Leaflet.js (`react-leaflet`)
- **Tiles**: OpenStreetMap (free, no API key)
- **Routing**: OSRM demo API — `https://router.project-osrm.org/route/v1/driving/{lng},{lat};{lng},{lat}?overview=full&geometries=polyline`
- **Charging data**: Static JSON file (`src/data/stations.json`) — sourced from OpenChargeMap API or manually curated
- **Persistence**: `localStorage` only
- **Styling**: CSS Modules or Tailwind, no UI libraries
- **Language**: JavaScript (no TypeScript needed for prototype speed)

## Project Structure
```
charge-ma/
├── public/
├── .claude/
├──├── skills-frontend/          #UI/UX Design Rules
├────├── UI-UX-RULES.md         
├── src/
│   ├── components/
│   │   ├── Map.jsx              # Main Leaflet map
│   │   ├── StationMarker.jsx    # Individual marker logic
│   │   ├── RoutePanel.jsx       # Start/destination input UI
│   │   └── StationCard.jsx      # Popup/sidebar card per station
│   ├── data/
│   │   └── stations.json        # EV station dataset for Morocco
│   ├── hooks/
│   │   ├── useRoute.js          # Fetch + decode OSRM route
│   │   └── useStations.js       # Filter stations by corridor
│   ├── utils/
│   │   ├── haversine.js         # Haversine distance formula
│   │   ├── corridorFilter.js    # Point-to-segment distance filter
│   │   └── polyline.js          # Decode encoded polyline from OSRM
│   ├── App.jsx
│   └── main.jsx
├── CLAUDE.md
├── README.md
└── package.json
```

## Critical Implementation Rules

### 1. Corridor Filtering (MOST IMPORTANT — primary grading criterion)
- OSRM returns an **encoded polyline** in `routes[0].geometry` — decode it first
- Use the **point-to-segment Haversine distance** (not point-to-point) for each station vs every segment of the route polyline
- A station is "on corridor" if its minimum distance to ANY segment is ≤ 5 km
- Stations on corridor: **highlighted, fully visible**
- Stations off corridor: **grayed out (opacity: 0.25) or hidden** — togglable via UI

### 2. OSRM Integration
```
GET https://router.project-osrm.org/route/v1/driving/{startLng},{startLat};{endLng},{endLat}?overview=full&geometries=polyline
```
- Decode the polyline using the `@mapbox/polyline` package or a manual decoder
- Draw the route as a `L.polyline` on the map in a distinct color (e.g. electric blue `#00BFFF`)

### 3. Station Data (`src/data/stations.json`)
Each station object must have:
```json
{
  "id": "unique-string",
  "name": "Station Name",
  "operator": "IRESEN | Shell Recharge | TotalEnergies | etc.",
  "lat": 33.589,
  "lng": -7.603,
  "power_kw": 50,
  "connector_type": "CCS2 | CHAdeMO | Type2 | etc.",
  "status": "operational | broken",
  "address": "Optional human-readable address"
}
```
Seed with **at least 20–25 real or realistic stations** across Morocco, covering the Casablanca–Marrakech and Rabat–Tanger corridors.

### 4. Map Markers
- **Operational station**: Green marker icon (`🟢` or custom green SVG)
- **Broken station**: Red/orange marker, reduced opacity (`🔴`)
- **User-reported broken** (via localStorage): Orange marker with warning icon
- On click/tap → show popup with: name, operator, power, connector, status, report button

### 5. Breakdown Reporting (Optional but implement it)
- "Report as broken" button in station popup
- Store in localStorage as: `{ stationId: { count: N, timestamps: [...], working: M } }`
- Show report count on popup
- "It's working" button to counter a report
- Marker color updates immediately on report

### 6. Driver UX (Optional but implement it)
- Large touch-friendly buttons (min 48px height)
- High contrast: dark background (`#0a0a0a`), white text, electric accent (`#00BFFF`)
- For each corridor station show:
  - Distance along route from start (in km, 1 decimal)
  - Estimated time from start (assume avg 90 km/h on highway)
  - Sort stations by their order of appearance along the route (nearest first)

### 7. City Presets (for route input dropdown)
```js
const CITIES = [
  { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Marrakech",  lat: 31.6295, lng: -7.9811 },
  { name: "Rabat",      lat: 34.0209, lng: -6.8416 },
  { name: "Tanger",     lat: 35.7595, lng: -5.8330 },
  { name: "Fès",        lat: 34.0333, lng: -5.0000 },
  { name: "Agadir",     lat: 30.4278, lng: -9.5981 },
  { name: "Meknès",     lat: 33.8935, lng: -5.5473 },
  { name: "Oujda",      lat: 34.6814, lng: -1.9086 },
];
```

## Code Quality Rules
- Keep each component under 150 lines — split if larger
- Utility functions must be pure and well-named
- No `console.log` in final code (use during dev, clean up)
- Handle loading and error states for OSRM fetch (show spinner, show error message)
- Mobile-first CSS — the app is used on a phone in a car

## What NOT to build
- No backend, no Express, no Node server
- No user accounts or auth
- No unit tests
- No TypeScript (saves time)
- No complex state management (useState/useEffect/useContext is enough)

## Test Routes to Validate
1. **Casablanca → Marrakech** (~240 km, A7 motorway)
2. **Rabat → Tanger** (~340 km, A1/A4 motorway)

Both must show a sensible number of corridor stations after filtering.

## README Requirements
The README must include:
1. One-line project description
2. `npm install && npm run dev` to run
3. Brief explanation of corridor filtering logic
4. Data sourcing note (where stations came from)
5. Known limitations

## Haversine + Corridor Filter Reference
```js
// haversine.js — distance between two lat/lng points in km
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// corridorFilter.js — min distance from point to a polyline (array of [lat,lng])
export function distanceToPolylineKm(stationLat, stationLng, polyline) {
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(
      stationLat, stationLng,
      polyline[i][0],   polyline[i][1],
      polyline[i+1][0], polyline[i+1][1]
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}
```

## Priority Order (spend time here first)
1. Station data JSON (seed it well)
2. Map rendering with markers
3. OSRM route fetch + polyline decode + draw on map
4. Corridor filter (5 km threshold) — this is THE feature
5. Station popup with details
6. Breakdown reporting (localStorage)
7. Driver UX polish (big buttons, distances, sorting)