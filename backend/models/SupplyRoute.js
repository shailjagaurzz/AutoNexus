const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();

const { getSuppliers } = require("../controllers/supplierController");

const supplyRouteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    routeId: { type: String, required: true },
    fromNodeId: { type: String, required: true },
    toNodeId: { type: String, required: true },
    mode: {
      type: String,
      enum: ['ocean', 'air', 'rail', 'truck'],
      default: 'ocean',
    },
    status: {
      type: String,
      enum: ['active', 'delayed', 'disrupted'],
      default: 'active',
    },
    weeklyCapacityTeu: { type: Number, default: 0 },
    avgTransitDays: { type: Number, default: 0 },
    delayDays: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0.1 },
    flowPercent: { type: Number, default: 0.1 },
  },
  { timestamps: true }
);

supplyRouteSchema.index({ userId: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model('SupplyRoute', supplyRouteSchema);
