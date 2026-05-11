import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
