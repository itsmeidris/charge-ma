import { useMemo } from 'react';
import { distanceToPolylineKm, routeProgressKm } from '../utils/corridorFilter.js';

const CORRIDOR_KM = 5;

export function useStations(stations, route) {
  return useMemo(() => {
    if (!route) {
      return stations.map(s => ({ ...s, onCorridor: false, distFromStart: null }));
    }
    const { polyline } = route;
    return stations
      .map(s => {
        const perpDist = distanceToPolylineKm(s.lat, s.lng, polyline);
        const onCorridor = perpDist <= CORRIDOR_KM;
        const distFromStart = onCorridor ? routeProgressKm(s.lat, s.lng, polyline) : null;
        return { ...s, onCorridor, distFromStart };
      })
      .sort((a, b) => {
        if (a.onCorridor && b.onCorridor) return a.distFromStart - b.distFromStart;
        if (a.onCorridor) return -1;
        if (b.onCorridor) return 1;
        return 0;
      });
  }, [stations, route]);
}
