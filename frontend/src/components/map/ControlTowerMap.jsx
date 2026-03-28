import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

const GOOD = 'good'
const DISRUPTED = 'disrupted'

function normalizeStatus(status) {
  return status === DISRUPTED ? DISRUPTED : GOOD
}

function toLatLng(node) {
  if (Number.isFinite(node?.lat) && Number.isFinite(node?.lng)) {
    return [node.lat, node.lng]
  }

  // Backend currently sends x/y coordinates on an 800x420 canvas.
  const x = Number.isFinite(node?.x) ? node.x : 400
  const y = Number.isFinite(node?.y) ? node.y : 210

  const lng = -180 + (x / 800) * 360
  const lat = 85 - (y / 420) * 170

  return [lat, lng]
}

function MapAutoResize({ watchKey }) {
  const map = useMap()

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ pan: false, animate: false })
    invalidate()

    const observer = new ResizeObserver(invalidate)
    const container = map.getContainer()

    observer.observe(container)
    if (container.parentElement) {
      observer.observe(container.parentElement)
    }

    window.addEventListener('resize', invalidate)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', invalidate)
    }
  }, [map, watchKey])

  return null
}

function FitToData({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    if (points.length === 1) {
      map.setView(points[0], 4)
      return
    }

    map.fitBounds(points, { padding: [30, 30], maxZoom: 6 })
  }, [map, points])

  return null
}

export default function ControlTowerMap({ nodes = [], routes = [], highlightedNodeIds = [] }) {
  const normalizedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        normalizedStatus: normalizeStatus(node.status),
        latLng: toLatLng(node),
      })),
    [nodes]
  )

  const nodeLookup = useMemo(
    () => new Map(normalizedNodes.map((node) => [node.id, node])),
    [normalizedNodes]
  )

  const normalizedRoutes = useMemo(
    () =>
      routes
        .map((route) => {
          const fromNode = nodeLookup.get(route.from)
          const toNode = nodeLookup.get(route.to)
          if (!fromNode || !toNode) return null

          const disrupted =
            route.status === DISRUPTED ||
            highlightedNodeIds.includes(route.from) ||
            highlightedNodeIds.includes(route.to)

          return {
            ...route,
            normalizedStatus: disrupted ? DISRUPTED : GOOD,
            positions: [fromNode.latLng, toNode.latLng],
          }
        })
        .filter(Boolean),
    [routes, nodeLookup, highlightedNodeIds]
  )

  const fitPoints = useMemo(
    () => normalizedNodes.map((node) => node.latLng),
    [normalizedNodes]
  )

  const watchKey = `${normalizedNodes.length}:${normalizedRoutes.length}`

  return (
    <div className="control-map-shell">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="control-map"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapAutoResize watchKey={watchKey} />
        <FitToData points={fitPoints} />

        {normalizedRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            pathOptions={{
              color: route.normalizedStatus === DISRUPTED ? '#ef4444' : '#22c55e',
              weight: route.normalizedStatus === DISRUPTED ? 4 : 3,
              opacity: route.normalizedStatus === DISRUPTED ? 0.95 : 0.75,
            }}
          >
            <Popup>
              <div>
                <strong>{route.id}</strong>
                <div>Status: {route.normalizedStatus}</div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {normalizedNodes.map((node) => {
          const disrupted =
            node.normalizedStatus === DISRUPTED || highlightedNodeIds.includes(node.id)

          return (
            <CircleMarker
              key={node.id}
              center={node.latLng}
              radius={disrupted ? 8 : 6}
              pathOptions={{
                color: disrupted ? '#ef4444' : '#22c55e',
                fillColor: disrupted ? '#ef4444' : '#22c55e',
                fillOpacity: disrupted ? 0.85 : 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <strong>{node.name}</strong>
                  <div>Status: {disrupted ? DISRUPTED : GOOD}</div>
                  <div>Type: {node.type}</div>
                  <div>Region: {node.region || 'n/a'}</div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}