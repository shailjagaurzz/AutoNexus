function validateAction({ userId, decision, impact }) {
  if (decision.action === 'air_freight' && decision.cost > 550000) {
    return {
      userId,
      status: 'BLOCKED',
      reason: 'Air freight spend exceeds emergency transportation policy threshold.',
    };
  }

  if (impact.delayedShipments > 900 && decision.action === 'wait') {
    return {
      userId,
      status: 'WARNING',
      reason: 'Wait option creates significant customer delay exposure. Manual sign-off advised.',
    };
  }

  if (decision.risk > 0.75) {
    return {
      userId,
      status: 'WARNING',
      reason: 'Residual execution risk remains high after chosen action.',
    };
  }

  return {
    userId,
    status: 'APPROVED',
    reason: 'Decision is compliant with cost, delay, and risk guardrails.',
  };
}

module.exports = { validateAction };