const Disruption = require('../models/Disruption');
const { runPipeline } = require('../services/pipelineService');
const { SCENARIOS, generateDisruptionInput } = require('../services/scenarioService');
const { resolveUserContext, ensureUserData } = require('./dashboardController');

function disruptionToClient(disruption) {
  return {
    id: String(disruption._id),
    type: disruption.type,
    category: disruption.category,
    location: disruption.location,
    severity: disruption.severity,
    probability: disruption.probability,
    confidence: disruption.confidence,
    color: disruption.severity >= 8 ? 'red' : disruption.severity >= 5 ? 'amber' : 'green',
    affectedNodes: disruption.affectedNodes || [],
    estimatedFinancialImpact: disruption.estimatedFinancialImpact || 0,
    delayedShipments: disruption.delayedShipments || 0,
    averageDelayDays: disruption.averageDelayDays || 0,
    timestamp: disruption.timestamp,
    status: disruption.status,
    age: disruption.createdAt
      ? `${Math.max(1, Math.floor((Date.now() - new Date(disruption.createdAt).getTime()) / 60000))}m ago`
      : 'now',
  };
}

function getScenarioCatalog(req, res) {
  const scenarios = Object.entries(SCENARIOS).map(([key, value]) => ({
    key,
    label: value.eventType,
    category: value.category,
    location: value.location,
    severity: value.severity,
    probability: value.probability,
    confidence: value.confidence,
  }));

  return res.json({ scenarios });
}

async function getDisruptions(req, res) {
  const userContext = resolveUserContext(req);
  if (!userContext) {
    return res.status(400).json({ error: 'userId is required' });
  }

  await ensureUserData(userContext);

  const disruptions = await Disruption.find({ userId: userContext.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ disruptions: disruptions.map(disruptionToClient) });
}

async function createDisruption(req, res) {
  const userContext = resolveUserContext(req);
  if (!userContext) {
    return res.status(400).json({ error: 'userId is required' });
  }

  await ensureUserData(userContext);

  const input = generateDisruptionInput({
    userId: userContext.userId,
    disruptionInput: req.body || {},
  });

  if (!input.type || !input.location || Number.isNaN(input.severity)) {
    return res.status(400).json({ error: 'type, location, and severity are required' });
  }

  const io = req.app.get('io');
  const result = await runPipeline({
    userId: userContext.userId,
    disruptionInput: input,
    io,
  });

  return res.status(201).json(result);
}

module.exports = { getScenarioCatalog, getDisruptions, createDisruption };
