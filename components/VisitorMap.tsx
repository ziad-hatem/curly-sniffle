"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Location {
  name: string;
  // We would need lat/lon for markers, but the aggregated list only gives name count.
  // For this demo, let's just show a general center or if we had lat/lon data passed.
  // Actually, to show markers we need specific coordinates.
  // The current aggregated "locations" list in API is just Country Name -> Count.
  // To plot on map, we need Lat/Lon.
  // Let's verify if the API passes lat/lon. The recent visits do.
  // We can also potentially geocode the country name or simple center map roughly.
  // BETTER APPROACH: The visits have lat/lon. We can pass a sample of points or aggregate by lat/lon.
  // Let's modify the component to accept a list of points (lat, lon, info).
}

interface MapProps {
  points: { lat: number; lon: number; info: string }[];
}

export default function VisitorMap({ points }: MapProps) {
  if (!points || points.length === 0) {
    return (
      <div className="h-[400px] w-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        No location data available
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((pt, idx) => (
        <Marker key={idx} position={[pt.lat, pt.lon]} icon={icon}>
          <Popup>{pt.info}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
