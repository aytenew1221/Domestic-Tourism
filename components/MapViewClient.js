"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const destinationIcon = L.icon({
  iconUrl: "/images/leaflet/marker-icon.png",
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitMarkers({ places }) {
  const map = useMap();

  const coordinatesKey = useMemo(
    () =>
      places
        .map((place) => {
          const coordinates = place.coordinates;
          return Array.isArray(coordinates)
            ? `${coordinates[0]},${coordinates[1]}`
            : "";
        })
        .join("|"),
    [places],
  );

  useEffect(() => {
    if (places.length === 1) {
      map.setView(places[0].coordinates, 9);
    } else if (places.length > 1) {
      const bounds = L.latLngBounds(places.map((place) => place.coordinates));

      map.fitBounds(bounds, {
        padding: [25, 25],
        maxZoom: 10,
      });
    }
  }, [map, places, coordinatesKey]);

  return null;
}

export default function MapViewClient({ items = [] }) {
  const validPlaces = useMemo(
    () =>
      items.filter(
        (place) =>
          Array.isArray(place.coordinates) &&
          place.coordinates.length === 2 &&
          place.coordinates.every(
            (value) => typeof value === "number" && Number.isFinite(value),
          ),
      ),
    [items],
  );

  return (
    <div className="map-frame">
      <MapContainer
        center={[9.145, 40.4897]}
        zoom={5}
        scrollWheelZoom={false}
        style={{
          height: "480px",
          width: "100%",
          minHeight: "320px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMarkers places={validPlaces} />

        {validPlaces.map((place) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={destinationIcon}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.region}
              <br />
              {place.tagline}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
