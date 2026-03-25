const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    disruptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disruption', required: true, index: true },
    decisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Decision', required: true },
    executedAction: { type: String, required: true },
    status: {
      type: String,
      enum: ['executed', 'rejected', 'warning'],
      required: true,
    },
    effects: [{ type: String }],
    guardrailResult: {
      status: { type: String, required: true },
      reason: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActionLog', actionLogSchema);
