import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { io } from 'socket.io-client'

export function useRealtimeUpdates(user) {
  const setSupplyNodes = useStore(s => s.setSupplyNodes)
  const setSupplyRoutes = useStore(s => s.setSupplyRoutes)
  const addOrUpdateDisruption = useStore(s => s.addOrUpdateDisruption)
  const setKpis = useStore(s => s.setKpis)
  const addLog = useStore(s => s.addLog)

  useEffect(() => {
    if (!user?.id) return

    const socket = io('http://localhost:4000', {
      auth: { userId: user.id },
      query: { userId: user.id },
    })

    // Listen for node status changes
    socket.on('node_update', (data) => {
      setSupplyNodes(prevNodes =>
        prevNodes.map(n =>
          n.id === data.nodeId 
            ? { ...n, status: data.status, ...data.change }
            : n
        )
      )
      addLog(`Node ${data.nodeId} updated to ${data.status}`, 'info')
    })

    // Listen for route metrics changes
    socket.on('route_update', (data) => {
      setSupplyRoutes(prevRoutes =>
        prevRoutes.map(r =>
          r.id === data.routeId 
            ? { ...r, ...data }
            : r
        )
      )
    })

    // Listen for disruption status changes
    socket.on('disruption_update', (data) => {
      addOrUpdateDisruption(data.disruption)
      addLog(`Disruption updated: ${data.disruption.status}`, 'warn')
    })

    // Listen for network-wide metrics
    socket.on('network_metrics', (metrics) => {
      setKpis({
        activeDisruptionsCount: metrics.activeDisruptions,
        delayedShipments: metrics.totalDelayedShipments,
        estimatedFinancialImpact: metrics.totalFinancialImpact,
        averageDelayTime: 0, // Computed separately
        riskHeatmap: {
          high: metrics.riskNodes,
          medium: 0,
          low: metrics.healthyNodes,
        },
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [user, setSupplyNodes, setSupplyRoutes, addOrUpdateDisruption, setKpis, addLog])
}
