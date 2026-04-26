import { useEffect, useState } from 'react';
import { VEHICLE_TABLET_MQ } from '../utils/vehicleTablet.js';

/** Partie après la dernière virgule; rue dans le détail. */
function splitAddressLine(address) {
  if (!address || typeof address !== 'string') {
    return { detailLine: null, locality: null };
  }
  const idx = address.lastIndexOf(',');
  if (idx === -1) return { detailLine: address.trim(), locality: null };
  const before = address.slice(0, idx).trim();
  const after = address.slice(idx + 1).trim();
  if (!after) return { detailLine: address.trim(), locality: null };
  return { detailLine: before, locality: after };
}

const IconPower = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5V19A9 3 0 0 0 15 21.84"/>
    <path d="M21 5V8"/>
    <path d="M21 12L18 17H22L19 22"/>
    <path d="M3 12A9 3 0 0 0 14.59 14.87"/>
  </svg>
);

const IconConnector = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"/>
    <path d="M17 21v-2"/>
    <path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"/>
    <path d="M21 21v-2"/>
    <path d="M3 5V3"/>
    <path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"/>
    <path d="M7 5V3"/>
  </svg>
);

const IconLocate = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" x2="5" y1="12" y2="12"/>
    <line x1="19" x2="22" y1="12" y2="12"/>
    <line x1="12" x2="12" y1="2" y2="5"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
    <circle cx="12" cy="12" r="7"/>
  </svg>
);

const IconMapPinned = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/>
    <circle cx="12" cy="8" r="2"/>
    <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/>
  </svg>
);

const IconFlag = ({ size = 13 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>
  </svg>
);

const IconShieldCheck = ({ size = 13 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

/**
 * Fiche station — affichée au-dessus du marqueur via Leaflet Popup.
 */
export default function StationCard({ station, report, onReport, onClose, chauffeurMode = false, hasRouteBar = false }) {
  const [mediaDriver, setMediaDriver] = useState(false);
  const isDriver = !!chauffeurMode || mediaDriver;

  useEffect(() => {
    const mq = window.matchMedia(VEHICLE_TABLET_MQ);
    const sync = () => setMediaDriver(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const netBroken = (report?.count ?? 0) - (report?.working ?? 0);
  const { detailLine, locality } = splitAddressLine(station.address);

  return (
    <div
      className={`st-panel st-panel--popup-indicator glass3d${isDriver || hasRouteBar ? ' st-panel--above-route' : ''}`}
    >
      <div className="st-panel__body st-panel__body--popup">
        <div className="st-panel__head st-panel__head--popup">
          <div className="st-panel__head-main">
            <h2 className="st-panel__title">{station.operator}</h2>
            {locality && <p className="st-panel__locality">{locality}</p>}
          </div>
          <button
            type="button"
            className="st-panel__close"
            onClick={onClose}
            aria-label="Fermer la fiche station"
            title="Fermer"
          >
            ×
          </button>
        </div>
        <div className="st-pills" aria-label="Détails">
          <span className="st-pill">{station.name}</span>
          <span className="st-pill">{station.power_kw} kW</span>
          <span className="st-pill">{station.connector_type}</span>
        </div>

        <div className="sc sc--panel">
          <div className="sc-status-row sc-status-row--panel">
            <span className={`sc-status-pill ${station.status}`}>
              <span className="sc-dot" />
              {station.status === 'operational' ? 'Opérationnel' : 'Hors service'}
            </span>
            {netBroken > 0 && (
              <span className="sc-report-count">
                {netBroken} signalement{netBroken > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="sc-body sc-body--panel">
            <div className="sc-grid sc-grid--panel">
              <div className="sc-row">
                <span className="sc-icon"><IconPower /></span>
                <span>{station.power_kw} kW</span>
              </div>
              <div className="sc-row">
                <span className="sc-icon"><IconConnector /></span>
                <span>{station.connector_type}</span>
              </div>
            </div>
            {station.address && (
              <div className="sc-row">
                <span className="sc-icon"><IconLocate /></span>
                <span className="sc-muted">{(detailLine && locality) ? detailLine : station.address}</span>
              </div>
            )}
          </div>

          {station.distFromStart != null && (
            <div className="sc-route sc-route--panel">
              <div className="sc-row">
                <span className="sc-icon"><IconMapPinned /></span>
                <span>
                  {station.distFromStart.toFixed(1)} km depuis le départ
                </span>
                <span className="sc-sep">·</span>
                <span>~{Math.round((station.distFromStart / 90) * 60)} min</span>
              </div>
            </div>
          )}

          <div className="sc-actions sc-actions--panel">
            <button type="button" className="sc-btn sc-btn-report" onClick={() => onReport(station.id, 'broken')}>
              <IconFlag />
              Signaler panne
            </button>
            <button type="button" className="sc-btn sc-btn-working" onClick={() => onReport(station.id, 'working')}>
              <IconShieldCheck />
              Ça marche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
