const express = require('express');
const { runPipeline } = require('../services/pipelineService');
const { resolveUserContext, ensureUserData } = require('../controllers/dashboardController');

function createSimulateRouter() {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const userContext = resolveUserContext(req) || {
        userId: String(req.body.userId || 'demo-user'),
        name: String(req.body.name || 'Demo User'),
        company: String(req.body.company || 'Demo Company'),
        email: String(req.body.email || ''),
      };

      await ensureUserData(userContext);

      const eventType = req.body.eventType || req.body.type || 'Unknown Event';
      const io = req.app.get('io');

      const payload = await runPipeline({
        userId: userContext.userId,
        disruptionInput: {
          type: eventType,
          location: req.body.location || 'Unknown',
          severity: Number(req.body.severity || 5),
          affectedNodes: req.body.affectedNodes || [],
          revenueAtRisk: Number(req.body.revenueAtRisk || 0),
          delayDays: Number(req.body.delayDays || 0),
          source: 'simulation',
        },
        io,
      });

      return res.json(payload);

    } catch (error) {
      return res.status(500).json({
        error: 'Simulation failed',
        details: error.message,
      });
    }
  });

  return router;
}

module.exports = createSimulateRouter;