export function googleMapsSearchUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city}`)}`;
}
