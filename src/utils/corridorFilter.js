import { haversineKm } from './haversine.js';

// Point-to-segment distance using lat/lng projected onto segment via dot product.
// This is an approximation valid for short segments (< 100 km).
function distanceToSegmentKm(lat, lng, lat1, lng1, lat2, lng2) {
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return haversineKm(lat, lng, lat1, lng1);
  let t = ((lat - lat1) * dx + (lng - lng1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return haversineKm(lat, lng, lat1 + t * dx, lng1 + t * dy);
}

export function distanceToPolylineKm(stationLat, stationLng, polyline) {
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(
      stationLat, stationLng,
      polyline[i][0], polyline[i][1],
      polyline[i + 1][0], polyline[i + 1][1]
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// Returns the distance (km) along the polyline from the start to the closest projection point.
export function routeProgressKm(stationLat, stationLng, polyline) {
  let minDist = Infinity;
  let closestIdx = 0;
  let closestT = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [lat1, lng1] = polyline[i];
    const [lat2, lng2] = polyline[i + 1];
    const dx = lat2 - lat1;
    const dy = lng2 - lng1;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq === 0 ? 0 : ((stationLat - lat1) * dx + (stationLng - lng1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const d = haversineKm(stationLat, stationLng, lat1 + t * dx, lng1 + t * dy);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
      closestT = t;
    }
  }

  let dist = 0;
  for (let i = 0; i < closestIdx; i++) {
    dist += haversineKm(polyline[i][0], polyline[i][1], polyline[i + 1][0], polyline[i + 1][1]);
  }
  if (closestIdx < polyline.length - 1) {
    const [lat1, lng1] = polyline[closestIdx];
    const [lat2, lng2] = polyline[closestIdx + 1];
    dist += closestT * haversineKm(lat1, lng1, lat2, lng2);
  }
  return dist;
}
