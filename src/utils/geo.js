// 0.5 단위로 스냅하고 0.5~30km 범위로 보정
export function normDistance(raw) {
  let n = parseFloat(raw);
  if (Number.isNaN(n)) n = 0.5;
  n = Math.round(n * 2) / 2;
  n = Math.min(30, Math.max(0.5, n));
  return n;
}

// OpenStreetMap Nominatim 정방향 지오코딩 (예: "선릉역")
export async function geocodePlace(query) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=ko&limit=1`,
  );
  const j = await r.json();
  if (Array.isArray(j) && j.length) {
    return { lat: +parseFloat(j[0].lat).toFixed(6), lng: +parseFloat(j[0].lon).toFixed(6) };
  }
  return null;
}

// 역방향 지오코딩 → 짧은 주소 문자열
export async function reverseGeocode(lat, lng) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko&zoom=16`,
  );
  const j = await r.json();
  if (j && j.display_name) {
    const addr = j.display_name.split(',').map((x) => x.trim()).filter(Boolean).reverse().slice(1, 4).join(' ');
    return addr || j.display_name;
  }
  return null;
}
