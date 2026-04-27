import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const LOCAL_PATH = path.resolve('src/data/stations.json');
const IN_PATH = path.resolve('tmp/ocm-ma-normalized.json');
const REPORT_PATH = path.resolve('tmp/ocm-ma-merge-report.json');

function toRad(v) {
  return (v * Math.PI) / 180;
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function norm(v) {
  return (v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameSimilarity(a, b) {
  const A = new Set(norm(a).split(' ').filter((t) => t.length > 2));
  const B = new Set(norm(b).split(' ').filter((t) => t.length > 2));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / Math.max(A.size, B.size);
}

function isLikelySameStation(local, candidate) {
  if (local.ocm_id && candidate.ocm_id && String(local.ocm_id) === String(candidate.ocm_id)) {
    return true;
  }
  if (
    Number.isFinite(local.lat) &&
    Number.isFinite(local.lng) &&
    Number.isFinite(candidate.lat) &&
    Number.isFinite(candidate.lng)
  ) {
    const km = haversineKm(local.lat, local.lng, candidate.lat, candidate.lng);
    if (km <= 0.6) return true;
  }
  return nameSimilarity(local.name, candidate.name) >= 0.75;
}

async function main() {
  const local = JSON.parse(await readFile(LOCAL_PATH, 'utf8'));
  const normalizedPayload = JSON.parse(await readFile(IN_PATH, 'utf8'));
  const incoming = Array.isArray(normalizedPayload.stations) ? normalizedPayload.stations : [];

  const merged = [...local];
  const skipped = [];
  const added = [];

  for (const inc of incoming) {
    const dupIndex = merged.findIndex((loc) => isLikelySameStation(loc, inc));

    const prepared = {
      id: inc.id,
      ocm_id: inc.ocm_id || '',
      name: inc.name,
      operator: inc.operator || 'Unknown',
      lat: inc.lat,
      lng: inc.lng,
      power_kw:
        Number.isFinite(inc.power_kw) && inc.power_kw > 0 ? inc.power_kw : 22,
      connector_type: inc.connector_type || 'Unknown',
      status: inc.status || 'operational',
      address: inc.address || '',
      postal_code: inc.postal_code || inc.postcode || '',
      source: inc.source || 'ocm-scrape',
      source_ref: inc.source_ref || '',
      last_verified_at: inc.last_verified_at || null,
    };

    if (dupIndex !== -1) {
      if (inc.ocm_id) {
        const existing = merged[dupIndex];
        merged[dupIndex] = {
          ...existing,
          ...prepared,
          id: existing.id,
        };
        skipped.push({ action: 'updated', incoming: inc.name, kept_id: existing.id });
      } else {
        skipped.push({ action: 'skipped_duplicate', incoming: inc.name, matched: merged[dupIndex].name });
      }
      continue;
    }

    merged.push(prepared);
    added.push(prepared.name);
  }

  await writeFile(LOCAL_PATH, JSON.stringify(merged, null, 2), 'utf8');

  const report = {
    generated_at: new Date().toISOString(),
    local_before: local.length,
    incoming_count: incoming.length,
    added_count: added.length,
    skipped_count: skipped.length,
    local_after: merged.length,
    added,
    skipped,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Merged stations written to ${LOCAL_PATH}`);
  console.log(`Added: ${report.added_count}, skipped as duplicates: ${report.skipped_count}`);
  console.log(`Merge report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
