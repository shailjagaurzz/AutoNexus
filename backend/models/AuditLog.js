const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    disruptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disruption', required: true, index: true },
    stage: {
      type: String,
      enum: ['DETECTION', 'IMPACT', 'DECISION', 'GUARDRAIL', 'ACTION'],
      required: true,
    },
    input: { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
