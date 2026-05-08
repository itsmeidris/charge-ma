# charge.ma — UI/UX Design Skill
# Location: .claude/skills-frontend/UI-UX-RULES.md
#
# ⚠️  CRITICAL — STYLING ONLY:
# Do NOT touch any logic in:
#   - useRoute.js, useStations.js, corridorFilter.js, haversine.js, polyline.js
#   - Any OSRM fetch/decode logic
#   - Any corridor filtering logic
#   - Any localStorage reporting logic
#   - stations.json
#   - All onChange, onSubmit, onClick handlers connected to routing or filtering
#   - All map event handlers (marker clicks, map clicks)
# Only modify: CSS files, component JSX structure/markup, App.jsx layout, index.html

---

## 🔤 Typography

Add this to index.html <head> — do NOT use @import in CSS:
```html
<link href="https://api.fontshare.com/v2/css?f[]=ranade@300&f[]=excon@500&display=swap" rel="stylesheet">
```

CSS variables:
```css
--font-display: 'Excon', sans-serif;   /* Logo + intro screen only */
--font-body:    'Ranade', sans-serif;  /* ALL other text: inputs, labels, popups, buttons */
```

Rules:
- "CHARGE.MA" logo → always Excon, weight 500, uppercase, letter-spacing: 0.08em
- Intro screen title + countdown → Excon, weight 500
- Every other text element → Ranade, weight 300
- Never use system fonts or fallbacks as primary

---

## 🎨 Color Palette — Tesla-minimal Black & White

Inspired by tesla.com/findus: clean, high contrast, no color noise.

```css
:root {
  --font-display:     'Excon', sans-serif;
  --font-body:        'Ranade', sans-serif;
  --color-bg:         #ffffff;
  --color-surface:    #f5f5f5;
  --color-border:     #e0e0e0;
  --color-text:       #0a0a0a;
  --color-text-muted: #6b6b6b;
  --color-accent:     #0a0a0a;
  --color-accent-inv: #ffffff;
  --color-danger:     #FF4E4C;   /* Broken station markers */
  --color-success:    #00C159;   /* Operational station markers */
}
```

Rules:
- No blues, purples, teals, or colorful gradients anywhere in the UI chrome
- Map tile colors are exempt (OSM tiles are what they are)
- Route polyline on map: #0a0a0a (black) or very dark charcoal
- Station markers: use the exact SVG icons defined below — no dots, no circles

---

## 🪟 Glass Effect — Paste Verbatim, Do Not Simplify

Apply class `glass3d` to: navbar, any floating UI card, station popups.
Do NOT apply to the route input panel (that uses solid white).

```css
.glass3d {
  --filter-glass3d: blur(28px) brightness(0.94) saturate(1.9);
  --color-glass3d: hsl(189 80% 10% / 0.15);
  --noise-glass3d: url("https://www.transparenttextures.com/patterns/egg-shell.png");
  position: relative;
  z-index: 4;
  box-shadow:
    0 0 0.75px hsl(205 20% 10% / 0.2),
    0.7px 0.8px 1.2px -0.4px hsl(205 20% 10% / 0.1),
    1.3px 1.5px 2.2px -0.8px hsl(205 20% 10% / 0.1),
    2.3px 2.6px 3.9px -1.2px hsl(205 20% 10% / 0.1),
    3.9px 4.4px 6.6px -1.7px hsl(205 20% 10% / 0.1),
    6.5px 7.2px 10.9px -2.1px hsl(205 20% 10% / 0.1),
    8px 9px 14px -2.5px hsl(205 20% 10% / 0.2);
}
.glass3d::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
  z-index: 3;
  -webkit-backdrop-filter: var(--filter-glass3d);
  backdrop-filter: var(--filter-glass3d);
  background-color: var(--color-glass3d);
  background-image: var(--noise-glass3d);
  background-size: 100px;
  background-repeat: repeat;
}
.glass3d::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
  z-index: 5;
  box-shadow:
    inset 2px 2px 1px -3px hsl(205 20% 90% / 0.8),
    inset 4px 4px 2px -6px hsl(205 20% 90% / 0.3),
    inset 1.5px 1.5px 1.5px -0.75px hsl(205 20% 90% / 0.15),
    inset 1.5px 1.5px 0.25px hsl(205 20% 90% / 0.03),
    inset 0 0 0.25px 0.5px hsl(205 20% 90% / 0.03);
}
.glass3d > * {
  position: relative;
  z-index: 6;
}
```

---

## 🧭 Navbar

Fixed top, full width, glass3d applied. Logo absolutely centered.

```jsx
<nav className="navbar glass3d">
  <span className="logo">CHARGE.MA</span>
</nav>
```

```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-radius: 0;
  z-index: 1000;
}
.logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.25rem;
  color: var(--color-text);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
```

---

## 🗺️ Route Input Panel (Left Sidebar)

Fixed left side, below navbar. Solid white — NOT glass. Does not stretch full width.

```jsx
<aside className="route-panel">
  <div className="input-group">
    <label>Departure</label>
    <select>{/* DO NOT change onChange/value logic */}</select>
  </div>
  <div className="input-group">
    <label>Arrival</label>
    <select>{/* DO NOT change onChange/value logic */}</select>
  </div>
  <button className="go-btn">{/* DO NOT change onClick */}</button>
</aside>
```

```css
.route-panel {
  position: fixed;
  top: 72px;
  left: 16px;
  width: 280px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.input-group label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 300;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 4px;
}
.input-group select {
  width: 100%;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.input-group select:focus { border-color: var(--color-text); }
.go-btn {
  width: 100%;
  padding: 12px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--color-accent);
  color: var(--color-accent-inv);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.go-btn:hover { opacity: 0.8; }
```

---

## 🗺️ Map Controls

### Zoom — Bottom Right
Disable default Leaflet zoom, add it back at bottom right:
```jsx
// MapContainer:
<MapContainer zoomControl={false} ...>
  <ZoomControl position="bottomright" />
```

```css
.leaflet-bottom.leaflet-right {
  margin-bottom: 24px;
  margin-right: 24px;
}
.leaflet-control-zoom {
  border: none !important;
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
}
.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
  font-family: var(--font-body) !important;
  font-size: 1.1rem !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
  background: #ffffff !important;
  color: #0a0a0a !important;
  border: none !important;
}
.leaflet-control-zoom-in:hover,
.leaflet-control-zoom-out:hover { background: #f0f0f0 !important; }
```

### Layer Switcher
Add 4 base tile layers via LayersControl. Standard is the default checked layer.

```jsx
import { LayersControl, TileLayer, ZoomControl } from 'react-leaflet';

const TILE_LAYERS = {
  Standard:  { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",                                                             attribution: "© OpenStreetMap contributors" },
  Satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",                  attribution: "© Esri" },
  Dark:      { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                                  attribution: "© CartoDB" },
  Topo:      { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                                                               attribution: "© OpenTopoMap" },
};

// Inside MapContainer:
<LayersControl position="bottomright">
  <LayersControl.BaseLayer checked name="Standard">
    <TileLayer url={TILE_LAYERS.Standard.url} attribution={TILE_LAYERS.Standard.attribution} />
  </LayersControl.BaseLayer>
  <LayersControl.BaseLayer name="Satellite">
    <TileLayer url={TILE_LAYERS.Satellite.url} attribution={TILE_LAYERS.Satellite.attribution} />
  </LayersControl.BaseLayer>
  <LayersControl.BaseLayer name="Dark">
    <TileLayer url={TILE_LAYERS.Dark.url} attribution={TILE_LAYERS.Dark.attribution} />
  </LayersControl.BaseLayer>
  <LayersControl.BaseLayer name="Topo">
    <TileLayer url={TILE_LAYERS.Topo.url} attribution={TILE_LAYERS.Topo.attribution} />
  </LayersControl.BaseLayer>
</LayersControl>
```

```css
.leaflet-control-layers {
  border: none !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
  font-family: var(--font-body) !important;
  font-size: 0.85rem !important;
  margin-bottom: 8px !important;
  margin-right: 24px !important;
}
```

---

## 📍 Initial Map Center — Geolocation → Casablanca Fallback

Replace hardcoded map center with this logic in App.jsx:

```jsx
const CASABLANCA = { lat: 33.5731, lng: -7.5898, zoom: 12 };

const [mapCenter, setMapCenter] = useState([CASABLANCA.lat, CASABLANCA.lng]);
const [mapZoom, setMapZoom]     = useState(CASABLANCA.zoom);

useEffect(() => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      setMapZoom(13);
    },
    () => {
      setMapCenter([CASABLANCA.lat, CASABLANCA.lng]);
      setMapZoom(CASABLANCA.zoom);
    },
    { timeout: 5000 }
  );
}, []);
```

Prefer using a `useMap()` hook inside MapContainer to call `map.setView()` imperatively —
avoids re-mounting. Use `key={mapCenter.join(',')}` on MapContainer only as a last resort.

---

## 📌 Custom SVG Markers (isoicons)

Use `L.divIcon` with inlined SVG. className must be empty string to remove Leaflet's white box.

```js
import L from 'leaflet';

const OPERATIONAL_SVG = `<svg viewBox="0 0 91 112" fill="#00C159" xmlns="http://www.w3.org/2000/svg" height="48" width="48" stroke-width="2px" stroke-linecap="round" stroke-linejoin="round"><path d="M63.45 51.1825C62.03 47.7225 60.29 44.3125 58.23 40.9425C58.18 40.8625 58.1301 40.7825 58.0801 40.7125C51.4601 29.9525 43.8001 22.0525 35.1101 17.0325C31.3101 14.8325 27.7 13.4225 24.3 12.7825C19.86 11.9425 15.75 12.4325 11.98 14.2425C5.32998 17.4525 2 24.9825 2 36.8525C2 40.4125 2.60006 44.5025 3.81006 49.1225C5.02006 53.7325 6.78009 58.8225 9.09009 64.3925C11.4001 69.9625 14.28 75.9925 17.72 82.5025C21.17 89.0025 25.1401 95.9225 29.6201 103.252C30.3801 104.482 31.24 105.582 32.21 106.532C33.17 107.482 34.1401 108.242 35.1101 108.792C36.0701 109.352 37.04 109.712 38 109.872C38.97 110.042 39.8301 109.942 40.5901 109.592C41.3301 109.232 42.06 108.872 42.77 108.492L43.3801 108.182C46.7401 106.432 49.77 104.552 52.49 102.572C53.88 101.552 55.1801 100.502 56.3901 99.4125C58.1701 97.8225 59.7401 96.1625 61.1201 94.4325C63.4301 91.5325 65.1899 88.4725 66.3999 85.2525C67.6099 82.0325 68.21 78.6425 68.21 75.0825C68.21 66.8825 66.62 58.9125 63.45 51.1825ZM49.5901 55.7225C49.5901 57.0325 49.1701 57.9225 48.3501 58.3925L34.53 66.2625L33.6599 66.7625C32.8299 67.2425 31.86 67.1525 30.76 66.5225C29.66 65.8825 28.6901 64.8525 27.8601 63.4225L22.0701 53.3125C21.2401 51.8825 20.8301 50.5125 20.8301 49.2125C20.8301 47.9125 21.2401 47.0125 22.0701 46.5425C22.9001 46.0725 23.86 46.1525 24.97 46.7925C25.58 47.1525 26.1599 47.6325 26.6799 48.2325C27.1099 48.7025 27.5001 49.2625 27.8601 49.8925L30.76 54.8825L42.45 48.2225C43.03 47.8925 43.6699 47.8425 44.3999 48.0625C44.5599 48.1025 44.7299 48.1725 44.8999 48.2425C45.0699 48.3225 45.2299 48.4025 45.3999 48.5025C46.5399 49.1525 47.5201 50.1925 48.3501 51.6225C49.1501 53.0225 49.5701 54.3625 49.5901 55.6425V55.7225Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M49.5901 55.6424V55.7224C49.5901 57.0324 49.1701 57.9224 48.3501 58.3924L34.53 66.2624L33.6599 66.7624C32.8299 67.2424 31.86 67.1524 30.76 66.5224C29.66 65.8824 28.6901 64.8524 27.8601 63.4224L22.0701 53.3124C21.2401 51.8824 20.8301 50.5124 20.8301 49.2124C20.8301 47.9124 21.2401 47.0124 22.0701 46.5424C22.9001 46.0724 23.86 46.1524 24.97 46.7924C25.58 47.1524 26.1599 47.6324 26.6799 48.2324C27.1099 48.7024 27.5001 49.2624 27.8601 49.8924L30.76 54.8824L44.3999 48.0624C44.5599 48.1024 44.7299 48.1724 44.8999 48.2424C45.0699 48.3224 45.2299 48.4024 45.3999 48.5024C46.5399 49.1524 47.5201 50.1924 48.3501 51.6224C49.1501 53.0224 49.5701 54.3624 49.5901 55.6424Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M60.1904 99.7523C60.3304 99.7023 60.4606 99.6523 60.5906 99.5923C61.9206 98.9523 63.2004 98.2923 64.4404 97.6123L60.1904 99.7523Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M44.4006 48.0625L30.7607 54.8825L42.4507 48.2225C43.0307 47.8925 43.6706 47.8425 44.4006 48.0625Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M88.2104 65.0824C88.2104 68.6424 87.6104 72.0324 86.4004 75.2524C85.1904 78.4724 83.4306 81.5324 81.1206 84.4324C78.8106 87.3424 75.9305 90.0524 72.4905 92.5724C70.0605 94.3424 67.3804 96.0324 64.4404 97.6124L60.1904 99.7524H60.1604L43.3806 108.182C46.7406 106.432 49.7705 104.552 52.4905 102.572C53.8805 101.552 55.1806 100.502 56.3906 99.4124C58.1706 97.8224 59.7406 96.1624 61.1206 94.4324C63.4306 91.5324 65.1904 88.4724 66.4004 85.2524C67.6104 82.0324 68.2104 78.6424 68.2104 75.0824C68.2104 66.8824 66.6204 58.9124 63.4504 51.1824C62.0304 47.7224 60.2905 44.3124 58.2305 40.9424C58.1805 40.8624 58.1306 40.7824 58.0806 40.7124C51.4606 29.9524 43.8006 22.0524 35.1106 17.0324C31.3106 14.8324 27.7005 13.4224 24.3005 12.7824C19.8605 11.9424 15.7505 12.4324 11.9805 14.2424L31.3706 4.55237L31.9805 4.24237C38.6405 1.04237 46.3506 1.97238 55.1106 7.03238C63.8606 12.0924 71.5705 20.0624 78.2305 30.9424C84.8805 41.8324 88.2104 53.2124 88.2104 65.0824Z" stroke="#0B0B0F" stroke-linejoin="round"/></svg>`;

const BROKEN_SVG = `<svg viewBox="0 0 91 112" fill="#FF4E4C" xmlns="http://www.w3.org/2000/svg" height="48" width="48" stroke-width="2px" stroke-linecap="round" stroke-linejoin="round"><path d="M63.45 51.1825C62.03 47.7225 60.29 44.3125 58.23 40.9425C58.18 40.8625 58.1301 40.7825 58.0801 40.7125C51.4601 29.9525 43.8001 22.0525 35.1101 17.0325C31.3101 14.8325 27.7 13.4225 24.3 12.7825C19.86 11.9425 15.75 12.4325 11.98 14.2425C5.32998 17.4525 2 24.9825 2 36.8525C2 40.4125 2.60006 44.5025 3.81006 49.1225C5.02006 53.7325 6.78009 58.8225 9.09009 64.3925C11.4001 69.9625 14.28 75.9925 17.72 82.5025C21.17 89.0025 25.1401 95.9225 29.6201 103.252C30.3801 104.482 31.24 105.582 32.21 106.532C33.17 107.482 34.1401 108.242 35.1101 108.792C36.0701 109.352 37.04 109.712 38 109.872C38.97 110.042 39.8301 109.942 40.5901 109.592C41.3301 109.232 42.06 108.872 42.77 108.492L43.3801 108.182C46.7401 106.432 49.77 104.552 52.49 102.572C53.88 101.552 55.1801 100.502 56.3901 99.4125C58.1701 97.8225 59.7401 96.1625 61.1201 94.4325C63.4301 91.5325 65.1899 88.4725 66.3999 85.2525C67.6099 82.0325 68.21 78.6425 68.21 75.0825C68.21 66.8825 66.62 58.9125 63.45 51.1825ZM49.5901 55.7225C49.5901 57.0325 49.1701 57.9225 48.3501 58.3925L34.53 66.2625L33.6599 66.7625C32.8299 67.2425 31.86 67.1525 30.76 66.5225C29.66 65.8825 28.6901 64.8525 27.8601 63.4225L22.0701 53.3125C21.2401 51.8825 20.8301 50.5125 20.8301 49.2125C20.8301 47.9125 21.2401 47.0125 22.0701 46.5425C22.9001 46.0725 23.86 46.1525 24.97 46.7925C25.58 47.1525 26.1599 47.6325 26.6799 48.2325C27.1099 48.7025 27.5001 49.2625 27.8601 49.8925L30.76 54.8825L42.45 48.2225C43.03 47.8925 43.6699 47.8425 44.3999 48.0625C44.5599 48.1025 44.7299 48.1725 44.8999 48.2425C45.0699 48.3225 45.2299 48.4025 45.3999 48.5025C46.5399 49.1525 47.5201 50.1925 48.3501 51.6225C49.1501 53.0225 49.5701 54.3625 49.5901 55.6425V55.7225Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M49.5901 55.6424V55.7224C49.5901 57.0324 49.1701 57.9224 48.3501 58.3924L34.53 66.2624L33.6599 66.7624C32.8299 67.2424 31.86 67.1524 30.76 66.5224C29.66 65.8824 28.6901 64.8524 27.8601 63.4224L22.0701 53.3124C21.2401 51.8824 20.8301 50.5124 20.8301 49.2124C20.8301 47.9124 21.2401 47.0124 22.0701 46.5424C22.9001 46.0724 23.86 46.1524 24.97 46.7924C25.58 47.1524 26.1599 47.6324 26.6799 48.2324C27.1099 48.7024 27.5001 49.2624 27.8601 49.8924L30.76 54.8824L44.3999 48.0624C44.5599 48.1024 44.7299 48.1724 44.8999 48.2424C45.0699 48.3224 45.2299 48.4024 45.3999 48.5024C46.5399 49.1524 47.5201 50.1924 48.3501 51.6224C49.1501 53.0224 49.5701 54.3624 49.5901 55.6424Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M60.1904 99.7523C60.3304 99.7023 60.4606 99.6523 60.5906 99.5923C61.9206 98.9523 63.2004 98.2923 64.4404 97.6123L60.1904 99.7523Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M44.4006 48.0625L30.7607 54.8825L42.4507 48.2225C43.0307 47.8925 43.6706 47.8425 44.4006 48.0625Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M88.2104 65.0824C88.2104 68.6424 87.6104 72.0324 86.4004 75.2524C85.1904 78.4724 83.4306 81.5324 81.1206 84.4324C78.8106 87.3424 75.9305 90.0524 72.4905 92.5724C70.0605 94.3424 67.3804 96.0324 64.4404 97.6124L60.1904 99.7524H60.1604L43.3806 108.182C46.7406 106.432 49.7705 104.552 52.4905 102.572C53.8805 101.552 55.1806 100.502 56.3906 99.4124C58.1706 97.8224 59.7406 96.1624 61.1206 94.4324C63.4306 91.5324 65.1904 88.4724 66.4004 85.2524C67.6104 82.0324 68.2104 78.6424 68.2104 75.0824C68.2104 66.8824 66.6204 58.9124 63.4504 51.1824C62.0304 47.7224 60.2905 44.3124 58.2305 40.9424C58.1805 40.8624 58.1306 40.7824 58.0806 40.7124C51.4606 29.9524 43.8006 22.0524 35.1106 17.0324C31.3106 14.8324 27.7005 13.4224 24.3005 12.7824C19.8605 11.9424 15.7505 12.4324 11.9805 14.2424L31.3706 4.55237L31.9805 4.24237C38.6405 1.04237 46.3506 1.97238 55.1106 7.03238C63.8606 12.0924 71.5705 20.0624 78.2305 30.9424C84.8805 41.8324 88.2104 53.2124 88.2104 65.0824Z" stroke="#0B0B0F" stroke-linejoin="round"/></svg>`;

export const operationalIcon = L.divIcon({
  html: OPERATIONAL_SVG,
  className: '',        // Empty — removes Leaflet's default white box
  iconSize:   [48, 48],
  iconAnchor: [24, 48], // Pin tip at bottom-center
  popupAnchor:[0, -48],
});

export const brokenIcon = L.divIcon({
  html: BROKEN_SVG,
  className: '',
  iconSize:   [48, 48],
  iconAnchor: [24, 48],
  popupAnchor:[0, -48],
});
```

In StationMarker.jsx — only change the icon prop, keep ALL other props/handlers:
```jsx
const icon = (station.status === 'operational' && !isReportedBroken)
  ? operationalIcon
  : brokenIcon;
```

```css
/* Remove Leaflet's default div-icon styling */
.leaflet-div-icon {
  background: none !important;
  border: none !important;
}
```

---

## ✨ Intro / Loading Screen

Install GSAP first:
```bash
npm install gsap
```

Create `src/components/IntroScreen.jsx`:

Behavior:
1. Full viewport overlay, z-index 9999, black background (#0a0a0a)
2. "CHARGE.MA" in Excon centered, large: clamp(4rem, 10vw, 9rem)
3. Below it: percentage counter 0% → 100% in Excon, slightly smaller
4. Counter animates 0→100 over ~2.2s with easeOut curve (fast start, slow end)
5. At 100%, GSAP exit sequence:
   - Title: scale 1→1.15 + opacity 1→0 (0.5s)
   - Percentage: fade out slightly earlier (0.3s)
   - Overlay: opacity or clip-path out after text exits (0.4s)
   - Then call onComplete()
6. Map is already mounted underneath but hidden (opacity: 0), fades in on onComplete

```jsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function IntroScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const overlayRef  = useRef();
  const titleRef    = useRef();
  const percentRef  = useRef();

  useEffect(() => {
    // Animate count 0→100 with easeOut over 2200ms
    const start = performance.now();
    const duration = 2200;
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic easeOut
      setCount(Math.floor(eased * 100));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // GSAP exit sequence
        const tl = gsap.timeline({ onComplete });
        tl.to(percentRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' })
          .to(titleRef.current,   { scale: 1.15, opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.1')
          .to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.1');
      }
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div ref={overlayRef} className="intro-overlay">
      <span ref={titleRef}   className="intro-title">CHARGE.MA</span>
      <span ref={percentRef} className="intro-percent">{count}%</span>
    </div>
  );
}
```

```css
.intro-overlay {
  position: fixed;
  inset: 0;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 0.5rem;
}
.intro-title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(4rem, 10vw, 9rem);
  color: #ffffff;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.intro-percent {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(2rem, 5vw, 4.5rem);
  color: rgba(255,255,255,0.3);
  line-height: 1;
}
```

Wire into App.jsx:
```jsx
const [introComplete, setIntroComplete] = useState(false);

return (
  <>
    {!introComplete && <IntroScreen onComplete={() => setIntroComplete(true)} />}
    <div style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      {/* existing map + navbar + route panel — all untouched */}
    </div>
  </>
);
```

---

## ✅ Implementation Order

Apply in this exact order, verify functionality after each step:

1. Update font `<link>` in index.html (Excon + Ranade)
2. Add CSS variables + glass3d block to index.css / App.css
3. Restyle navbar — glass3d, logo centered, CHARGE.MA uppercase
4. Restyle route panel — left sidebar, 280px, solid white
5. Move zoom control to bottomright, add layer switcher
6. Add geolocation → Casablanca fallback logic
7. Replace marker icons with L.divIcon SVGs
8. Install gsap (If not already installed), create IntroScreen.jsx, wire into App.jsx
9. Final check — run Casablanca→Marrakech route, confirm corridor filter works ✅

---

charge.ma — UI Update #3
⚠️ STYLING ONLY — Do NOT touch: useRoute.js, useStations.js, corridorFilter.js,
haversine.js, polyline.js, stations.json, OSRM logic, corridor filter logic,
any onChange/onClick handlers connected to routing or filtering.

1. USER LOCATION MARKER
When geolocation is granted, render the user's current position using this exact SVG via L.divIcon.
Do NOT use the default Leaflet blue circle. Do NOT change the geolocation logic — only the icon.
jsconst USER_LOCATION_SVG = `<svg viewBox="0 0 91 112" fill="#229EFF" xmlns="http://www.w3.org/2000/svg" height="48" width="48" stroke-width="2px" stroke-linecap="round" stroke-linejoin="round"><path d="M31.6204 57.6956V66.5956L23.3604 61.8256L31.3804 57.8156L31.6204 57.6956Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M88.8 64.7856C88.8 68.3456 88.1902 71.7256 86.9902 74.9456C85.7802 78.1556 84.0302 81.2156 81.7202 84.1056C79.4202 87.0056 76.5401 89.7056 73.1001 92.2256C69.6601 94.7356 65.7002 97.0756 61.2302 99.2256L43.2002 108.236C46.8702 106.376 50.1701 104.356 53.1001 102.226C54.5001 101.196 55.81 100.146 57.02 99.0456C58.79 97.4756 60.3602 95.8256 61.7202 94.1056C64.0302 91.2156 65.7802 88.1556 66.9902 84.9456C68.1902 81.7256 68.8 78.3456 68.8 74.7856C68.8 71.7356 68.5801 68.7256 68.1401 65.7456C66.8701 57.1356 63.7601 48.7856 58.8301 40.7156C55.9301 35.9756 52.83 31.7856 49.53 28.1556C45.27 23.4556 40.68 19.6856 35.75 16.8456C31.97 14.6656 28.3802 13.2556 24.9902 12.6156C20.6202 11.7856 16.5801 12.2456 12.8701 13.9856L32.6802 4.07557C39.3202 0.875572 47.01 1.80557 55.75 6.84557C64.5 11.8956 72.1901 19.8556 78.8301 30.7156C85.4701 41.5856 88.8 52.9456 88.8 64.7856Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M68.1399 65.7455C66.8699 57.1355 63.7598 48.7855 58.8298 40.7155C55.9298 35.9755 52.8298 31.7855 49.5298 28.1555C45.2698 23.4555 40.6798 19.6855 35.7498 16.8455C31.9698 14.6655 28.38 13.2555 24.99 12.6155C20.62 11.7855 16.5799 12.2455 12.8699 13.9855C12.7899 14.0255 12.73 14.0455 12.71 14.0655H12.6799C6.02993 17.2655 2.70996 24.7855 2.70996 36.6355C2.70996 40.1955 3.30978 44.2755 4.51978 48.8755C5.71978 53.4855 7.47979 58.5655 9.78979 64.1155C12.0898 69.6755 14.9699 75.7055 18.4099 82.1955C21.8499 88.6755 25.8098 95.5855 30.2798 102.905C31.0398 104.135 31.8999 105.225 32.8599 106.175C33.8299 107.125 34.7898 107.885 35.7498 108.435C36.7198 108.995 37.6799 109.355 38.6499 109.515C39.6099 109.675 40.47 109.585 41.23 109.225L43.2 108.235C46.87 106.375 50.1699 104.355 53.0999 102.225C54.4999 101.195 55.8098 100.145 57.0198 99.0455C58.7898 97.4755 60.36 95.8255 61.72 94.1055C64.03 91.2155 65.78 88.1555 66.99 84.9455C68.19 81.7255 68.7998 78.3455 68.7998 74.7855C68.7998 71.7355 68.5799 68.7255 68.1399 65.7455ZM48.1399 76.1355L39.8799 71.3655V58.3355L35.45 55.7755L31.6199 53.5655V66.5955L23.3599 61.8255V39.3155L24.5798 39.0855L35.7498 36.9955L43.3599 47.2055L43.6199 47.5655L48.1399 53.6255V76.1355Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M48.1399 67.2356V76.1356L39.8799 71.3656L48.1399 67.2356Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M48.1399 54.2056V67.2356L39.8799 71.3656V58.3356L47.7898 54.3856L48.1399 54.2056Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M48.1401 53.6257V54.2057L47.79 54.3857L39.8801 58.3357L35.4502 55.7757L31.6201 53.5657L43.6201 47.5657L48.1401 53.6257Z" stroke="#0B0B0F" stroke-linejoin="round"/><path d="M43.6194 47.5656L31.6194 53.5656V57.6956L31.3794 57.8156L23.3594 61.8256V39.3156L24.5793 39.0856L35.7493 36.9956L43.3594 47.2056L43.6194 47.5656Z" stroke="#0B0B0F" stroke-linejoin="round"/></svg>`;

export const userLocationIcon = L.divIcon({
  html: USER_LOCATION_SVG,
  className: '',
  iconSize:   [48, 48],
  iconAnchor: [24, 48],
  popupAnchor:[0, -48],
});
Render a single Marker at the user's coordinates using this icon.
Only render it when geolocation is granted and coordinates are available.
Do not add a popup or any click handler to this marker.

2. PERSIST SELECTED MAP LAYER (localStorage)
When the user switches tile layer, save it to localStorage.
On page load, read from localStorage and restore the saved layer as the active basemap.
Key: 'find-ev-charging-map-layer'
Values: 'Standard' | 'Satellite' | 'Dark' | 'Topo'
Default if not set: 'Standard'
Implementation — create a controlled layer state:
jsxconst LAYER_STORAGE_KEY = 'find-ev-charging-map-layer';

// Read saved layer on mount
const [activeLayer, setActiveLayer] = useState(
  () => localStorage.getItem(LAYER_STORAGE_KEY) || 'Standard'
);

// When user switches layer, persist it
const handleLayerChange = (layerName) => {
  setActiveLayer(layerName);
  localStorage.setItem(LAYER_STORAGE_KEY, layerName);
};
Wire handleLayerChange to the LayersControl baselayerchange map event:
jsx// Inside MapContainer, use the MapEvents helper or useMapEvents:
import { useMapEvents } from 'react-leaflet';

function LayerPersistence({ onLayerChange }) {
  useMapEvents({
    baselayerchange: (e) => onLayerChange(e.name),
  });
  return null;
}

// Use inside MapContainer:
<LayerPersistence onLayerChange={handleLayerChange} />
On LayersControl, set checked dynamically based on activeLayer:
jsx<LayersControl.BaseLayer checked={activeLayer === 'Standard'} name="Standard">
<LayersControl.BaseLayer checked={activeLayer === 'Satellite'} name="Satellite">
<LayersControl.BaseLayer checked={activeLayer === 'Dark'} name="Dark">
<LayersControl.BaseLayer checked={activeLayer === 'Topo'} name="Topo">

3. DARK LAYER — LOGO COLOR + ROUTE LINE COLOR
When the active layer is 'Dark', apply these two changes. Revert when switching away.
3a. Logo turns white
Pass activeLayer as a prop or via context to the Navbar component.
Apply a CSS class conditionally:
jsx<nav className={`navbar glass3d ${activeLayer === 'Dark' ? 'navbar--dark' : ''}`}>
  <span className="logo">CHARGE.MA</span>
</nav>
css/* Default logo color */
.logo {
  color: var(--color-text); /* #0a0a0a */
}

/* Dark layer override */
.navbar--dark .logo {
  color: #ffffff;
}
3b. Route polyline turns white
The route line drawn on the map after OSRM returns must switch color based on active layer.
Do NOT change the routing logic — only the Leaflet Polyline color option.
Pass activeLayer into the component that renders the route polyline.
Change the color option dynamically:
jsx// Wherever the route Polyline/Polyline component is rendered:
const routeColor = activeLayer === 'Dark' ? '#ffffff' : '#0a0a0a';

// react-leaflet:
<Polyline positions={routeCoords} pathOptions={{ color: routeColor, weight: 4 }} />

// OR plain Leaflet:
routeLayer.setStyle({ color: routeColor });
If the route is already drawn when the layer switches, update the color reactively —
the pathOptions prop change will handle this automatically in react-leaflet.

✅ Implementation Order

Add userLocationIcon to your icons file, render location Marker when coords available
Add activeLayer state with localStorage read on init
Add LayerPersistence component inside MapContainer to write on layer change
Set checked on each LayersControl.BaseLayer dynamically
Pass activeLayer to Navbar → add .navbar--dark CSS class
Pass activeLayer to route Polyline → switch color reactively

⚠️ Must NOT change

Geolocation fetch logic (just replace the marker icon)
OSRM fetch / polyline decode / corridor filter
localStorage keys used for breakdown reports (use a different key: 'find-ev-charging-map-layer')
Any existing marker click handlers or popup content

---

# charge.ma — UI Update #4: Station Info Card Redesign
# ⚠️ STYLING ONLY — Do NOT touch: station data, marker click handlers,
# popup open/close logic, useRoute.js, useStations.js, corridorFilter.js,
# haversine.js, polyline.js, localStorage reporting logic, OSRM logic.
# Only modify: the popup/card JSX markup and its CSS.

---

## ICON DEFINITIONS

Define these as constants in the component file (inline SVG strings).
Do NOT import from lucide-react — inline them directly for Leaflet popup compatibility.

```js
const ICONS = {
  stationName: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 7h11"/><path d="m9 11-2 3h3l-2 3"/></svg>`,

  power: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 15 21.84"/><path d="M21 5V8"/><path d="M21 12L18 17H22L19 22"/><path d="M3 12A9 3 0 0 0 14.59 14.87"/></svg>`,

  connector: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"/><path d="M17 21v-2"/><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"/><path d="M21 21v-2"/><path d="M3 5V3"/><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"/><path d="M7 5V3"/></svg>`,

  address: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/></svg>`,

  distance: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg>`,

  report: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>`,

  working: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
};
```

---

## CARD HTML STRUCTURE

Replace the existing popup content with this structure.
Keep ALL existing onClick handlers for report/working buttons — only replace the markup wrapping them.
The `station` object fields stay exactly the same.

```jsx
// If using react-leaflet Popup:
<Popup className="station-popup" minWidth={280} maxWidth={280}>
  <div className="sc">

    {/* ── HEADER ── */}
    <div className="sc-header">
      <div className="sc-title-row">
        <span className="sc-icon" dangerouslySetInnerHTML={{ __html: ICONS.stationName }} />
        <span className="sc-name">{station.name}</span>
      </div>
      <span className={`sc-badge ${station.status === 'operational' ? 'sc-badge--ok' : 'sc-badge--broken'}`}>
        {station.status === 'operational' ? 'Operational' : 'Hors service'}
      </span>
    </div>

    {/* ── DIVIDER ── */}
    <div className="sc-divider" />

    {/* ── ATTRIBUTES ── */}
    <ul className="sc-attrs">
      <li className="sc-attr">
        <span className="sc-attr-icon" dangerouslySetInnerHTML={{ __html: ICONS.power }} />
        <span className="sc-attr-label">Power</span>
        <span className="sc-attr-value">{station.power_kw} kW</span>
      </li>
      <li className="sc-attr">
        <span className="sc-attr-icon" dangerouslySetInnerHTML={{ __html: ICONS.connector }} />
        <span className="sc-attr-label">Connector</span>
        <span className="sc-attr-value">{station.connector_type}</span>
      </li>
      {station.address && (
        <li className="sc-attr">
          <span className="sc-attr-icon" dangerouslySetInnerHTML={{ __html: ICONS.address }} />
          <span className="sc-attr-label">Address</span>
          <span className="sc-attr-value">{station.address}</span>
        </li>
      )}
      {station.distanceKm != null && (
        <li className="sc-attr">
          <span className="sc-attr-icon" dangerouslySetInnerHTML={{ __html: ICONS.distance }} />
          <span className="sc-attr-label">From departure</span>
          <span className="sc-attr-value">{station.distanceKm.toFixed(1)} km</span>
        </li>
      )}
    </ul>

    {/* ── DIVIDER ── */}
    <div className="sc-divider" />

    {/* ── ACTIONS — keep existing onClick handlers ── */}
    <div className="sc-actions">
      <button
        className="sc-btn sc-btn--report"
        onClick={/* existing report handler — DO NOT change */}
      >
        <span dangerouslySetInnerHTML={{ __html: ICONS.report }} />
        Signaler
      </button>
      <button
        className="sc-btn sc-btn--working"
        onClick={/* existing working handler — DO NOT change */}
      >
        <span dangerouslySetInnerHTML={{ __html: ICONS.working }} />
        Ça marche
      </button>
    </div>

    {/* ── REPORT COUNT (if reported) ── */}
    {reportCount > 0 && (
      <p className="sc-report-count">
        {reportCount} signalement{reportCount > 1 ? 's' : ''} de panne
      </p>
    )}

  </div>
</Popup>
```

---

## CSS — FULL CARD STYLES

Add to your main CSS file. Override Leaflet's default popup chrome first.

```css
/* ── Reset Leaflet popup chrome ── */
.station-popup .leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,0.07),
    0 10px 30px -5px rgba(0,0,0,0.12),
    0 0 0 1px rgba(0,0,0,0.03);
  overflow: hidden;
  background: #ffffff;
}
.station-popup .leaflet-popup-content {
  margin: 0;
  width: 280px !important;
}
.station-popup .leaflet-popup-tip-container {
  display: none; /* Hide default triangle tip */
}
.station-popup .leaflet-popup-close-button {
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  font-size: 18px;
  color: #9ca3af;
  z-index: 10;
}
.station-popup .leaflet-popup-close-button:hover {
  color: #0a0a0a;
  background: none;
}

/* ── Card root ── */
.sc {
  font-family: var(--font-body);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ── */
.sc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.sc-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.sc-icon {
  flex-shrink: 0;
  color: #0a0a0a;
  display: flex;
  align-items: center;
}
.sc-name {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: #0a0a0a;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Status badge ── */
.sc-badge {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.sc-badge--ok {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
.sc-badge--broken {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}

/* ── Divider ── */
.sc-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 -20px;
  margin-bottom: 14px;
}

/* ── Attribute list ── */
.sc-attrs {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sc-attr {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 8px;
}
.sc-attr-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sc-attr-label {
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 300;
}
.sc-attr-value {
  font-size: 0.82rem;
  color: #0a0a0a;
  font-weight: 400;
  text-align: right;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Action buttons ── */
.sc-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}
.sc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}
.sc-btn:hover { opacity: 0.75; }

.sc-btn--report {
  background: #fff1f2;
  color: #be123c;
  border-color: #fecdd3;
}
.sc-btn--working {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

/* ── Report counter ── */
.sc-report-count {
  margin: 0;
  font-size: 0.72rem;
  color: #9ca3af;
  text-align: center;
  font-weight: 300;
}
```

---

## ⚠️ CRITICAL REMINDERS

- Keep ALL existing onClick/handler props on the report and working buttons
- Keep ALL existing conditional logic for reportCount, isReportedBroken, etc.
- If the popup is rendered via plain Leaflet (not react-leaflet), build the HTML string
  using the same structure above and bind the button click events after popup opens
- Do NOT change how the popup is opened/triggered — only its inner content and style
- The `station.distanceKm` field is only shown if a route is active and the value exists

---

## Widget Composition Standard (Flutter-style in React)

For all new UI work, follow a reusable widget pattern:

- Build and reuse base widgets from `src/components/ui/`:
  - `BaseButton`
  - `LabeledSelectField`
  - `SidebarToggleButton`
  - and future equivalents for cards/panels/badges
- If the same JSX pattern appears in multiple places, extract it to a base widget.
- Configure via props only; do not embed business logic in base widgets.
- Preserve existing visual behavior and interactions while refactoring.

### Practical Rules
- Keep container/screen components focused on orchestration.
- Keep leaf widgets focused on rendering + callbacks.
- Prefer consistent class naming so CSS remains stable.
- Do not alter route/filter/report logic during UI refactors.