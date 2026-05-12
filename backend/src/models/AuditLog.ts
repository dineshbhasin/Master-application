import crypto from 'crypto';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actor: string;
  actorEmail: string;
  action: string;
  module: string;
  target?: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  prevHash: string;
  hash: string;
  createdAt: Date;
}

function computeHash(entry: Partial<IAuditLog>): string {
  const payload = JSON.stringify({
    actor: entry.actor,
    action: entry.action,
    module: entry.module,
    target: entry.target,
    status: entry.status,
    prevHash: entry.prevHash,
    ts: entry.createdAt?.toISOString(),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    actor:       { type: String, default: 'system' },
    actorEmail:  { type: String, default: '' },
    action:      { type: String, required: true },
    module:      { type: String, default: 'system' },
    target:      { type: String },
    details:     { type: Schema.Types.Mixed },
    ip:          { type: String, default: 'unknown' },
    userAgent:   { type: String, default: 'unknown' },
    status:      { type: String, enum: ['success', 'failure'], default: 'success' },
    prevHash:    { type: String, default: '0' },
    hash:        { type: String, default: '' },
  },
  { timestamps: true }
);

AuditLogSchema.pre('save', function (next) {
  this.hash = computeHash(this);
  next();
});

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export { computeHash };
export default AuditLog;
