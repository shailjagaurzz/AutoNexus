import { Fragment, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useStore } from "../../store/useStore";
import LeftPanel from "../layout/LeftPanel";
import CenterPanel from "../layout/CenterPannel";
import RightPanel from "../layout/RightPanel";

import {
  MapContainer,
  TileLayer,
  Popup,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// FIX MARKER ICON
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// AUTO MOVE MAP
function FlyToCountry({ country }) {
  const map = useMap();

  useEffect(() => {
    if (!country) return;

    fetch(
      `https://nominatim.openstreetmap.org/search?country=${country}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.length) return;

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        map.setView([lat, lon], 5);
        setTimeout(() => map.invalidateSize(), 200);
      });
  }, [country, map]);

  return null;
}

// FETCH DASHBOARD
export async function getDashboard(user) {
  const res = await fetch(
    `http://localhost:4000/api/dashboard?userId=${user.id}`
  );
  return res.json();
}

export default function ControlTowerView() {
  const { user } = useAuth();
  const hydrateDashboard = useStore((s) => s.hydrateDashboard);
  const graph = useStore((s) => s.graph);

  // ✅ FIX: persistent selection state (this fixes your disappearing info bug)
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDashboard() {
      const data = await getDashboard(user);
      hydrateDashboard(data);
    }

    loadDashboard();
  }, [user, hydrateDashboard]);

  const country = graph?.country || "India";
  const suppliers = graph?.suppliers || [];

  // =========================
  // OPTIMIZED FLATTENING
  // =========================
  const allNodes = useMemo(() => {
    return suppliers.flatMap((s) =>
      (s.nodes || []).map((n) => ({
        ...n,
        id: `${s.id}-${n.id}`,
        supplierId: s.id,
        supplierName: s.name,
      }))
    );
  }, [suppliers]);

  const nodeMap = useMemo(() => {
    const map = new Map();
    allNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [allNodes]);

  const allRoutes = useMemo(() => {
    return suppliers.flatMap((s) =>
      (s.routes || []).map((r) => ({
        ...r,
        fromId: `${s.id}-${r.fromId}`,
        toId: `${s.id}-${r.toId}`,
        supplierId: s.id,
      }))
    );
  }, [suppliers]);

  // =========================
  // COLORS
  // =========================
  const getNodeColor = (status) => {
    if (status === "disrupted") return "#ef4444";
    if (status === "delayed") return "#facc15";
    return "#22c55e";
  };

  const getRouteStyle = (status) => {
    if (status === "disrupted") {
      return {
        color: "#ff8c42",
        weight: 5,
        opacity: 0.9,
        dashArray: "10,10",
      };
    }

    if (status === "delayed") {
      return {
        color: "#ffb347",
        weight: 4,
        opacity: 0.8,
        dashArray: "6,8",
      };
    }

    return {
      color: "#90ee90",
      weight: 4,
      opacity: 0.75,
    };
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 350px",
        height: "100vh",
        overflow: "hidden",
        background: "#0b1220",
      }}
    >
      <LeftPanel />

      {/* CENTER */}
      <div style={{ overflow: "hidden", padding: 10 }}>
        {/* MAP */}
        <div
          style={{
            height: 420,
            borderRadius: 14,
            overflow: "hidden",
            background: "#0b1220",
            boxShadow: "0 0 20px rgba(0,255,200,0.15)",
            border: "1px solid rgba(0,255,200,0.2)",
          }}
        >
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            <FlyToCountry country={country} />

            {/* ================= ROUTES ================= */}
            {allRoutes.map((r, i) => {
              const from = nodeMap.get(r.fromId);
              const to = nodeMap.get(r.toId);

              if (!from || !to) return null;

              const style = getRouteStyle(r.status);

              return (
                <Polyline
                  key={i}
                  positions={[
                    [from.lat, from.lng],
                    [to.lat, to.lng],
                  ]}
                  pathOptions={style}
                  eventHandlers={{
                    click: () =>
                      setSelected({
                        type: "route",
                        data: r,
                        from,
                        to,
                      }),
                  }}
                />
              );
            })}

            {/* ================= NODES ================= */}
            {allNodes.map((node) => (
              <CircleMarker
                key={node.id}
                center={[node.lat, node.lng]}
                radius={8}
                pathOptions={{
                  color: getNodeColor(node.status),
                  fillColor: getNodeColor(node.status),
                  fillOpacity: 0.9,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () =>
                    setSelected({
                      type: "node",
                      data: node,
                    }),
                }}
              >
                <Popup>
                  <b>{node.name}</b>
                  <br />
                  {node.supplierName}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <CenterPanel />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <RightPanel selected={selected} />
    </div>
  );
}