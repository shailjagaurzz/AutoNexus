const mongoose = require('mongoose');

const decisionOptionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    cost: { type: Number, required: true },
    delay: { type: Number, required: true },
    risk: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    disruptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disruption', required: true, index: true },
    options: [decisionOptionSchema],
    chosenAction: { type: String, required: true },
    cost: { type: Number, required: true },
    delay: { type: Number, required: true },
    risk: { type: Number, default: 0.1 },
    reasoning: { type: String, default: '' },
    score: { type: Number, default: 0 },
    rationale: {
      costWeight: { type: Number, default: 0.35 },
      delayWeight: { type: Number, default: 0.35 },
      riskWeight: { type: Number, default: 0.3 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Decision', decisionSchema);
