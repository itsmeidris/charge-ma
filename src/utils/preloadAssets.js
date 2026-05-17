import evChargeIconUrl from '../assets/icons/ev_charge_icon.svg?url';

const DEFAULT_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/32/32';

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function preloadFont() {
  if (!document.fonts?.load) return Promise.resolve();
  return document.fonts.load('500 1rem "Clash Display"').catch(() => {});
}

function preloadTile() {
  return fetch(DEFAULT_TILE_URL, { mode: 'cors', cache: 'force-cache' })
    .then(() => {})
    .catch(() => {});
}

/**
 * Runs parallel preload tasks; calls onProgress with 0–1 as each task settles.
 */
export function runAppPreload(onProgress) {
  const tasks = [
    preloadFont(),
    preloadImage(evChargeIconUrl),
    preloadTile(),
  ];

  let done = 0;
  const total = tasks.length;

  function tick() {
    done += 1;
    onProgress?.(Math.min(done / total, 1));
  }

  return Promise.all(
    tasks.map((p) => Promise.resolve(p).finally(tick)),
  );
}
