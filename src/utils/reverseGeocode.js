export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const addr = data.address || {};
    const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.cycleway;
    const place = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    if (road && place) return `📍 ${road}, ${place}`;
    if (road) return `📍 ${road}`;
    if (data.display_name) {
      const short = data.display_name.split(',').slice(0, 2).join(',').trim();
      return `📍 ${short}`;
    }
  } catch {
    // fall through to coord fallback
  }
  return `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
