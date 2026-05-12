import mongoose, { Document, Model, Schema } from 'mongoose';

export type ErasureStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface IErasureRequest extends Document {
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
  dataCategories: string[];
  status: ErasureStatus;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNote?: string;
  anonymizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ErasureSchema: Schema<IErasureRequest> = new Schema(
  {
    userId:         { type: String, required: true },
    userEmail:      { type: String, required: true },
    userName:       { type: String, required: true },
    reason:         { type: String, required: true },
    dataCategories: { type: [String], default: ['profile', 'audit_logs', 'api_usage'] },
    status:         { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    requestedAt:    { type: Date, default: Date.now },
    reviewedAt:     { type: Date },
    reviewedBy:     { type: String },
    reviewNote:     { type: String },
    anonymizedAt:   { type: Date },
  },
  { timestamps: true }
);

const ErasureRequest: Model<IErasureRequest> =
  mongoose.models.ErasureRequest || mongoose.model<IErasureRequest>('ErasureRequest', ErasureSchema);
export default ErasureRequest;
