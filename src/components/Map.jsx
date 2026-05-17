import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AnimatedRoutePolyline from './AnimatedRoutePolyline.jsx';
import StationMarker from './StationMarker.jsx';
import {
  userLocationIcon,
  startPinIcon,
  endPinIcon,
  ICON_HELP_ITEMS,
  HELP_BUTTON_SVG,
  LAYER_BUTTON_SVG,
} from '../utils/icons.js';
import { CITIES } from '../data/cities.js';
import { VEHICLE_TABLET_MQ } from '../utils/vehicleTablet.js';
import chauffeurModeIcon from '../assets/icons/chauffeur_mode.svg';

const TILE_LAYERS = {
  Standard:  { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",                                                attribution: "© OpenStreetMap contributors" },
  Satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",   attribution: "© Esri" },
  Dark:      { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                                   attribution: "© CartoDB" },
  Topo:      { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                                                attribution: "© OpenTopoMap" },
};

/** Fixed tile previews (Casablanca area, zoom 13) for the layer picker */
const LAYER_OPTIONS = [
  { key: 'Standard', preview: 'https://a.tile.openstreetmap.org/13/4251/2874.png' },
  { key: 'Satellite', preview: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/2874/4251' },
  { key: 'Dark', preview: 'https://a.basemaps.cartocdn.com/dark_all/13/4251/2874.png' },
  { key: 'Topo', preview: 'https://a.tile.opentopomap.org/13/4251/2874.png' },
];

function MapController({ route, mapCenter, mapZoom }) {
  const map = useMap();
  const routeKeyRef = useRef(null);

  useEffect(() => {
    if (route?.polyline?.length) return;
    if (mapCenter) {
      map.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom, map, route]);

  useEffect(() => {
    if (!route?.polyline?.length) return;

    const key = `${route.distance}-${route.duration}-${route.polyline.length}`;
    if (routeKeyRef.current === key) return;
    routeKeyRef.current = key;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bounds = L.latLngBounds(route.polyline);

    if (reduced) {
      map.fitBounds(bounds, { padding: [50, 50] });
      return;
    }

    map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 1.35,
      easeLinearity: 0.22,
    });
  }, [route, map]);

  return null;
}

function MapClickHandler({ pickingMode, onMapPick }) {
  useMapEvents({
    click(e) {
      if (pickingMode) onMapPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CursorController({ pickingMode }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().style.cursor = pickingMode ? 'crosshair' : '';
  }, [pickingMode, map]);
  return null;
}

/** Clic sur la carte vide : désélection (pas les marqueurs / popups). */
function MapBackgroundDeselect({ pickingMode, onMapBackgroundClick }) {
  useMapEvents({
    click(e) {
      if (!onMapBackgroundClick || pickingMode) return;
      const t = e.originalEvent?.target;
      if (t?.closest?.('.leaflet-marker-icon')) return;
      if (t?.closest?.('.leaflet-popup')) return;
      onMapBackgroundClick();
    },
  });
  return null;
}

export default function Map({
  route,
  stations,
  reports,
  hasRoute,
  showOffCorridor,
  onReport,
  mapCenter,
  mapZoom,
  userLocation,
  activeLayer,
  onLayerChange,
  pickingMode,
  onMapPick,
  onCancelPick,
  start,
  end,
  selectedStationId,
  onStationSelect,
  onMapBackgroundClick,
  onStationClose,
  chauffeurMode = false,
  onChauffeurModeToggle,
}) {
  const routeColor = activeLayer === 'Dark' ? '#ffffff' : '#0a0a0a';
  const [showHelp, setShowHelp] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [mediaVehicleUi, setMediaVehicleUi] = useState(false);
  const isVehicleUI = !!chauffeurMode || mediaVehicleUi;

  const controlsRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(VEHICLE_TABLET_MQ);
    function sync() {
      setMediaVehicleUi(mq.matches);
    }
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!showHelp && !showLayers) return;

    function handleOutsideClick(event) {
      if (!controlsRef.current) return;
      if (!controlsRef.current.contains(event.target)) {
        setShowHelp(false);
        setShowLayers(false);
        setHoverTooltip('');
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showHelp, showLayers]);

  const layer = TILE_LAYERS[activeLayer] || TILE_LAYERS.Standard;

  const btnH = isMobile ? 44 : (isVehicleUI ? 56 : 50);
  const stackGap = isMobile ? 6 : (isVehicleUI ? 10 : 8);
  const iconS = isMobile ? 26 : (isVehicleUI ? 36 : 30);
  /** Panels open downward, below the two stacked buttons */
  const panelsTop = 2 * btnH + stackGap + 8;
  const controlRight = isMobile ? 12 : (isVehicleUI ? 'max(12px, env(safe-area-inset-right, 0px))' : 24);
  const controlTop = isMobile ? 12 : (isVehicleUI ? 'max(12px, env(safe-area-inset-top, 0px))' : 24);
  const layerCardH = isMobile ? 62 : (isVehicleUI ? 84 : 78);
  const helpMaxH = isVehicleUI ? 'min(50vh, 50dvh)' : (isMobile ? '58vh' : '70vh');
  const layersMaxH = isVehicleUI ? 'min(50vh, 50dvh)' : (isMobile ? '58vh' : '70vh');
  const helpTitleSize = isVehicleUI ? '0.9rem' : '0.8rem';
  const helpTextSize = isVehicleUI ? '0.9rem' : '0.8rem';
  const coucheTitle = isMobile ? '1.4rem' : (isVehicleUI ? '1.75rem' : '2.1rem');
  const coucheLabel = isMobile ? '1.5rem' : (isVehicleUI ? '1.7rem' : '2rem');

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {pickingMode && (
        <div className="map-pick-banner">
          <span>
            {pickingMode === 'start'
              ? '📍 Choisir le point de départ'
              : '📍 Choisir la destination'}
          </span>
          <button className="map-pick-cancel" onClick={onCancelPick}>✕ Annuler</button>
        </div>
      )}
      <MapContainer
        center={[33.5731, -7.5898]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={layer.url} attribution={layer.attribution} />
        <MapController route={route} mapCenter={mapCenter} mapZoom={mapZoom} />
        <MapClickHandler pickingMode={pickingMode} onMapPick={onMapPick} />
        <MapBackgroundDeselect pickingMode={pickingMode} onMapBackgroundClick={onMapBackgroundClick} />
        <CursorController pickingMode={pickingMode} />
        {route && (
          <AnimatedRoutePolyline
            positions={route.polyline}
            color={routeColor}
            weight={5}
            opacity={0.85}
          />
        )}
        {start && !CITIES.find(c => c.name === start.name) && (
          <Marker position={[start.lat, start.lng]} icon={startPinIcon} />
        )}
        {end && !CITIES.find(c => c.name === end.name) && start.name !== end.name && (
          <Marker position={[end.lat, end.lng]} icon={endPinIcon} />
        )}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon} />
        )}
        {stations.map(station => {
          if (!showOffCorridor && hasRoute && !station.onCorridor) return null;
          return (
            <StationMarker
              key={station.id}
              station={station}
              hasRoute={hasRoute}
              report={reports[station.id]}
              isSelected={selectedStationId === station.id}
              onSelect={onStationSelect}
              onReport={onReport}
              onDeselect={onStationClose}
              chauffeurMode={chauffeurMode}
              hasRouteBar={!!route}
            />
          );
        })}
      </MapContainer>

      <div
        ref={controlsRef}
        className="map-floating-ui"
        style={{
          position: 'absolute',
          right: controlRight,
          top: controlTop,
          bottom: 'auto',
          zIndex: 1250,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: stackGap,
          width: btnH,
        }}
      >
        {showHelp && (
          <div
            className="map-floating-ui__help"
            style={{
              width: isMobile ? 240 : (isVehicleUI ? 320 : 300),
              maxWidth: isMobile ? 'calc(100vw - 80px)' : (isVehicleUI ? 'min(360px, calc(100vw - 48px))' : 'calc(100vw - 48px)'),
              maxHeight: helpMaxH,
              overflowY: 'auto',
              position: 'absolute',
              right: 0,
              top: panelsTop,
            }}
          >
            <div
              className="map-floating-ui__help-title"
              style={{ fontSize: helpTitleSize }}
            >
              HELP - ICONES
            </div>
            {ICON_HELP_ITEMS.map(item => (
              <div key={item.key} className="map-floating-ui__help-row">
                <div
                  className="map-floating-ui__help-icon"
                  dangerouslySetInnerHTML={{ __html: item.iconHtml }}
                />
                <span
                  className="map-floating-ui__help-text"
                  style={{ fontSize: helpTextSize }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {showLayers && (
          <div
            style={{
              width: isMobile ? 250 : (isVehicleUI ? 300 : 290),
              maxHeight: layersMaxH,
              overflowY: 'auto',
              position: 'absolute',
              right: 0,
              top: panelsTop,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(18, 24, 33, 0.92)',
              color: '#fff',
              padding: isMobile ? 10 : 12,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <div style={{ fontSize: coucheTitle, fontWeight: 700, marginBottom: 12, lineHeight: 1.05 }}>
              Couches de carte
            </div>
            {LAYER_OPTIONS.map(opt => {
              const selected = opt.key === activeLayer;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    onLayerChange(opt.key);
                    setShowLayers(false);
                  }}
                  style={{
                    width: '100%',
                    height: layerCardH,
                    borderRadius: 9,
                    border: selected ? '2px solid #84a6ff' : '1px solid rgba(255,255,255,0.15)',
                    marginBottom: 10,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: `url("${opt.preview}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    textAlign: 'left',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(13,16,22,0.78), rgba(13,16,22,0.22))',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 8,
                      color: '#fff',
                      fontSize: coucheLabel,
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                    }}
                  >
                    {opt.key}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!isMobile && hoverTooltip && (
          <div
            style={{
              position: 'absolute',
              right: btnH + 8,
              top: stackGap,
              background: 'rgba(10,10,10,0.9)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}
          >
            {hoverTooltip}
          </div>
        )}

        {typeof onChauffeurModeToggle === 'function' && (
          <button
            type="button"
            onClick={onChauffeurModeToggle}
            onMouseEnter={() => !isMobile && setHoverTooltip('Mode chauffeur')}
            onMouseLeave={() => setHoverTooltip('')}
            style={{
              width: btnH,
              height: btnH,
              borderRadius: 8,
              border: 'none',
              background: chauffeurMode ? '#efefef' : '#ffffff',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}
            aria-pressed={chauffeurMode}
            aria-label="Mode chauffeur"
            title="Mode chauffeur"
          >
            <img
              src={chauffeurModeIcon}
              alt=""
              style={{ width: iconS, height: iconS, display: 'block' }}
            />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowLayers(v => !v)}
          onMouseEnter={() => !isMobile && setHoverTooltip('Choisir une couche de carte')}
          onMouseLeave={() => setHoverTooltip('')}
          style={{
            width: btnH,
            height: btnH,
            borderRadius: 8,
            border: 'none',
            background: showLayers ? '#efefef' : '#ffffff',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
          aria-expanded={showLayers}
          aria-label="Afficher les couches de carte"
          title="Couches de carte"
        >
          <span
            style={{ width: iconS, height: iconS, display: 'block' }}
            dangerouslySetInnerHTML={{ __html: LAYER_BUTTON_SVG }}
          />
        </button>

        <button
          type="button"
          onClick={() => setShowHelp(v => !v)}
          onMouseEnter={() => !isMobile && setHoverTooltip('Aide des icones de la carte')}
          onMouseLeave={() => setHoverTooltip('')}
          style={{
            width: btnH,
            height: btnH,
            borderRadius: 8,
            border: 'none',
            background: showHelp ? '#efefef' : '#ffffff',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
          aria-expanded={showHelp}
          aria-label="Afficher l'aide des icones"
          title="Aide des icones"
        >
          <span
            style={{ width: iconS, height: iconS, display: 'block' }}
            dangerouslySetInnerHTML={{ __html: HELP_BUTTON_SVG }}
          />
        </button>
      </div>
    </div>
  );
}
