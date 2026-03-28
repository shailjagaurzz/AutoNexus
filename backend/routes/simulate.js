const express = require('express');
const { runPipeline } = require('../services/pipelineService');
const { resolveUserContext, ensureUserData } = require('../controllers/dashboardController');
const { getSupplyChainNews } = require("../services/newService");

function createSimulateRouter() {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {

      // ✅ STEP 1: get user input event FIRST
      const eventType = req.body.eventType || req.body.type || 'Unknown Event';

      // ✅ STEP 2: fetch news
      const news = await getSupplyChainNews();
      const headline = news[0]?.title || "";
      console.log("News:", headline);

      // ✅ STEP 3: default event
      let detectedEvent = {
        type: eventType,
        location: req.body.location || "Unknown",
        severity: Number(req.body.severity || 5),
      };

      // ✅ STEP 4: override with news if match
      if (headline.toLowerCase().includes("typhoon")) {
        detectedEvent = {
          type: "Typhoon",
          location: "Asia Port",
          severity: 9,
        };
      } else if (headline.toLowerCase().includes("strike")) {
        detectedEvent = {
          type: "Port Strike",
          location: "Major Port",
          severity: 8,
        };
      } else if (headline.toLowerCase().includes("delay")) {
        detectedEvent = {
          type: "Logistics Delay",
          location: "Supply Chain",
          severity: 6,
        };
      }

      // ✅ STEP 5: user context
      const userContext = resolveUserContext(req) || {
        userId: String(req.body.userId || 'demo-user'),
        name: String(req.body.name || 'Demo User'),
        company: String(req.body.company || 'Demo Company'),
        email: String(req.body.email || ''),
      };

      await ensureUserData(userContext);

      const io = req.app.get('io');

      // ✅ STEP 6: USE detectedEvent here 🔥
      const payload = await runPipeline({
        userId: userContext.userId,
        disruptionInput: {
          type: detectedEvent.type,
          location: detectedEvent.location,
          severity: detectedEvent.severity,
          affectedNodes: req.body.affectedNodes || [],
          revenueAtRisk: Number(req.body.revenueAtRisk || 0),
          delayDays: Number(req.body.delayDays || 0),
          source: 'news', // 🔥 important
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