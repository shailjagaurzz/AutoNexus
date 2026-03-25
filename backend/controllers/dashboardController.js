const User = require('../models/User');
const SupplyNode = require('../models/SupplyNode');
const SupplyRoute = require('../models/SupplyRoute');
const Disruption = require('../models/Disruption');
const Decision = require('../models/Decision');
const ActionLog = require('../models/ActionLog');
const AuditLog = require('../models/AuditLog');
const { DEFAULT_SUPPLY_NODES, DEFAULT_SUPPLY_ROUTES } = require('../utils/defaultSupplyNodes');

function resolveUserContext(req) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const name = req.headers['x-user-name'] || req.query.name || '';
  const company = req.headers['x-user-company'] || req.query.company || '';
  const email = req.headers['x-user-email'] || req.query.email || '';

  if (!userId) {
    return null;
  }

  return {
    userId: String(userId),
    name: String(name),
    company: String(company),
    email: String(email),
  };
}

async function ensureUserData(userContext) {
  await User.findOneAndUpdate(
    { userId: userContext.userId },
    {
      userId: userContext.userId,
      name: userContext.name,
      company: userContext.company,
      email: userContext.email,
    },
    { upsert: true, new: true }
  );

  const [nodeCount, routeCount] = await Promise.all([
    SupplyNode.countDocuments({ userId: userContext.userId }),
    SupplyRoute.countDocuments({ userId: userContext.userId }),
  ]);

  if (nodeCount === 0) {
    await SupplyNode.insertMany(
      DEFAULT_SUPPLY_NODES.map((node) => ({ ...node, userId: userContext.userId })),
      { ordered: false }
    );
  }

  if (routeCount === 0) {
    await SupplyRoute.insertMany(
      DEFAULT_SUPPLY_ROUTES.map((route) => ({ ...route, userId: userContext.userId })),
      { ordered: false }
    );
  }
}

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

function getRiskHeatmap(nodes = []) {
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

async function getDashboard(req, res) {
  const userContext = resolveUserContext(req);
  if (!userContext) {
    return res.status(400).json({ error: 'userId is required' });
  }

  await ensureUserData(userContext);

  const [disruptions, decisions, actions, auditTrail, nodes, routes] = await Promise.all([
    Disruption.find({ userId: userContext.userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Decision.find({ userId: userContext.userId }).sort({ createdAt: -1 }).limit(50).lean(),
    ActionLog.find({ userId: userContext.userId }).sort({ createdAt: -1 }).limit(50).lean(),
    AuditLog.find({ userId: userContext.userId }).sort({ createdAt: -1 }).limit(250).lean(),
    SupplyNode.find({ userId: userContext.userId }).sort({ createdAt: 1 }).lean(),
    SupplyRoute.find({ userId: userContext.userId }).sort({ createdAt: 1 }).lean(),
  ]);

  const activeDisruptionsCount = disruptions.filter((d) => d.status === 'open').length;
  const delayedShipments = disruptions.reduce((sum, disruption) => sum + (disruption.delayedShipments || 0), 0);
  const estimatedFinancialImpact = disruptions.reduce(
    (sum, disruption) => sum + (disruption.estimatedFinancialImpact || 0),
    0
  );
  const averageDelayTime = disruptions.length
    ? Number(
        (
          disruptions.reduce((sum, disruption) => sum + (disruption.averageDelayDays || 0), 0) /
          disruptions.length
        ).toFixed(1)
      )
    : 0;

  return res.json({
    user: userContext,
    kpis: {
      activeDisruptionsCount,
      delayedShipments,
      estimatedFinancialImpact,
      averageDelayTime,
      riskHeatmap: getRiskHeatmap(nodes),
    },
    disruptions: disruptions.map(disruptionToClient),
    decisions: decisions.map((decision) => ({
      id: String(decision._id),
      disruptionId: String(decision.disruptionId),
      chosenAction: decision.chosenAction,
      options: decision.options,
      cost: decision.cost,
      delay: decision.delay,
      risk: decision.risk,
      reasoning: decision.reasoning,
      score: decision.score,
      createdAt: decision.createdAt,
    })),
    actions: actions.map((action) => ({
      id: String(action._id),
      disruptionId: String(action.disruptionId),
      title: action.executedAction,
      sub: `${action.status.toUpperCase()} | ${action.guardrailResult.reason}`,
      status: action.status,
      effects: action.effects || [],
      guardrail: action.guardrailResult.status,
      reason: action.guardrailResult.reason,
      createdAt: action.createdAt,
    })),
    auditTrail: auditTrail.map((row) => ({
      id: String(row._id),
      disruptionId: String(row.disruptionId),
      stage: row.stage,
      message: row.message,
      input: row.input,
      output: row.output,
      timestamp: row.createdAt,
    })),
    supplyNodes: nodes.map((node) => ({
      id: node.nodeId,
      name: node.name,
      type: node.type,
      location: node.location,
      region: node.region,
      status: node.status,
      capacity: node.capacityUnits,
      utilizationRate: node.utilizationRate,
      riskScore: node.riskScore,
      x: node.x,
      y: node.y,
    })),
    supplyRoutes: routes.map((route) => ({
      id: route.routeId,
      from: route.fromNodeId,
      to: route.toNodeId,
      mode: route.mode,
      status: route.status,
      weeklyCapacityTeu: route.weeklyCapacityTeu,
      avgTransitDays: route.avgTransitDays,
      delayDays: route.delayDays,
      riskScore: route.riskScore,
      flowPercent: route.flowPercent,
    })),
  });
}

module.exports = { getDashboard, resolveUserContext, ensureUserData };
