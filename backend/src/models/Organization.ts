import mongoose, { Document, Model, Schema } from 'mongoose';

export type OrgTier = 'government' | 'enterprise' | 'sme';
export type OrgStatus = 'active' | 'suspended' | 'pending';

export interface OrgModules {
  vehicleIntel: boolean;
  fastag: boolean;
  compliance: boolean;
  tracking: boolean;
  routePlanner: boolean;
  exim: boolean;
  identity: boolean;
  esgTracker: boolean;
  railLogistics: boolean;
}

export interface IOrganization extends Document {
  name: string;
  domain: string;
  tier: OrgTier;
  status: OrgStatus;
  adminEmail: string;
  modules: OrgModules;
  dataRegion: string;
  createdAt: Date;
  updatedAt: Date;
}

const defaultModules: OrgModules = {
  vehicleIntel: true,
  fastag: true,
  compliance: false,
  tracking: false,
  routePlanner: false,
  exim: false,
  identity: false,
  esgTracker: false,
  railLogistics: false,
};

const OrgSchema: Schema<IOrganization> = new Schema(
  {
    name:        { type: String, required: true, trim: true },
    domain:      { type: String, required: true, trim: true },
    tier:        { type: String, enum: ['government', 'enterprise', 'sme'], default: 'sme' },
    status:      { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
    adminEmail:  { type: String, required: true, lowercase: true, trim: true },
    modules:     { type: Schema.Types.Mixed, default: defaultModules },
    dataRegion:  { type: String, default: 'in-west1' },
  },
  { timestamps: true }
);

const Organization: Model<IOrganization> =
  mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrgSchema);
export default Organization;
