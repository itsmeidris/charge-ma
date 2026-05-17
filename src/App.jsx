import { useState, useEffect, useMemo, useRef } from 'react';
import Map from './components/Map.jsx';
import RoutePanel from './components/RoutePanel.jsx';
import RouteInfoCard from './components/RouteInfoCard.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import { useRoute } from './hooks/useRoute.js';
import { useStations } from './hooks/useStations.js';
import { CITIES } from './data/cities.js';
import { reverseGeocode } from './utils/reverseGeocode.js';
import stationsData from './data/stations.json';
import { VEHICLE_TABLET_MQ } from './utils/vehicleTablet.js';
import { hydrateStations } from './models/Station.js';
import {
  loadJson,
  loadString,
  saveJson,
  saveString,
  STORAGE_KEYS,
} from './controllers/storageController.js';
import './App.css';

const CASABLANCA = { lat: 33.5731, lng: -7.5898, zoom: 12 };

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [start, setStart] = useState(() => loadJson(STORAGE_KEYS.start, CITIES[0]));
  const [end, setEnd] = useState(() => loadJson(STORAGE_KEYS.end, CITIES[1]));

  useEffect(() => { saveJson(STORAGE_KEYS.start, start); }, [start]);
  useEffect(() => { saveJson(STORAGE_KEYS.end, end); }, [end]);
  const [showOffCorridor, setShowOffCorridor] = useState(true);
  const [reports, setReports] = useState(() => loadJson(STORAGE_KEYS.reports, {}));
  const [mapCenter, setMapCenter] = useState([CASABLANCA.lat, CASABLANCA.lng]);
  const [mapZoom, setMapZoom] = useState(CASABLANCA.zoom);
  const [userLocation, setUserLocation] = useState(null);
  const [pickingMode, setPickingMode] = useState(null); // null | 'start' | 'end'
  const [activeLayer, setActiveLayer] = useState(() => loadString(STORAGE_KEYS.mapLayer, 'Satellite'));
  const [selectedStationId, setSelectedStationId] = useState(null);
  /** Layout conducteur : gros touchers + `data-vehicle-ui` (avec détection tablette paysage). */
  const [chauffeurMode, setChauffeurMode] = useState(() => loadString(STORAGE_KEYS.chauffeur) === '1');

  useEffect(() => {
    const mq = window.matchMedia(VEHICLE_TABLET_MQ);
    function applyVehicleUi() {
      if (mq.matches || chauffeurMode) document.documentElement.setAttribute('data-vehicle-ui', '');
      else document.documentElement.removeAttribute('data-vehicle-ui');
    }
    applyVehicleUi();
    mq.addEventListener('change', applyVehicleUi);
    return () => mq.removeEventListener('change', applyVehicleUi);
  }, [chauffeurMode]);

  useEffect(() => {
    saveString(STORAGE_KEYS.chauffeur, chauffeurMode ? '1' : '0');
  }, [chauffeurMode]);

  function handleStationSelect(id) {
    setSelectedStationId(prev => (prev === id ? null : id));
  }

  function handleMapPick(lat, lng) {
    setSelectedStationId(null);
    const coordLabel = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const pt = { name: coordLabel, lat, lng };

    if (pickingMode === 'start') {
      setStart(pt);
      setPickingMode('end');
      reverseGeocode(lat, lng).then(name =>
        setStart(prev => (prev.lat === lat && prev.lng === lng ? { ...prev, name } : prev))
      );
    } else if (pickingMode === 'end') {
      setEnd(pt);
      setPickingMode(null);
      reverseGeocode(lat, lng).then(name =>
        setEnd(prev => (prev.lat === lat && prev.lng === lng ? { ...prev, name } : prev))
      );
    }
  }

  function handleLayerChange(layerName) {
    setActiveLayer(layerName);
    saveString(STORAGE_KEYS.mapLayer, layerName);
  }

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        setMapZoom(13);
        setUserLocation(coords);
      },
      () => {
        setMapCenter([CASABLANCA.lat, CASABLANCA.lng]);
        setMapZoom(CASABLANCA.zoom);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  const { route, loading, error, fetchRoute, clearRoute } = useRoute();
  const stations = useMemo(() => hydrateStations(stationsData), []);
  const annotatedStations = useStations(stations, route);
  const corridorCount = route ? annotatedStations.filter(s => s.onCorridor).length : 0;

  const isFirstRender = useRef(true);
  const skipNextFetch  = useRef(false);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (skipNextFetch.current)  { skipNextFetch.current  = false; return; }
    if (start.name !== end.name) fetchRoute(start, end);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.lat, start.lng, end.lat, end.lng]);

  function handleClear() {
    clearRoute();
    skipNextFetch.current = true;
    setStart(CITIES[0]);
    setEnd(CITIES[1]);
  }

  function handleReport(stationId, type) {
    setReports(prev => {
      const cur = prev[stationId] || { count: 0, working: 0, timestamps: [] };
      const next = {
        ...prev,
        [stationId]: type === 'broken'
          ? { ...cur, count: cur.count + 1, timestamps: [...cur.timestamps, Date.now()] }
          : { ...cur, working: cur.working + 1 },
      };
      saveJson(STORAGE_KEYS.reports, next);
      return next;
    });
  }

  return (
    <>
      {!introComplete && <IntroScreen onComplete={() => setIntroComplete(true)} />}
      <div className={introComplete ? 'app-shell app-shell--visible' : 'app-shell'}>
        <div className={`app${activeLayer === 'Dark' ? ' app--dark' : ''}`}>
          <RoutePanel
            start={start}
            end={end}
            onStart={setStart}
            onEnd={setEnd}
            onFetch={() => fetchRoute(start, end)}
            onClear={handleClear}
            loading={loading}
            error={error}
            route={route}
            showOffCorridor={showOffCorridor}
            onToggleOffCorridor={() => setShowOffCorridor(v => !v)}
            pickingMode={pickingMode}
            onPickStart={() => setPickingMode('start')}
            onPickEnd={() => setPickingMode('end')}
            onCancelPick={() => setPickingMode(null)}
            chauffeurMode={chauffeurMode}
          />
          {route && (
            <RouteInfoCard
              key={`${route.distance}-${route.duration}`}
              route={route}
              start={start}
              end={end}
              corridorCount={corridorCount}
              chauffeurMode={chauffeurMode}
            />
          )}
          <div className="map-wrap">
            <Map
              route={route}
              stations={annotatedStations}
              reports={reports}
              hasRoute={!!route}
              showOffCorridor={showOffCorridor}
              onReport={handleReport}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              userLocation={userLocation}
              activeLayer={activeLayer}
              onLayerChange={handleLayerChange}
              pickingMode={pickingMode}
              onMapPick={handleMapPick}
              onCancelPick={() => setPickingMode(null)}
              start={start}
              end={end}
              selectedStationId={selectedStationId}
              onStationSelect={handleStationSelect}
              onMapBackgroundClick={() => setSelectedStationId(null)}
              onStationClose={() => setSelectedStationId(null)}
              chauffeurMode={chauffeurMode}
              onChauffeurModeToggle={() => setChauffeurMode(v => !v)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
