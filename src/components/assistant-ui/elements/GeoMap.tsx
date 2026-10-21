import { Button } from "../../Button.js";
import { isCoordinate, markerIcon } from "../utils/geoMap.js";
import type { JSX } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IGeoMapPlace {
  id: string;
  lat: number;
  lng: number;
  label: string;
  description?: string | undefined;
}
export interface IGeoMapRoute {
  id: string;
  points: readonly (readonly [lat: number, lng: number])[];
  label?: string | undefined;
}
export interface IGeoMapProps extends Omit<ComponentProps<"div">, "children" | "onSelect" | "className" | "style"> {
  places: readonly IGeoMapPlace[];
  routes?: readonly IGeoMapRoute[] | undefined;
  selectedId?: string | undefined;
  onSelect?: ((id: string) => void) | undefined;
  theme?: "light" | "dark" | "auto" | undefined;
  tileUrl?: string | undefined;
  attribution?: string | undefined;
  height?: number | undefined;
  variant?: "default" | "embedded";
}
type LeafletModule = typeof import("leaflet");
type Coordinate = [lat: number, lng: number];
const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION = "© OpenStreetMap contributors";
export function GeoMap({
  places,
  routes,
  selectedId,
  onSelect,
  theme = "auto",
  tileUrl,
  attribution,
  height = 260,
  variant = "default",
  ...props
}: IGeoMapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const markersRef = useRef(new Map<string, LeafletMarker>());
  const [mapReady, setMapReady] = useState(false);
  const mapContent = useMemo(() => {
    const validPlaces = places.filter((place) => isCoordinate(place.lat, place.lng));
    const routePoints: Coordinate[] = [];
    const validRoutes =
      routes
        ?.map((route) => {
          const points = route.points
            .filter(([lat, lng]) => isCoordinate(lat, lng))
            .map(([lat, lng]) => [lat, lng] satisfies Coordinate);
          routePoints.push(...points);
          return { ...route, points };
        })
        .filter((route) => route.points.length > 1) ?? [];
    return {
      signature: JSON.stringify([
        places.map((place) => [place.id, place.lat, place.lng, place.label, place.description]),
        routes?.map((route) => [route.id, route.points, route.label]) ?? [],
      ]),
      validPlaces,
      routePoints,
      validRoutes,
    };
  }, [places, routes]);
  const { signature: contentSignature, validPlaces } = mapContent;
  const mapContentRef = useRef(mapContent);
  mapContentRef.current = mapContent;
  const resolvedTileUrl = tileUrl ?? DEFAULT_TILE_URL;
  const resolvedAttribution = attribution ?? DEFAULT_ATTRIBUTION;
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<string | undefined>(() => validPlaces[0]?.id);
  const activeId =
    selectedId ??
    (validPlaces.some((place) => place.id === uncontrolledSelectedId) ? uncontrolledSelectedId : validPlaces[0]?.id);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const selectPlace = useCallback(
    (place: IGeoMapPlace) => {
      if (selectedId === undefined) setUncontrolledSelectedId(place.id);
      onSelect?.(place.id);
      mapRef.current?.panTo([place.lat, place.lng]);
    },
    [onSelect, selectedId],
  );
  const selectPlaceRef = useRef(selectPlace);
  selectPlaceRef.current = selectPlace;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let cancelled = false;
    let map: LeafletMap | null = null;
    setMapReady(false);
    void (async () => {
      const leaflet = await import("leaflet");
      if (cancelled) return;
      leafletRef.current = leaflet;
      map = leaflet.map(container, { keyboard: true });
      mapRef.current = map;
      leaflet
        .tileLayer(resolvedTileUrl, {
          attribution: resolvedAttribution,
        })
        .addTo(map);
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current === map) mapRef.current = null;
      map?.remove();
    };
  }, [resolvedAttribution, resolvedTileUrl]);
  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map || !mapReady) return;
    const { routePoints, validPlaces, validRoutes } = mapContentRef.current;
    const markers = markersRef.current;
    const layer = leaflet.layerGroup().addTo(map);
    const points: Coordinate[] = [
      ...validPlaces.map((place) => [place.lat, place.lng] satisfies Coordinate),
      ...routePoints,
    ];
    const [first] = points;
    if (points.length === 1 && first) {
      map.setView(first, 13);
    } else if (points.length > 1) {
      map.fitBounds(leaflet.latLngBounds(points), { padding: [24, 24] });
    } else {
      map.setView([0, 0], 2);
    }
    for (const route of validRoutes) {
      const polyline = leaflet
        .polyline(route.points, {
          color: "var(--muted-foreground)",
          weight: 2,
        })
        .addTo(layer);
      if (route.label) {
        const label = document.createElement("span");
        label.textContent = route.label;
        polyline.bindTooltip(label);
        const path = polyline.getElement();
        path?.setAttribute("role", "graphics-symbol");
        path?.setAttribute("aria-label", route.label);
        path?.setAttribute("tabindex", "0");
      }
    }
    for (const place of validPlaces) {
      const marker = leaflet
        .marker([place.lat, place.lng], {
          icon: markerIcon(leaflet, place.id === activeIdRef.current),
          title: place.label,
        })
        .addTo(layer)
        .on("click", () => selectPlaceRef.current(place));
      markers.set(place.id, marker);
    }
    return () => {
      markers.clear();
      layer.remove();
    };
  }, [contentSignature, mapReady]);
  useEffect(() => {
    const leaflet = leafletRef.current;
    if (!leaflet) return;
    for (const place of mapContentRef.current.validPlaces) {
      markersRef.current.get(place.id)?.setIcon(markerIcon(leaflet, place.id === activeId));
    }
  }, [activeId, contentSignature]);
  return (
    <div
      data-testid="GeoMap"
      data-slot="geo-map"
      className={cn(paper, "flex w-full flex-col overflow-hidden rounded-md p-2", variant === "default" && "max-w-sm")}
      {...props}
    >
      <div
        data-slot="assistant-map"
        data-native-tiles={tileUrl === undefined || undefined}
        ref={containerRef}
        role="region"
        aria-label={`Map of ${validPlaces.length} places`}
        aria-busy={!mapReady || undefined}
        style={{ height }}
        data-theme={theme}
        className={cn(field, "relative overflow-hidden rounded-md")}
      >
        {!mapReady ? (
          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            Loading map
          </span>
        ) : null}
      </div>

      <ol className="mt-2 flex flex-col gap-0.5">
        {validPlaces.map((place) => {
          const selected = place.id === activeId;
          return (
            <li key={place.id}>
              <Button
                variant="ghost"
                align="start"
                type="button"
                aria-current={selected || undefined}
                onClick={() => selectPlace(place)}
              >
                <span className="min-w-0 flex-1">
                  <span className="text-foreground/90 block text-base leading-5 break-words">{place.label}</span>
                  {place.description ? (
                    <span className="text-muted-foreground block text-sm leading-4 break-words">
                      {place.description}
                    </span>
                  ) : null}
                </span>
                {variant === "default" ? (
                  <span
                    data-slot="geo-map-coordinates"
                    className={cn(mono, "text-muted-foreground shrink-0 pt-0.5 tabular-nums")}
                  >
                    {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  </span>
                ) : null}
              </Button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
