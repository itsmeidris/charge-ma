import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const IN_PATH = path.resolve('tmp/ocm-ma-raw.json');
const OUT_PATH = path.resolve('tmp/ocm-ma-normalized.json');
const GEO_CACHE_PATH = path.resolve('tmp/ocm-geocode-cache.json');

const MOROCCO_BOUNDS = {
  minLat: 20,
  maxLat: 37,
  minLng: -17,
  maxLng: -1,
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const cp = Number.parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      const cp = Number.parseInt(dec, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    });
}

function cleanOcmTitle(raw) {
  let out = decodeHtmlEntities(raw || '');
  out = out.replace(/\s+/g, ' ').trim();
  out = out.replace(/\s+\d+(?:\s+\d+)?\s*$/, '').trim();
  out = out.replace(/\s*[-–|]\s*$/, '').trim();
  return out;
}

function inferOperator(name) {
  const n = name.toLowerCase();
  if (n.includes('tesla')) return 'Tesla';
  if (n.includes('fastvolt')) return 'FastVolt';
  if (n.includes('kilowatt')) return 'Kilowatt.ma';
  if (n.includes('totalenergies') || n.includes('total energies')) return 'TotalEnergies';
  if (n.includes('afriquia')) return 'Afriquia';
  return 'Unknown';
}

function inferPowerKw(name) {
  const m = name.match(/(\d{2,3})\s*kw/i);
  if (m) return Number(m[1]);
  return null;
}

function inferConnector(name) {
  const n = name.toLowerCase();
  if (n.includes('ccs')) return 'CCS2';
  if (n.includes('chademo')) return 'CHAdeMO';
  if (n.includes('type2') || n.includes('type 2')) return 'Type2';
  return 'Unknown';
}

function inMoroccoBounds(lat, lng) {
  return (
    lat >= MOROCCO_BOUNDS.minLat &&
    lat <= MOROCCO_BOUNDS.maxLat &&
    lng >= MOROCCO_BOUNDS.minLng &&
    lng <= MOROCCO_BOUNDS.maxLng
  );
}

function dedupeByNameAndCoords(items) {
  const seen = new Set();
  const out = [];
  for (const s of items) {
    const key = `${slugify(s.name)}|${s.lat ?? 'na'}|${s.lng ?? 'na'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadGeocodeCache() {
  try {
    const raw = await readFile(GEO_CACHE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveGeocodeCache(cache) {
  await writeFile(GEO_CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

async function geocodeQuery(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': 'find-ev-charge-prototype-normalizer/1.0',
      accept: 'application/json',
    },
  });
  if (!res.ok) return { lat: null, lng: null };
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return { lat: null, lng: null };
  const first = rows[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null };
  if (!inMoroccoBounds(lat, lng)) return { lat: null, lng: null };
  return { lat, lng };
}

function resolvePowerKw(cleanName, raw) {
  const p = raw.power_kw;
  if (Number.isFinite(p) && p > 0) return Number(p);
  const fromName = inferPowerKw(cleanName);
  if (Number.isFinite(fromName) && fromName > 0) return fromName;
  return 22;
}

function resolveConnector(cleanName, raw) {
  const c = raw.connector_type;
  if (c && c !== 'Unknown') return c;
  return inferConnector(cleanName);
}

async function main() {
  const raw = JSON.parse(await readFile(IN_PATH, 'utf8'));
  const rawStations = Array.isArray(raw.stations) ? raw.stations : [];
  const geocodeCache = await loadGeocodeCache();

  let seq = 1;
  const normalized = rawStations
    .map((s) => {
      const cleanName = cleanOcmTitle(s.name || '');
      const ocmId = s.ocm_id != null ? String(s.ocm_id) : null;
      let lat = Number.isFinite(s.lat) ? Number(s.lat) : null;
      let lng = Number.isFinite(s.lng) ? Number(s.lng) : null;
      const id = ocmId
        ? `ocm-${ocmId}`
        : `ocm-${slugify(cleanName || `station-${seq++}`)}`;

      const power_kw = resolvePowerKw(cleanName, s);
      const connector_type = resolveConnector(cleanName, s);
      const address = (s.address || '').trim();
      const postcode = (s.postcode || '').trim();
      const city = (s.city || '').trim();

      return {
        id,
        ocm_id: ocmId,
        name: cleanName || `Unknown Station ${seq++}`,
        operator: (s.operator || '').trim() || inferOperator(cleanName || ''),
        lat,
        lng,
        power_kw,
        connector_type,
        status: 'operational',
        address,
        postcode,
        source: 'ocm-scrape',
        source_ref: s.detail_url || s.source_ref || raw.source?.poi_url || '',
        last_verified_at: raw.generated_at || null,
      };
    })
    .filter((st) => st.name && st.id);

  let geocodeHits = 0;
  let geocodeMisses = 0;

  for (const station of normalized) {
    if (Number.isFinite(station.lat) && Number.isFinite(station.lng)) continue;

    const queries = [];
    if (station.address && station.address.length > 8) {
      queries.push(station.address);
    }
    if (station.postcode && station.city) {
      queries.push(`${station.postcode} ${station.city}, Morocco`);
    }
    if (station.city) {
      queries.push(`${station.name}, ${station.city}, Morocco`);
    }
    queries.push(`${station.name}, Morocco`);

    let found = false;
    for (const q of queries) {
      const cacheKey = `q:${q.toLowerCase()}`;
      let geo = geocodeCache[cacheKey];
      if (!geo) {
        geo = await geocodeQuery(q);
        geocodeCache[cacheKey] = geo;
        await sleep(850);
      }
      if (Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
        station.lat = geo.lat;
        station.lng = geo.lng;
        found = true;
        geocodeHits += 1;
        break;
      }
    }
    if (!found) geocodeMisses += 1;
  }

  const withValidCoords = normalized.filter(
    (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && inMoroccoBounds(s.lat, s.lng)
  );
  const withoutCoords = normalized.filter(
    (s) => !Number.isFinite(s.lat) || !Number.isFinite(s.lng)
  );
  const outOfBounds = normalized.filter(
    (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng) && !inMoroccoBounds(s.lat, s.lng)
  );

  const finalStations = dedupeByNameAndCoords(withValidCoords);

  const payload = {
    generated_at: new Date().toISOString(),
    source: raw.source || { note: 'normalized from tmp/ocm-ma-raw.json' },
    stats: {
      raw_candidates: rawStations.length,
      normalized: normalized.length,
      valid_with_coords: withValidCoords.length,
      out_of_bounds: outOfBounds.length,
      dropped_without_coords: withoutCoords.length,
      final_count: finalStations.length,
      geocode_hits: geocodeHits,
      geocode_misses: geocodeMisses,
    },
    stations: finalStations,
    dropped: {
      without_coords: withoutCoords.map((s) => ({ name: s.name, address: s.address, postcode: s.postcode })),
      out_of_bounds: outOfBounds.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng })),
    },
  };

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await saveGeocodeCache(geocodeCache);
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
  console.log(
    `Final normalized stations: ${payload.stats.final_count} (geocode extra hits: ${geocodeHits}, still missing: ${geocodeMisses}, dropped no coords: ${payload.stats.dropped_without_coords})`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
