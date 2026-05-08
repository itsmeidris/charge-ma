import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OCM_MOROCCO_POI_URL = 'https://openchargemap.org/poi?CountryIDs=153&CountryName=morocco';
const OCM_MOROCCO_NETWORKS_URL = 'https://openchargemap.org/country/morocco/networks';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function stripTags(html = '') {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' '));
}

/** kW from OCM text e.g. "Level 3:  High (Over 40kW)" or "22 kW" */
function parsePowerKwFromHtml(powerLine) {
  if (!powerLine) return null;
  const t = powerLine.replace(/\s+/g, ' ');
  const over = t.match(/Over\s+(\d+)\s*kW/i);
  if (over) return Number(over[1]);
  const range = t.match(/(\d+)\s*-\s*(\d+)\s*kW/i);
  if (range) return Math.max(Number(range[1]), Number(range[2]));
  const single = t.match(/(\d+)\s*kW/i);
  if (single) return Number(single[1]);
  return null;
}

/** Map OCM connector label to app enum */
function parseConnectorFromHtml(line) {
  if (!line) return 'Unknown';
  const s = line.trim();
  if (/ccs\s*\(\s*type\s*2\s*\)/i.test(s) || /ccs\s*\(type\s*2\)/i.test(s)) return 'CCS2';
  if (/\bccs2?\b/i.test(s)) return 'CCS2';
  if (/chademo/i.test(s)) return 'CHAdeMO';
  if (/type\s*2|type2/i.test(s) && !/ccs/i.test(s)) return 'Type2';
  if (/ccs/i.test(s)) return 'CCS2';
  return 'Unknown';
}

function buildAddressFromFields(fields) {
  const [street, district, city, _region, postcode, country] = fields;
  const parts = [];
  if (street) parts.push(street);
  if (district) parts.push(district);
  if (city) parts.push(city);
  if (postcode) parts.push(postcode);
  if (country) parts.push(country);
  return parts.join(', ');
}

/**
 * List page splits each POI: after <h3> until next <h3> — one block per station.
 */
function extractStationsFromListHtml(html) {
  const segments = html.split(/<h3>/i);
  const out = [];
  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i];
    const idM = seg.match(/href="\/poi\/details\/(\d+)"/);
    if (!idM) continue;
    const ocmId = idM[1];
    const aM = seg.match(/<a href="\/poi\/details\/\d+">([\s\S]*?)<\/a>/i);
    if (!aM) continue;
    const name = stripTags(aM[1]).replace(/\s+/g, ' ').trim();
    if (!name) continue;

    const fieldMatches = [...seg.matchAll(/<div class="display-field">\s*([\s\S]*?)\s*<\/div>/gi)];
    const fields = fieldMatches.map((m) => stripTags(m[1]).trim());

    const boltM = seg.match(/class="fa fa-bolt"[^>]*><\/span>\s*([^<]+)/i);
    const linkM = seg.match(/class="fa fa-link"[^>]*><\/span>\s*([^<\n]+)/i);
    const powerLine = boltM ? boltM[1].trim() : '';
    const connectorLine = linkM ? linkM[1].trim() : '';

    const powerKw = parsePowerKwFromHtml(powerLine);
    const connectorType = parseConnectorFromHtml(connectorLine);
    const address = buildAddressFromFields(fields);
    const postcode = fields[4] && /^\d+$/.test(fields[4].replace(/\s/g, '')) ? fields[4].trim() : '';

    out.push({
      ocm_id: ocmId,
      name,
      lat: null,
      lng: null,
      address,
      postcode: postcode || '',
      city: (fields[2] || '').trim(),
      power_kw: powerKw,
      connector_type: connectorType,
      power_line_raw: powerLine,
      connector_line_raw: connectorLine,
      operator: '',
      source_ref: `${OCM_MOROCCO_POI_URL}#ocm-${ocmId}`,
      extraction_method: 'list_html',
    });
  }
  return out;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'find-ev-charge-prototype-data-refresh/1.0',
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching ${url}`);
  }
  return res.text();
}

/** Lat/lng from /poi/details/{id} (OCM public page). */
async function fetchPoiDetailsLatLng(ocmId) {
  const url = `https://openchargemap.org/poi/details/${ocmId}`;
  const html = await fetchText(url);
  const latM = html.match(/Latitude<\/strong>:\s*([+-]?\d+\.\d+)/i);
  const lngM = html.match(/Longitude<\/strong>:\s*([+-]?\d+\.\d+)/i);
  const lat = latM ? Number(latM[1]) : null;
  const lng = lngM ? Number(lngM[1]) : null;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, detail_url: url };
  }
  return { lat: null, lng: null, detail_url: url };
}

function extractNetworksFromNetworksPage(html) {
  const names = [];
  for (const line of html.split(/\r?\n/)) {
    if (line.trim().startsWith('### ')) {
      names.push(stripTags(line.replace(/^###\s+/, '')).trim());
    }
  }
  return [...new Set(names)];
}

async function main() {
  const tmpDir = path.resolve('tmp');
  await mkdir(tmpDir, { recursive: true });

  const [poiPage, networksPage] = await Promise.all([
    fetchText(OCM_MOROCCO_POI_URL),
    fetchText(OCM_MOROCCO_NETWORKS_URL),
  ]);

  const fromList = extractStationsFromListHtml(poiPage);
  const byId = new Map();
  for (const s of fromList) {
    byId.set(s.ocm_id, s);
  }
  const stations = [...byId.values()];

  const networks = extractNetworksFromNetworksPage(networksPage);

  let detailsOk = 0;
  let detailsFail = 0;
  for (let i = 0; i < stations.length; i += 1) {
    const s = stations[i];
    const { lat, lng, detail_url } = await fetchPoiDetailsLatLng(s.ocm_id);
    s.lat = lat;
    s.lng = lng;
    s.detail_url = detail_url;
    if (Number.isFinite(lat) && Number.isFinite(lng)) detailsOk += 1;
    else detailsFail += 1;
    if (i < stations.length - 1) await sleep(500);
  }

  const payload = {
    generated_at: new Date().toISOString(),
    source: {
      poi_url: OCM_MOROCCO_POI_URL,
      networks_url: OCM_MOROCCO_NETWORKS_URL,
      note: 'List HTML + per-POI detail page for lat/lng. Throttled fetches; may take ~1s per station.',
    },
    stats: {
      total_candidates: stations.length,
      with_list_metadata: fromList.length,
      detail_coords_ok: detailsOk,
      detail_coords_fail: detailsFail,
      with_coordinates: stations.filter((s) => s.lat != null && s.lng != null).length,
    },
    networks,
    stations,
  };

  const out = path.resolve('tmp/ocm-ma-raw.json');
  await writeFile(out, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${out}`);
  console.log(
    `Stations: ${payload.stats.total_candidates}, detail lat/lng OK: ${detailsOk}, fail: ${detailsFail}`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
