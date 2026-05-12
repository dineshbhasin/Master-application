import crypto from 'crypto';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IApiKey extends Document {
  organizationId: string;
  organizationName: string;
  keyHash: string;
  keyPrefix: string;
  label: string;
  scopes: string[];
  callsTotal: number;
  callsLast30d: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function generateRawKey(): string {
  return `ulip_${crypto.randomBytes(24).toString('hex')}`;
}

export function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

const ApiKeySchema: Schema<IApiKey> = new Schema(
  {
    organizationId:   { type: String, required: true },
    organizationName: { type: String, required: true },
    keyHash:          { type: String, required: true, unique: true, select: false },
    keyPrefix:        { type: String, required: true },
    label:            { type: String, default: 'Default' },
    scopes:           { type: [String], default: ['read'] },
    callsTotal:       { type: Number, default: 0 },
    callsLast30d:     { type: Number, default: 0 },
    lastUsedAt:       { type: Date },
    expiresAt:        { type: Date },
    isRevoked:        { type: Boolean, default: false },
    createdBy:        { type: String, default: 'system' },
  },
  { timestamps: true }
);

const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
export default ApiKey;
