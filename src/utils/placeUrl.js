export function resolvePlaceUrl(place) {
  if (typeof place?.url === 'string' && /^https?:\/\//i.test(place.url)) {
    return place.url;
  }

  if (place?.externalPlaceId) {
    return `https://place.map.kakao.com/${encodeURIComponent(place.externalPlaceId)}`;
  }

  const lat = place?.latitude ?? place?.lat;
  const lng = place?.longitude ?? place?.lng;
  const name = place?.name ?? place?.place ?? '식당';
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
  }

  const query = [name, place?.address ?? place?.city].filter(Boolean).join(' ');
  return query ? `https://map.kakao.com/link/search/${encodeURIComponent(query)}` : null;
}
