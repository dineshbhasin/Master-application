import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  action: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    userId:    { type: String },
    action:    { type: String, required: true },
    details:   { type: Schema.Types.Mixed },
    ip:        { type: String, default: 'unknown' },
    userAgent: { type: String, default: 'unknown' },
    status:    { type: String, enum: ['success', 'failure'], default: 'success' },
  },
  { timestamps: true }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
