type LeafletModule = typeof import("leaflet");
export function isCoordinate(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function markerIcon(leaflet: LeafletModule, selected: boolean) {
  const size = selected ? 16 : 10;
  return leaflet.divIcon({
    className: "geo-map-marker",
    html: `<span data-slot="assistant-map-marker" data-selected="${selected}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
