import { useEffect, useState } from 'react';
import { VEHICLE_TABLET_MQ } from '../utils/vehicleTablet.js';
import { splitAddressLine } from '../utils/address.js';
import {
  IconConnector,
  IconFlag,
  IconLocate,
  IconMapPinned,
  IconPower,
  IconShieldCheck,
} from './icons/AppIcons.jsx';

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
