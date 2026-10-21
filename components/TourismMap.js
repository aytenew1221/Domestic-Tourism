"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const destinations = [
  {
    name: "Lake Tana",
    position: [11.6, 37.35],
  },
  {
    name: "Fasil Ghebbi",
    position: [12.607, 37.46],
  },
  {
    name: "Blue Nile Falls",
    position: [11.49, 37.59],
  },
];

export default function TourismMap() {
  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[11.6, 37.35]}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {destinations.map((destination) => (
          <Marker key={destination.name} position={destination.position}>
            <Popup>{destination.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
