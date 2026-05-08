export const STORAGE_KEYS = {
  start: 'find-ev-charge-start',
  end: 'find-ev-charge-end',
  reports: 'chargeMA_reports',
  mapLayer: 'find-ev-charging-map-layer',
  chauffeur: 'find-ev-charge-chauffeur',
};

export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadString(key, fallback = '') {
  return localStorage.getItem(key) ?? fallback;
}

export function saveString(key, value) {
  localStorage.setItem(key, value);
}
