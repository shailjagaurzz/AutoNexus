function weightedScore({ cost, delay, risk }) {
  const normalizedCost = cost / 100000;
  const normalizedDelay = delay / 20;
  const normalizedRisk = risk;
  return Number((0.35 * normalizedCost + 0.35 * normalizedDelay + 0.3 * normalizedRisk).toFixed(4));
}

function decideAction({ userId, disruption, impact }) {
  const baseRisk = Math.min(0.95, 0.25 + disruption.severity / 12);

  const options = [
    {
      action: 'wait',
      cost: Math.round(impact.estimatedFinancialImpact * 0.35),
      delay: impact.averageDelayDays + 4,
      risk: Number(Math.min(0.99, baseRisk + 0.24).toFixed(2)),
    },
    {
      action: 'reroute',
      cost: Math.round(impact.delayedShipments * 78 + disruption.severity * 540),
      delay: Math.max(1, impact.averageDelayDays - 2),
      risk: Number(Math.max(0.12, baseRisk - 0.16).toFixed(2)),
    },
    {
      action: 'air_freight',
      cost: Math.round(impact.delayedShipments * 225 + disruption.severity * 1300),
      delay: 1,
      risk: Number(Math.max(0.08, baseRisk - 0.22).toFixed(2)),
    },
  ].map((option) => ({ ...option, score: weightedScore(option) }));

  const best = options.reduce((winner, option) => (option.score < winner.score ? option : winner), options[0]);

  const reasoning = [
    `Compared wait vs reroute vs air freight using weighted cost-delay-risk scoring.`,
    `Best option ${best.action} with score ${best.score}.`,
    `Projected cost $${best.cost.toLocaleString()}, delay ${best.delay}d, residual risk ${(best.risk * 100).toFixed(0)}%.`,
  ].join(' ');

  return {
    userId,
    options,
    action: best.action,
    cost: best.cost,
    delay: best.delay,
    risk: best.risk,
    score: best.score,
    reasoning,
    rationale: {
      costWeight: 0.35,
      delayWeight: 0.35,
      riskWeight: 0.3,
    },
  };
}

module.exports = { decideAction };