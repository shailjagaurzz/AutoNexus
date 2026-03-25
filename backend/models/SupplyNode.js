const mongoose = require('mongoose');

const supplyNodeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    nodeId: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['port', 'supplier', 'warehouse', 'hub'],
      required: true,
    },
    location: { type: String, required: true },
    region: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'delayed', 'disrupted'],
      default: 'active',
    },
    capacityUnits: { type: Number, default: 0 },
    utilizationRate: { type: Number, default: 0.5 },
    riskScore: { type: Number, default: 0.1 },
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
  },
  { timestamps: true }
);

supplyNodeSchema.index({ userId: 1, nodeId: 1 }, { unique: true });

module.exports = mongoose.model('SupplyNode', supplyNodeSchema);
