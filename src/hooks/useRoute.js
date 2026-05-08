import { useState } from 'react';
import { decodePolyline } from '../utils/polyline.js';

const OSRM_BASE  = 'https://router.project-osrm.org/route/v1/driving';
const CACHE_KEY  = 'find-ev-charge-route';

function loadCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; }
  catch { return null; }
}

export function useRoute() {
  const [route, setRoute] = useState(loadCached);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  async function fetchRoute(start, end) {
    setLoading(true);
    setError(null);
    setRoute(null);
    try {
      const url = `${OSRM_BASE}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur réseau: HTTP ${res.status}`);
      const data = await res.json();
      if (data.code !== 'Ok') throw new Error(data.message || 'Itinéraire introuvable');
      const r = data.routes[0];
      const next = {
        polyline: decodePolyline(r.geometry),
        distance: r.distance / 1000,
        duration: r.duration,
      };
      setRoute(next);
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearRoute() {
    setRoute(null);
    setError(null);
    localStorage.removeItem(CACHE_KEY);
  }

  return { route, loading, error, fetchRoute, clearRoute };
}
