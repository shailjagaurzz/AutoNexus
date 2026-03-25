const { normalizeSeverity } = require('./scenarioService');

function detectDisruption({ userId, disruptionInput }) {
  const severity = normalizeSeverity(disruptionInput.severity);
  const probability = Math.max(0.05, Math.min(0.99, Number(disruptionInput.probability || 0.6)));
  const confidence = Math.max(0.05, Math.min(0.99, Number(disruptionInput.confidence || 0.7)));

  const classification =
    severity >= 9 ? 'critical' : severity >= 7 ? 'high' : severity >= 4 ? 'medium' : 'low';

  return {
    userId,
    eventType: disruptionInput.type,
    category: disruptionInput.category || 'operational',
    location: disruptionInput.location,
    severity,
    probability: Number(probability.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    classification,
    expectedDurationDays: Number(disruptionInput.expectedDurationDays || 0),
    detectedAt: new Date().toISOString(),
  };
}

module.exports = { detectDisruption };