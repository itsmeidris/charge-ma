const VALID_STATUS = new Set(['operational', 'broken']);

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export class Station {
  constructor(raw = {}) {
    this.id = toText(raw.id);
    this.name = toText(raw.name);
    this.operator = toText(raw.operator, 'Unknown');
    this.lat = toNumber(raw.lat);
    this.lng = toNumber(raw.lng);
    this.power_kw = toNumber(raw.power_kw) ?? 22;
    this.connector_type = toText(raw.connector_type, 'Unknown');
    this.status = VALID_STATUS.has(raw.status) ? raw.status : 'operational';
    this.address = toText(raw.address);
    this.postal_code = raw.postal_code != null ? toText(String(raw.postal_code)) : '';
    this.ocm_id = raw.ocm_id != null ? toText(String(raw.ocm_id)) : '';

    // Optional data-governance metadata (safe defaults for legacy rows)
    this.source = toText(raw.source, 'manual');
    this.source_ref = toText(raw.source_ref);
    this.last_verified_at = toText(raw.last_verified_at) || null;
  }

  get hasValidCoordinates() {
    return this.lat != null && this.lng != null;
  }

  get isOperational() {
    return this.status === 'operational';
  }
}

export function hydrateStations(rawStations) {
  if (!Array.isArray(rawStations)) return [];
  return rawStations
    .map((raw) => new Station(raw))
    .filter((station) => station.id && station.name && station.hasValidCoordinates);
}
