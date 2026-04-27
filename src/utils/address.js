export function splitAddressLine(address) {
  if (!address || typeof address !== 'string') {
    return { detailLine: null, locality: null };
  }
  const idx = address.lastIndexOf(',');
  if (idx === -1) return { detailLine: address.trim(), locality: null };
  const before = address.slice(0, idx).trim();
  const after = address.slice(idx + 1).trim();
  if (!after) return { detailLine: address.trim(), locality: null };
  return { detailLine: before, locality: after };
}
