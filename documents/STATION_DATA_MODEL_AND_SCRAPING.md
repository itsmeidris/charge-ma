# Station Data Model and OpenChargeMap Scraping (No API Key)

## Objective

Build and maintain `src/data/stations.json` for Morocco without runtime API calls or API keys, while keeping the dataset credible for a tech-lead prototype demo.

---

## Decision: Scraping Is Acceptable (With Guardrails)

For this prototype, scraping can be used as an **offline data ingestion step**:

- Run locally before delivery (not in client app runtime).
- Produce a static JSON artifact committed to the repo.
- Keep a manual review pass to avoid noisy/bad entries.

Recommended architecture:

1. Scrape public OpenChargeMap Morocco pages.
2. Normalize and map fields to the Station entity.
3. De-duplicate and score confidence.
4. Manually curate uncertain records.
5. Export final `src/data/stations.json`.

---

## Station Entity (Canonical Model)

This is the project-level entity model the app should rely on.

```js
/**
 * Canonical Station entity for charge.ma
 */
export class Station {
  constructor({
    id,
    name,
    operator,
    lat,
    lng,
    power_kw,
    connector_type,
    status = 'operational',
    address = '',
    source = 'manual',
    source_ref = '',
    last_verified_at = null,
  }) {
    this.id = id;
    this.name = name;
    this.operator = operator;
    this.lat = lat;
    this.lng = lng;
    this.power_kw = power_kw;
    this.connector_type = connector_type;
    this.status = status;
    this.address = address;
    this.source = source;
    this.source_ref = source_ref;
    this.last_verified_at = last_verified_at;
  }
}
```

### Required Core Fields (already used by app)

- `id: string` unique, stable slug (`city-name-shortname`)
- `name: string`
- `operator: string`
- `lat: number` (WGS84 latitude)
- `lng: number` (WGS84 longitude)
- `power_kw: number`
- `connector_type: string` (`CCS2`, `Type2`, `CHAdeMO`, etc.)
- `status: "operational" | "broken"`
- `address: string`

### Recommended Metadata Fields (for data governance)

- `source: string` (`ocm-scrape`, `manual`, `field-verified`)
- `source_ref: string` (original URL or title hash)
- `last_verified_at: string | null` (ISO date)

These are optional for UI, but very useful for curation quality.

---

## Validation Rules for Station Entity

Use these rules before writing output:

1. `id` unique across dataset.
2. `lat` in `[-90, 90]`, `lng` in `[-180, 180]`.
3. Morocco bounding sanity check (approx):
   - `lat` in `[20, 37]`
   - `lng` in `[-17, -1]`
4. `status` only `operational` or `broken`.
5. `power_kw` numeric and positive (`> 0`).
6. `connector_type` from allowlist (`CCS2`, `Type2`, `CHAdeMO`, `Unknown`).
7. Address/name/operator cannot be empty after trim.

---

## Mapping from OpenChargeMap Page Data to Station Entity

When scraping text-based POI pages, map as follows:

- OCM title -> `name`
- OCM operator/network label (if present) -> `operator`
- OCM latitude/longitude -> `lat`, `lng`
- OCM connector/power details -> `connector_type`, `power_kw`
- OCM address block -> `address`
- Derived from source confidence -> `status` defaults to `operational` unless explicitly unavailable/broken
- Source URL/POI marker -> `source_ref`

Fallbacks:

- Missing power: set a conservative default only if clearly inferable by charger type, else skip row.
- Missing connector: `Unknown` (or skip if strict mode).
- Missing operator: infer from title prefix only when high confidence (`FastVolt`, `Kilowatt.ma`, `Tesla`, etc.).

---

## Deduplication Strategy

Deduplicate by nearest-neighbor plus normalized naming:

- Normalize name (lowercase, strip accents, punctuation).
- Candidate duplicate if:
  - distance <= 0.25 km and
  - token overlap >= threshold (for example 0.5).
- Keep record with better field completeness.

---

## Confidence Model (Simple and Practical)

Assign confidence score per station:

- +0.35 if lat/lng present and valid
- +0.20 if address present
- +0.15 if operator explicit
- +0.15 if connector explicit
- +0.15 if power explicit

Threshold suggestion:

- `>= 0.75`: auto-accept
- `0.50 - 0.74`: manual review
- `< 0.50`: reject

---

## Suggested Offline Workflow

1. `node scripts/scrape-ocm-ma.mjs` -> output `tmp/ocm-ma-raw.json`
2. `node scripts/normalize-stations.mjs` -> output `tmp/ocm-ma-normalized.json`
3. `node scripts/merge-stations.mjs` -> output `src/data/stations.json`
4. Manual QA of corridor cities:
   - Casablanca, Rabat, Tanger, Marrakech
   - plus A1/A7 corridor stops
5. Run app and route tests:
   - Casablanca -> Marrakech
   - Rabat -> Tanger

NPM shortcuts:

- `npm run data:scrape`
- `npm run data:normalize`
- `npm run data:merge`
- `npm run data:refresh`

---

## Prototype Delivery Guidance for Tech Lead

State clearly in delivery notes:

- Runtime app uses static `stations.json` (no keys, no backend).
- Data source is OpenChargeMap public listings + manual curation.
- Last refresh date and known limitations are documented.

This keeps the prototype deterministic and demo-safe.

---

## Known Limitations

- Scraping selectors can break when website structure changes.
- OCM community data quality varies by city/operator.
- Some stations may be stale or duplicated.
- Public pages may not expose all structured attributes uniformly.
- Current no-key public pages can return station titles without coordinates, which blocks full auto-merge quality.

---

## Minimal JSON Example (Current App-Compatible)

```json
{
  "id": "rabat-agdal",
  "name": "Rabat Agdal Centre",
  "operator": "ONEE",
  "lat": 34.0210,
  "lng": -6.8560,
  "power_kw": 50,
  "connector_type": "CCS2",
  "status": "operational",
  "address": "Avenue Fal Ould Oumeir, Agdal, Rabat"
}
```

This remains the base contract expected by the map, markers, and station card.
