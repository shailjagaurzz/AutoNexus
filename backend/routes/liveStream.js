// backend/routes/liveStream.js - Endpoint to start broadcasting live metrics
const express = require('express');
const { startNetworkMetricsEmitter } = require('../services/realtimeUpdatesService');

const activeEmitters = new Map(); // Track emitters per user

function createLiveStreamRouter() {
  const router = express.Router();

  // Start streaming live metrics for this user
  router.post('/start', (req, res) => {
    const userId = req.body.userId || req.headers['user-id'] || 'demo-user';
    const io = req.app.get('io');

    if (activeEmitters.has(userId)) {
      return res.status(400).json({ error: 'Stream already active for this user' });
    }

    const intervalId = startNetworkMetricsEmitter(io, userId);
    activeEmitters.set(userId, intervalId);

    res.json({
      message: 'Live stream started',
      userId,
      interval: '10 seconds',
    });
  });

  // Stop streaming for this user
  router.post('/stop', (req, res) => {
    const userId = req.body.userId || req.headers['user-id'] || 'demo-user';

    if (activeEmitters.has(userId)) {
      clearInterval(activeEmitters.get(userId));
      activeEmitters.delete(userId);
      return res.json({ message: 'Live stream stopped', userId });
    }

    res.status(400).json({ error: 'No active stream for this user' });
  });

  // Get current stream status
  router.get('/status/:userId', (req, res) => {
    const userId = req.params.userId;
    const isActive = activeEmitters.has(userId);

    res.json({
      userId,
      streaming: isActive,
      emitterCount: activeEmitters.size,
    });
  });

  return router;
}

module.exports = createLiveStreamRouter;
