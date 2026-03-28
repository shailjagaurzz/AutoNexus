import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline
} from "react-leaflet";

import { useEffect } from "react";
import { useStore } from "../../store/useStore";
import "leaflet/dist/leaflet.css";

const STATUS_COLORS = {
  disrupted: "#ff3d3d",
  delayed: "#ffb300",
  active: "#00e676",
  "in-transit": "#29b6f6",
};

export default function SupplyMap() {
  const {
    supplyNodes,
    setSupplyNodes,
    setSelectedSupplier,
    selectedDisruption
  } = useStore();

  useEffect(() => {
    fetch("http://localhost:4000/api/suppliers/map?product=steel&country=India")
      .then(res => res.json())
      .then(data => setSupplyNodes(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {/* =========================
          SUPPLY NODES
      ========================= */}
      {supplyNodes.map((s, i) => {
        const lat = s.location?.lat;
        const lng = s.location?.lng;
        if (!lat || !lng) return null;

        const color = STATUS_COLORS[s.status] || "#00e676";

        return (
          <CircleMarker
            key={i}
            center={[lat, lng]}
            radius={8}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: 2,
            }}
            eventHandlers={{
              click: () => setSelectedSupplier(s),
            }}
          >
            <Popup>
              <b>{s.name}</b><br />
              {s.city}, {s.state}<br />
              <span style={{ color, fontWeight: 600 }}>
                {(s.status || "active").toUpperCase()}
              </span>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* =========================
          DEFAULT ROUTE (ALL SUPPLY CHAIN)
      ========================= */}
      <Polyline
        positions={supplyNodes
          .map(s => [s.location?.lat, s.location?.lng])
          .filter(p => p[0] && p[1])}
        pathOptions={{
          color: "#29b6f6",
          weight: 1,
          opacity: 0.4,
          dashArray: "4 4",
        }}
      />

      {/* =========================
          🔥 SELECTED DISRUPTION ROUTE
      ========================= */}
      {selectedDisruption?.route && (
        <Polyline
          positions={selectedDisruption.route}
          pathOptions={{
            color: "#ff3d3d",
            weight: 5,
            opacity: 0.9,
          }}
        />
      )}
    </MapContainer>
  );
}