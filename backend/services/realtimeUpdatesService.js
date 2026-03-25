// Add this to backend/services/realtimeUpdatesService.js
const SupplyNode = require('../models/SupplyNode');
const SupplyRoute = require('../models/SupplyRoute');
const Disruption = require('../models/Disruption');

// Broadcast live node status changes
async function broadcastNodeStatusChange(io, userId, nodeId, newStatus, change) {
  io.to(String(userId)).emit('node_update', {
    nodeId,
    status: newStatus,
    timestamp: new Date(),
    change, // e.g., { riskScore: 0.72, utilizationRate: 0.85 }
  });
}

// Broadcast live route metrics
async function broadcastRouteUpdate(io, userId, routeId, updates) {
  io.to(String(userId)).emit('route_update', {
    routeId,
    ...updates,
    timestamp: new Date(),
  });
}

// Broadcast disruption status changes
async function broadcastDisruptionUpdate(io, userId, disruption) {
  io.to(String(userId)).emit('disruption_update', {
    disruption: {
      id: disruption.id,
      status: disruption.status,
      severity: disruption.severity,
      delayedShipments: disruption.delayedShipments,
      estimatedFinancialImpact: disruption.estimatedFinancialImpact,
      updatedAt: new Date(),
    },
  });
}

// Broadcast network-wide metrics snapshot
async function broadcastNetworkMetrics(io, userId) {
  try {
    const nodes = await SupplyNode.find({ userId });
    const disruptions = await Disruption.find({ userId, status: 'open' });

    const metrics = {
      timestamp: new Date(),
      activeDisruptions: disruptions.length,
      totalDelayedShipments: disruptions.reduce((sum, d) => sum + (d.delayedShipments || 0), 0),
      totalFinancialImpact: disruptions.reduce((sum, d) => sum + (d.estimatedFinancialImpact || 0), 0),
      networkRiskAverage: nodes.length > 0 
        ? (nodes.reduce((sum, n) => sum + (n.riskScore || 0), 0) / nodes.length) 
        : 0,
      healthyNodes: nodes.filter(n => n.riskScore <= 0.4).length,
      riskNodes: nodes.filter(n => n.riskScore > 0.7).length,
    };

    io.to(String(userId)).emit('network_metrics', metrics);
  } catch (error) {
    console.error('Error broadcasting network metrics:', error);
  }
}

// Interval-based broadcasts (emit every 10 seconds)
function startNetworkMetricsEmitter(io, userId) {
  return setInterval(() => {
    broadcastNetworkMetrics(io, userId);
  }, 10000);
}

module.exports = {
  broadcastNodeStatusChange,
  broadcastRouteUpdate,
  broadcastDisruptionUpdate,
  broadcastNetworkMetrics,
  startNetworkMetricsEmitter,
};
