const mongoose = require('mongoose');

const disruptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    scenarioKey: { type: String, default: '' },
    type: { type: String, required: true },
    category: { type: String, default: 'operational' },
    location: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 10 },
    probability: { type: Number, default: 0.5 },
    confidence: { type: Number, default: 0.5 },
    timestamp: { type: Date, default: Date.now },
    expectedDurationDays: { type: Number, default: 0 },
    affectedNodes: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'resolved', 'rejected'],
      default: 'open',
    },
    source: { type: String, default: 'manual' },
    estimatedFinancialImpact: { type: Number, default: 0 },
    delayedShipments: { type: Number, default: 0 },
    averageDelayDays: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disruption', disruptionSchema);
