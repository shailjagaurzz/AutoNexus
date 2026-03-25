function computeHeatmapBands(nodes) {
  return nodes.reduce(
    (acc, node) => {
      if (node.riskScore >= 0.7) acc.high += 1;
      else if (node.riskScore >= 0.4) acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );
}

function estimateImpact({ userId, detection, disruptionInput, supplyNodes = [], supplyRoutes = [] }) {
  const impactedNodeIds = (disruptionInput.affectedNodes || []).filter(Boolean);
  const affectedNodes = supplyNodes.filter((n) => impactedNodeIds.includes(n.nodeId));

  const touchedRoutes = supplyRoutes.filter(
    (route) => impactedNodeIds.includes(route.fromNodeId) || impactedNodeIds.includes(route.toNodeId)
  );

  const severityFactor = Math.max(1, detection.severity / 5);
  const delayedShipments = Math.round(
    touchedRoutes.reduce((sum, route) => sum + route.weeklyCapacityTeu * route.flowPercent, 0) * severityFactor
  );

  const averageDelayDays = Math.max(
    1,
    Math.round(
      (touchedRoutes.reduce((sum, route) => sum + route.avgTransitDays, 0) / Math.max(1, touchedRoutes.length)) *
        (detection.severity / 10)
    )
  );

  const estimatedFinancialImpact = Math.round(
    delayedShipments * 120 + affectedNodes.reduce((sum, n) => sum + n.capacityUnits * 0.8, 0) * 14
  );

  const heatmap = computeHeatmapBands(supplyNodes.map((node) => {
    const boostedRisk = impactedNodeIds.includes(node.nodeId)
      ? Math.min(1, node.riskScore + detection.severity / 15)
      : node.riskScore;
    return { ...node, riskScore: boostedRisk };
  }));

  const impactLevel =
    detection.severity >= 9 || estimatedFinancialImpact > 2500000
      ? 'high'
      : detection.severity >= 6
      ? 'medium'
      : 'low';

  return {
    userId,
    impactLevel,
    confidence: detection.confidence,
    delayedShipments,
    averageDelayDays,
    estimatedFinancialImpact,
    affectedNodes: impactedNodeIds,
    impactedRoutes: touchedRoutes.map((route) => route.routeId),
    heatmap,
    summary: `${impactLevel.toUpperCase()} impact: ${delayedShipments} delayed shipments, avg ${averageDelayDays}d delay, $${estimatedFinancialImpact.toLocaleString()} estimated impact`,
  };
}

module.exports = { estimateImpact };