const { detectDisruption } = require('./detectionService');
const { estimateImpact } = require('./aiService');
const { decideAction } = require('./decisionService');
const { validateAction } = require('./guardrailService');

const Disruption = require('../models/Disruption');
const Decision = require('../models/Decision');
const ActionLog = require('../models/ActionLog');
const AuditLog = require('../models/AuditLog');
const SupplyNode = require('../models/SupplyNode');
const SupplyRoute = require('../models/SupplyRoute');

function toSeverityColor(severity) {
  if (severity >= 8) return 'red';
  if (severity >= 5) return 'amber';
  return 'green';
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeReasoningMessage(stage, output) {
  if (stage === 'DETECTION') {
    return `Signal detected: ${output.eventType} at ${output.location} (p=${output.probability}, c=${output.confidence})`;
  }

  if (stage === 'IMPACT') {
    return `${output.summary}`;
  }

  if (stage === 'DECISION') {
    return `Decision selected: ${output.action} (cost $${output.cost}, delay ${output.delay}d, risk ${(output.risk * 100).toFixed(0)}%)`;
  }

  if (stage === 'GUARDRAIL') {
    return `Guardrail result: ${output.status} - ${output.reason}`;
  }

  return 'Action execution completed with network updates.';
}

function buildActionEffects({ action, impact }) {
  if (action === 'reroute') {
    return [
      `Rerouted ${Math.round(impact.delayedShipments * 0.7)} shipments to alternate corridors.`,
      'Carrier bookings amended and destination ETAs recalculated.',
      'Supplier and customer operations teams notified automatically.',
    ];
  }

  if (action === 'air_freight') {
    return [
      `Expedited ${Math.max(12, Math.round(impact.delayedShipments * 0.25))} critical shipments via air freight.`,
      'Inventory prioritized for high-margin SKUs and SLA contracts.',
      'Finance alerted for emergency transportation budget tracking.',
    ];
  }

  return [
    'Action deferred while monitoring disruption trajectory.',
    'Customer service notified of potential ETA degradation.',
    'Safety-stock thresholds raised to absorb downstream risk.',
  ];
}

async function saveAudit({ userId, disruptionId, stage, input, output }) {
  return AuditLog.create({
    userId,
    disruptionId,
    stage,
    input,
    output,
    message: makeReasoningMessage(stage, output),
  });
}

async function updateNetworkForDisruption({ userId, impactedNodeIds, actionStatus, decision, impact }) {
  const impactedNodes = await SupplyNode.find({ userId, nodeId: { $in: impactedNodeIds } });

  for (const node of impactedNodes) {
    const nextRisk = Math.min(1, node.riskScore + impact.averageDelayDays / 40);
    node.riskScore = nextRisk;
    node.status = actionStatus === 'rejected' ? 'disrupted' : impact.averageDelayDays > 2 ? 'delayed' : 'active';
    node.utilizationRate = Math.min(0.99, node.utilizationRate + 0.08);
    await node.save();
  }

  const touchedRoutes = await SupplyRoute.find({
    userId,
    $or: [{ fromNodeId: { $in: impactedNodeIds } }, { toNodeId: { $in: impactedNodeIds } }],
  });

  for (const route of touchedRoutes) {
    if (decision.action === 'reroute' && route.mode === 'ocean') {
      route.status = 'delayed';
      route.delayDays = Math.max(1, impact.averageDelayDays - 2);
      route.riskScore = Math.min(1, route.riskScore + 0.08);
    } else if (decision.action === 'air_freight' && route.mode === 'air') {
      route.status = 'active';
      route.delayDays = 0;
      route.riskScore = Math.max(0.1, route.riskScore - 0.05);
    } else if (actionStatus === 'rejected') {
      route.status = 'disrupted';
      route.delayDays = impact.averageDelayDays;
      route.riskScore = Math.min(1, route.riskScore + 0.12);
    }
    await route.save();
  }
}

async function runPipeline({ userId, disruptionInput, io }) {
  const disruption = await Disruption.create({
    userId,
    scenarioKey: disruptionInput.scenarioKey || '',
    type: disruptionInput.type,
    category: disruptionInput.category || 'operational',
    location: disruptionInput.location,
    severity: disruptionInput.severity,
    probability: disruptionInput.probability,
    confidence: disruptionInput.confidence,
    expectedDurationDays: disruptionInput.expectedDurationDays || 0,
    affectedNodes: disruptionInput.affectedNodes || [],
    source: disruptionInput.source || 'manual',
    notes: disruptionInput.notes || '',
    timestamp: disruptionInput.timestamp || new Date(),
  });

  const [supplyNodes, supplyRoutes] = await Promise.all([
    SupplyNode.find({ userId }).lean(),
    SupplyRoute.find({ userId }).lean(),
  ]);

  const detection = detectDisruption({ userId, disruptionInput });
  const detectionAudit = await saveAudit({
    userId,
    disruptionId: disruption._id,
    stage: 'DETECTION',
    input: disruptionInput,
    output: detection,
  });

  io?.to(userId).emit('agent_update', {
    stage: 'DETECTION',
    data: detection,
    disruptionId: disruption._id,
    timestamp: detectionAudit.createdAt,
  });

  await pause(300);

  const impact = estimateImpact({ userId, detection, disruptionInput, supplyNodes, supplyRoutes });
  const impactAudit = await saveAudit({
    userId,
    disruptionId: disruption._id,
    stage: 'IMPACT',
    input: detection,
    output: impact,
  });

  io?.to(userId).emit('agent_update', {
    stage: 'IMPACT',
    data: impact,
    disruptionId: disruption._id,
    timestamp: impactAudit.createdAt,
  });

  await pause(300);

  const decision = decideAction({ userId, disruption: { ...disruption.toObject() }, impact });
  const decisionDoc = await Decision.create({
    userId,
    disruptionId: disruption._id,
    options: decision.options,
    chosenAction: decision.action,
    cost: decision.cost,
    delay: decision.delay,
    risk: decision.risk,
    reasoning: decision.reasoning,
    score: decision.score,
    rationale: decision.rationale,
  });

  const decisionAudit = await saveAudit({
    userId,
    disruptionId: disruption._id,
    stage: 'DECISION',
    input: impact,
    output: decision,
  });

  io?.to(userId).emit('agent_update', {
    stage: 'DECISION',
    data: decision,
    disruptionId: disruption._id,
    timestamp: decisionAudit.createdAt,
  });

  await pause(300);

  const guardrail = validateAction({ userId, decision, impact });
  const guardrailAudit = await saveAudit({
    userId,
    disruptionId: disruption._id,
    stage: 'GUARDRAIL',
    input: decision,
    output: guardrail,
  });

  io?.to(userId).emit('agent_update', {
    stage: 'GUARDRAIL',
    data: guardrail,
    disruptionId: disruption._id,
    timestamp: guardrailAudit.createdAt,
  });

  const actionStatus =
    guardrail.status === 'APPROVED'
      ? 'executed'
      : guardrail.status === 'WARNING'
      ? 'warning'
      : 'rejected';

  const effects = buildActionEffects({ action: decision.action, impact });

  const actionLog = await ActionLog.create({
    userId,
    disruptionId: disruption._id,
    decisionId: decisionDoc._id,
    executedAction: decision.action,
    status: actionStatus,
    effects,
    guardrailResult: guardrail,
  });

  await updateNetworkForDisruption({
    userId,
    impactedNodeIds: impact.affectedNodes,
    actionStatus,
    decision,
    impact,
  });

  const actionAudit = await saveAudit({
    userId,
    disruptionId: disruption._id,
    stage: 'ACTION',
    input: { decision, guardrail },
    output: {
      executedAction: decision.action,
      status: actionStatus,
      effects,
      guardrailResult: guardrail,
    },
  });

  const updatedDisruption = await Disruption.findByIdAndUpdate(
    disruption._id,
    {
      affectedNodes: impact.affectedNodes,
      status: actionStatus === 'rejected' ? 'rejected' : 'resolved',
      estimatedFinancialImpact: impact.estimatedFinancialImpact,
      delayedShipments: impact.delayedShipments,
      averageDelayDays: impact.averageDelayDays,
    },
    { new: true }
  ).lean();

  const payload = {
    disruption: {
      id: String(updatedDisruption._id),
      type: updatedDisruption.type,
      category: updatedDisruption.category,
      location: updatedDisruption.location,
      severity: updatedDisruption.severity,
      probability: updatedDisruption.probability,
      confidence: updatedDisruption.confidence,
      color: toSeverityColor(updatedDisruption.severity),
      affectedNodes: updatedDisruption.affectedNodes,
      estimatedFinancialImpact: updatedDisruption.estimatedFinancialImpact,
      delayedShipments: updatedDisruption.delayedShipments,
      averageDelayDays: updatedDisruption.averageDelayDays,
      timestamp: updatedDisruption.timestamp,
      status: updatedDisruption.status,
      age: 'just now',
    },
    decision: {
      id: String(decisionDoc._id),
      disruptionId: String(updatedDisruption._id),
      options: decision.options,
      chosenAction: decision.action,
      cost: decision.cost,
      delay: decision.delay,
      risk: decision.risk,
      reasoning: decision.reasoning,
      score: decision.score,
    },
    action: {
      id: String(actionLog._id),
      disruptionId: String(updatedDisruption._id),
      title: decision.action.replace('_', ' '),
      sub: `${updatedDisruption.location} | cost $${decision.cost.toLocaleString()} | delay ${decision.delay}d | risk ${(decision.risk * 100).toFixed(0)}%`,
      status: actionStatus,
      guardrail: guardrail.status,
      reason: guardrail.reason,
      effects,
      createdAt: actionLog.createdAt,
    },
    guardrail,
    auditLog: [detectionAudit, impactAudit, decisionAudit, guardrailAudit, actionAudit].map((row) => ({
      id: String(row._id),
      stage: row.stage,
      message: row.message,
      input: row.input,
      output: row.output,
      timestamp: row.createdAt,
    })),
  };

  io?.to(userId).emit('event_complete', payload);

  return payload;
}

module.exports = { runPipeline };
