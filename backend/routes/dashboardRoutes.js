const express = require('express')
const router = express.Router()

const Disruption = require('../models/Disruption')
const ActionLog = require('../models/ActionLog')
const SupplyNode = require('../models/SupplyNode')
const SupplyRoute = require('../models/SupplyRoute')

// GET DASHBOARD
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user'

    // 🔥 Fetch everything in parallel
    const [disruptions, actions, nodes, routes] = await Promise.all([
      Disruption.find({ userId }).sort({ createdAt: -1 }).lean(),
      ActionLog.find({ userId }).sort({ createdAt: -1 }).lean(),
      SupplyNode.find({ userId }).lean(),
      SupplyRoute.find({ userId }).lean(),
    ])

    // 🔥 KPIs calculation
    const kpis = {
      activeDisruptionsCount: disruptions.length,
      delayedShipments: disruptions.reduce((sum, d) => sum + (d.delayedShipments || 0), 0),
      estimatedFinancialImpact: disruptions.reduce((sum, d) => sum + (d.estimatedFinancialImpact || 0), 0),
      averageDelayTime:
        disruptions.length > 0
          ? disruptions.reduce((sum, d) => sum + (d.averageDelayDays || 0), 0) / disruptions.length
          : 0,
      riskHeatmap: {
        high: disruptions.filter(d => d.severity >= 8).length,
        medium: disruptions.filter(d => d.severity >= 5 && d.severity < 8).length,
        low: disruptions.filter(d => d.severity < 5).length,
      },
    }

    // 🔥 Format response (frontend-friendly)
    const payload = {
      disruptions: disruptions.map(d => ({
        id: String(d._id),
        type: d.type,
        location: d.location,
        severity: d.severity,
        affectedNodes: d.affectedNodes || [],
        status: d.status,
        timestamp: d.createdAt,
      })),
      actions: actions.map(a => ({
        id: String(a._id),
        title: a.executedAction,
        status: a.status,
        createdAt: a.createdAt,
      })),
      supplyNodes: nodes.map(n => ({
        id: n.nodeId,
        name: n.name,
        x: n.x,
        y: n.y,
        type: n.type,
        status: n.status,
        riskScore: n.riskScore,
        capacity: n.capacity,
        region: n.region,
      })),
      supplyRoutes: routes.map(r => ({
        id: r._id,
        from: r.fromNodeId,
        to: r.toNodeId,
        status: r.status,
        mode: r.mode,
      })),
      kpis,
    }

    res.json(payload)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router