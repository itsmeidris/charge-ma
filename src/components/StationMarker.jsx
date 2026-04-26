import { useEffect, useMemo, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createStationMapIcon } from '../utils/icons.js';
import StationCard from './StationCard.jsx';

export default function StationMarker({
  station,
  hasRoute,
  report,
  isSelected,
  onSelect,
  onReport,
  onDeselect,
  chauffeurMode,
  hasRouteBar,
}) {
  const markerRef = useRef(null);
  const netBroken = (report?.count ?? 0) - (report?.working ?? 0);
  const isReportedBroken = netBroken > 0;

  const isBroken = station.status !== 'operational' || isReportedBroken;
  const icon = useMemo(
    () => createStationMapIcon({ broken: isBroken, isSelected }),
    [isBroken, isSelected]
  );

  const opacity = hasRoute && !station.onCorridor ? 0.25 : 1;

  useEffect(() => {
    if (!isSelected) return;
    const t = window.setTimeout(() => {
      markerRef.current?.openPopup?.();
    }, 0);
    return () => clearTimeout(t);
  }, [isSelected, station.id]);

  return (
    <Marker
      ref={markerRef}
      position={[station.lat, station.lng]}
      icon={icon}
      opacity={opacity}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(station.id),
      }}
    >
      {isSelected && (
        <Popup
          className="station-info-popup"
          offset={[0, -6]}
          maxWidth={320}
          minWidth={260}
          autoClose={false}
          closeOnClick={false}
          closeButton={false}
          keepInView
        >
          <StationCard
            station={station}
            report={report}
            onReport={onReport}
            onClose={onDeselect}
            chauffeurMode={chauffeurMode}
            hasRouteBar={hasRouteBar}
          />
        </Popup>
      )}
    </Marker>
  );
}
