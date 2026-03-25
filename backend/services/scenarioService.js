const SCENARIOS = {
  typhoon: {
    eventType: 'Typhoon Affecting Port Operations',
    category: 'weather',
    location: 'Shanghai Port, China',
    severity: 9,
    probability: 0.82,
    confidence: 0.88,
    affectedNodeIds: ['n-shanghai-port', 'n-shenzhen-supplier', 'n-shanghai-warehouse'],
    expectedDurationDays: 7,
    notes: 'Port gate operations reduced due to typhoon warnings and berth congestion.',
  },
  supplier_shutdown: {
    eventType: 'Tier-1 Supplier Shutdown',
    category: 'supplier',
    location: 'Shenzhen, China',
    severity: 8,
    probability: 0.74,
    confidence: 0.84,
    affectedNodeIds: ['n-shenzhen-supplier', 'n-hochiminh-supplier'],
    expectedDurationDays: 12,
    notes: 'Regulatory audit triggered abrupt production halt at semiconductor supplier.',
  },
  port_strike: {
    eventType: 'Labor Strike at Destination Port',
    category: 'labor',
    location: 'Rotterdam Port, Netherlands',
    severity: 7,
    probability: 0.68,
    confidence: 0.81,
    affectedNodeIds: ['n-rotterdam-port', 'n-eu-dc'],
    expectedDurationDays: 5,
    notes: 'Union action expected to reduce unloading throughput by over 45%.',
  },
};

function normalizeSeverity(value) {
  const n = Number(value || 5);
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function pseudoRandomIndex(seedString, max) {
  if (!max) return 0;
  let hash = 0;
  for (let i = 0; i < seedString.length; i += 1) {
    hash = (hash * 31 + seedString.charCodeAt(i)) % 2147483647;
  }
  return hash % max;
}

function generateDisruptionInput({ userId, disruptionInput = {} }) {
  const keys = Object.keys(SCENARIOS);
  const scenarioKey = disruptionInput.scenarioKey && SCENARIOS[disruptionInput.scenarioKey]
    ? disruptionInput.scenarioKey
    : keys[pseudoRandomIndex(`${userId}:${new Date().toISOString().slice(0, 13)}`, keys.length)];

  const base = SCENARIOS[scenarioKey];
  const severity = normalizeSeverity(disruptionInput.severity ?? base.severity);

  return {
    scenarioKey,
    type: String(disruptionInput.type || base.eventType),
    category: String(disruptionInput.category || base.category),
    location: String(disruptionInput.location || base.location),
    severity,
    probability: Number((disruptionInput.probability ?? base.probability).toFixed(2)),
    confidence: Number((disruptionInput.confidence ?? base.confidence).toFixed(2)),
    expectedDurationDays: Number(disruptionInput.expectedDurationDays || base.expectedDurationDays),
    affectedNodes: Array.isArray(disruptionInput.affectedNodes) && disruptionInput.affectedNodes.length
      ? disruptionInput.affectedNodes
      : base.affectedNodeIds,
    notes: String(disruptionInput.notes || base.notes),
    source: String(disruptionInput.source || 'signal-simulator'),
    timestamp: disruptionInput.timestamp ? new Date(disruptionInput.timestamp) : new Date(),
  };
}

module.exports = { SCENARIOS, generateDisruptionInput, normalizeSeverity };
